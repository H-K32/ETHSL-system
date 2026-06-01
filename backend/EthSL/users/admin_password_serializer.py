from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import smart_bytes
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from rest_framework import serializers
from django.conf import settings
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
 

User = get_user_model()


class AdminPasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
class AdminPasswordResetConfirmSerializer(
    serializers.Serializer
):
     
    password = serializers.CharField()
    uidb64 = serializers.CharField()
    token = serializers.CharField()

    def validate(self, attrs):

        try:
            uid = force_str(
                urlsafe_base64_decode(
                    attrs["uidb64"]
                )
            )

            user = User.objects.get(
                id=uid,
                role="admin"
            )

            token_valid = (
                PasswordResetTokenGenerator()
                .check_token(
                    user,
                    attrs["token"]
                )
            )

            if not token_valid:
                raise serializers.ValidationError(
                    "Invalid or expired token."
                )

            new_password = attrs["password"]

            # Password strength validation
            from django.contrib.auth.password_validation import validate_password
            from django.core.exceptions import ValidationError as DjangoValidationError
            try:
                validate_password(new_password, user)
            except DjangoValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})

            # Prevent reusing current password
            if user.check_password(new_password):
                raise serializers.ValidationError(
                    {"password": "Can't use a password you've used before. Please choose a new password."}
                )

            user.set_password(new_password)
            user.save()

        except serializers.ValidationError:
            raise

        except Exception:
            raise serializers.ValidationError(
                "Invalid reset link"
            )

        return attrs