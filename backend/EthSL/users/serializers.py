from rest_framework import serializers
from .models import User, UserReport



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "full_name",
            "level",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        full_name = validated_data.pop("full_name", "")

        email = validated_data["email"]
        level = validated_data.get("level", "beginner")

        user = User(
            username=email,
            email=email,
            level=level,
        )

        user.set_password(password)

        # split name
        if full_name:
            parts = full_name.split(" ", 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ""

        # placement logic
        user.placement_required = level in ["intermediate", "advanced"]
        user.placement_passed = level == "beginner"

        user.save()
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