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
    permission_classes = [AllowAny]
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs["email"]

        try:
            user = User.objects.get(
                email=email,
                role="admin",
                is_active=True
            )

            uid = urlsafe_base64_encode(
                smart_bytes(user.id)
            )

            token = PasswordResetTokenGenerator().make_token(
                user
            )

            reset_link = (
                f"{settings.FRONTEND_URL}"
                f"/admin-reset-password/"
                f"{uid}/{token}"
            )

            send_mail(
                subject="Admin Password Reset",
                message=(
                    "Click the link below to reset "
                    f"your admin password:\n\n"
                    f"{reset_link}"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
            )

        except User.DoesNotExist:
            pass

        return attrs
    
    
class AdminPasswordResetConfirmSerializer(
    serializers.Serializer
):
    permission_classes = [AllowAny]
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
                    "Invalid token"
                )

            user.set_password(
                attrs["password"]
            )

            user.save()

        except Exception:
            raise serializers.ValidationError(
                "Invalid reset link"
            )

        return attrs