from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

User = get_user_model()


# ---------------- REQUEST RESET ----------------
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


# ---------------- CONFIRM RESET ----------------
class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    token = serializers.CharField()
    uidb64 = serializers.CharField()

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            user = User.objects.get(id=uid)

            # check token validity
            if not PasswordResetTokenGenerator().check_token(user, attrs['token']):
                raise serializers.ValidationError("Invalid or expired token")

            new_password = attrs['password']

            # ---------------- PASSWORD VALIDATION ----------------
            try:
                validate_password(new_password, user)
            except DjangoValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})

            # ---------------- PREVENT REUSING OLD PASSWORD ----------------
            if user.check_password(new_password):
                raise serializers.ValidationError(
                    {"password": "You cannot use your previous password."}
                )

            attrs['user'] = user
            return attrs

        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid reset link")

        except serializers.ValidationError:
            raise

        except Exception:
            raise serializers.ValidationError("Invalid reset link")

    def save(self):
        user = self.validated_data['user']
        password = self.validated_data['password']

        user.set_password(password)
        user.save()
        _blacklist_all_tokens(user)
        return user


def _blacklist_all_tokens(user):
    """Blacklist all outstanding refresh tokens for a user."""
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
    tokens = OutstandingToken.objects.filter(user=user)
    for token in tokens:
        BlacklistedToken.objects.get_or_create(token=token)