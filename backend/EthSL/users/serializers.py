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

    full_name = serializers.CharField(
        required=False,
        allow_blank=True
    )

    level = serializers.CharField(
        required=False
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "password2",
            "full_name",
            "level",
            "gender",
        ]

    # ---------------- PASSWORD VALIDATION ----------------
    def validate_password(self, value):
        validate_password(value)
        return value

    # ---------------- GLOBAL VALIDATION ----------------
    def validate(self, data):

        password = data.get("password")
        password2 = data.get("password2")

        if password != password2:
            raise serializers.ValidationError({
                "password": "Passwords do not match"
            })

        return data

    # ---------------- CREATE USER ----------------
    def create(self, validated_data):

        # remove unused field
        validated_data.pop("password2")

        password = validated_data.pop("password")

        full_name = validated_data.pop("full_name", "")

        username = validated_data.get("username")

        email = validated_data.get("email")

        level = validated_data.get("level") or "beginner"

        gender = validated_data.get("gender", None)

        # ---------------- DUPLICATE EMAIL ----------------
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                "email": "User with this email already exists"
            })

        # ---------------- DUPLICATE USERNAME ----------------
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                "username": "Username already exists"
            })

        try:

            user = User(
                username=username,
                email=email,
                level=level,
                gender=gender,
                is_active=False
                
            )

            # hash password
            user.set_password(password)

            # split full name
            if full_name:
                parts = full_name.split(" ", 1)

                user.first_name = parts[0]

                user.last_name = (
                    parts[1] if len(parts) > 1 else ""
                )

            # placement logic
            user.placement_required = (
                level in ["intermediate", "advanced"]
            )

            user.placement_passed = (
                level == "beginner"
            )

            user.save()

        except IntegrityError:
            raise serializers.ValidationError({
                "detail": "Database integrity error"
            })

        return user
    
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=False)
    warning_message = serializers.CharField(read_only=True)
    avatar = serializers.SerializerMethodField()
    avatar_upload = serializers.ImageField(write_only=True, required=False, allow_null=True, source='avatar')

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
            "avatar_upload",
            "full_name",
            "warning_message",
            "level",
            "placement_required",
            "placement_passed",
            "is_active",
            "profile_completed",
        ]
        read_only_fields = ["username", "role", "streak_count"]

    def get_avatar(self, obj):
        if obj.avatar:
            val = str(obj.avatar)
            if val.startswith('http'):
                return val
            return None
        return None

    def update(self, instance, validated_data):
        full_name = validated_data.pop("full_name", None)
        if full_name:
            parts = full_name.split(" ", 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ""

        avatar = validated_data.pop("avatar", None)
        if avatar:
            import cloudinary.uploader
            result = cloudinary.uploader.upload(
                avatar,
                folder="images/avatar",
                resource_type="image"
            )
            instance.avatar = result["secure_url"]
            instance.save()

        return super().update(instance, validated_data)
class UserReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReport
        fields = ["id", "reported_user", "reason"]


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """Accept either username or email in the username field."""

    def validate(self, attrs):
        login = attrs.get(self.username_field, "").strip()

        # Resolve email to username, then check verification
        if "@" in login:
            try:
                user_obj = User.objects.get(email__iexact=login)
                attrs[self.username_field] = user_obj.username
            except User.DoesNotExist:
                raise AuthenticationFailed("No active account found with the given credentials")
        else:
            try:
                user_obj = User.objects.get(username=login)
            except User.DoesNotExist:
                user_obj = None

        if user_obj and not user_obj.is_active:
            raise AuthenticationFailed("account_inactive")

        try:
            return super().validate(attrs)
        except AuthenticationFailed:
            raise AuthenticationFailed("invalid_credentials")