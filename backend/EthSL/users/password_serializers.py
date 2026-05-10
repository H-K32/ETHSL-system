from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import smart_bytes, smart_str, force_str
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from rest_framework import serializers
from django.conf import settings


User = get_user_model()

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get('email')

        try:
            user = User.objects.get(email=email)

            uid = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)

            reset_link = f"http://127.0.0.1:8000/api/users/password-reset-confirm/{uid}/{token}/"

            send_mail(
                subject="Password Reset Request",
                message=f"Use this link to reset your password: {reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
            )

        except User.DoesNotExist:
             
            pass

        return attrs 
        
class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    token = serializers.CharField()
    uidb64 = serializers.CharField()
    
    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            user = User.objects.get(id=uid)

            if not PasswordResetTokenGenerator().check_token(user, attrs['token']):
                raise serializers.ValidationError("Invalid or expired token")

            user.set_password(attrs['password'])
            user.save()

        except Exception:
            raise serializers.ValidationError("Invalid reset link")

        return attrs