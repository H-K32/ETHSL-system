from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):

    # ✅ ADD THIS
    username = models.CharField(
        max_length=255,
        unique=True
    )

    ROLE_CHOICE = (
        ('learner', 'Learner'),
        ('admin', 'Admin'),
    )

    LEVEL_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )

    email_verified = models.BooleanField(default=False)
    profile_completed = models.BooleanField(default=False)

    gender = models.CharField(
        max_length=10,
        choices=[
            ("male", "Male"),
            ("female", "Female")
        ],
        null=True,
        blank=True
    )

    email = models.EmailField(unique=True)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICE,
        default='learner'
    )

    streak_count = models.IntegerField(default=0)

    warning_message = models.TextField(
        null=True,
        blank=True
    )

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default='beginner'
    )

    placement_required = models.BooleanField(default=False)
    placement_passed = models.BooleanField(default=False)

    avatar = models.ImageField(
        upload_to="image/avatar/",
        null=True,
        blank=True,
        default=None
    )

    country = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    bio = models.TextField(
        null=True,
        blank=True
    )

    learning_goal = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    learning_style = models.CharField(
        max_length=50,
        choices=[
            ("visual", "Visual"),
            ("audio", "Audio"),
            ("reading", "Reading"),
            ("practice", "Practice-based"),
        ],
        null=True,
        blank=True
    )

    daily_study_time = models.CharField(
        max_length=50,
        choices=[
            ("15min", "15 minutes"),
            ("30min", "30 minutes"),
            ("1hr", "1 hour"),
            ("2hr+", "2+ hours"),
        ],
        null=True,
        blank=True
    )

    def __str__(self):
        return self.username

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def requires_placement_test(self):
        return (
            self.level in ["intermediate", "advanced"]
            and not self.placement_passed
        )
        
        
class EmailChangeToken(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='email_change_tokens'
    )
    new_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_expired(self):
        from django.utils import timezone
        from datetime import timedelta
        return timezone.now() > self.created_at + timedelta(hours=24)

    def __str__(self):
        return f"{self.user.username} -> {self.new_email}"


class UserReport(models.Model):
    reporter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reports_made"
    )

    reported_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reports_received"
    )

    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reporter} -> {self.reported_user}"