from rest_framework import serializers
from .models import User, UserReport
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth import get_user_model
from django.db import IntegrityError
 

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    full_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "password2",
            "full_name",
            "level",
            "gender",
        ]

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, data):
        password = data.get("password")
        password2 = data.get("password2")

        if password and password2 and password != password2:
            raise serializers.ValidationError({"password": "Passwords do not match"})

        return data
    def create(self, validated_data):
        validated_data.pop("password2")

        password = validated_data.pop("password")
        full_name = validated_data.pop("full_name", "")

        email = validated_data["email"]
        level = validated_data.get("level") or "beginner"
        gender = validated_data.get("gender", None)

        # ✅ prevent duplicate crash cleanly
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                {"email": "User with this email already exists"}
            )

        try:
            user = User(
                username=email,
                email=email,
                level=level,
                gender=gender
            )

            user.set_password(password)

            if full_name:
                parts = full_name.split(" ", 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ""

            user.placement_required = level in ["intermediate", "advanced"]
            user.placement_passed = level == "beginner"

            user.save()

        except IntegrityError:
            raise serializers.ValidationError(
                {"email": "User already exists (database constraint)"}
            )

        # email verification
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        verify_link = "https://ethsl-system-jl5a.vercel.app/verify-email/{}/{}/".format(uid, token)

        send_mail(
            subject="Verify your email",
            message=f"Click to verify: {verify_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

        return user
    
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=False)
    warning_message = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "streak_count",
            "avatar",
            "full_name",
            "warning_message",
            "level",
            "placement_required",
            "is_active",
            
        ]
        read_only_fields = ["username", "role", "streak_count"]

    def update(self, instance, validated_data):
        full_name = validated_data.pop("full_name", None)

        if full_name:
            parts = full_name.split(" ", 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ""

        return super().update(instance, validated_data)
# users/serializers.py

class UserReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReport
        fields = ["id", "reported_user", "reason"]