import re
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class AdminProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "full_name"]

    def validate_username(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Username is required.")
        # Only letters, numbers, underscores, hyphens — no special chars like @
        if not re.match(r'^[\w.-]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, underscores, hyphens, and dots."
            )
        # Check uniqueness excluding current user
        qs = User.objects.filter(username__iexact=value).exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Email is required.")
        qs = User.objects.filter(email__iexact=value).exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_full_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Full name is required.")
        if re.search(r'\d', value):
            raise serializers.ValidationError("Full name cannot contain numbers.")
        if not re.match(r"^[A-Za-z\s\-'\.]+$", value):
            raise serializers.ValidationError("Full name can only contain letters, spaces, hyphens, and apostrophes.")
        return value

    def update(self, instance, validated_data):
        full_name = validated_data.pop("full_name", None)
        if full_name is not None:
            parts = full_name.strip().split(" ", 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ""

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["full_name"] = f"{instance.first_name} {instance.last_name}".strip()
        return data
