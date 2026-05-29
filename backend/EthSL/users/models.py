from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICE = (
        ('learner', 'Learner'),
        ('admin', 'Admin'),
    )

    LEVEL_CHOICES = (
        ('beginner', 'ጀማሪ'),
        ('intermediate', 'መካከለኛ'),
        ('advanced', 'ከፍተኛ'),
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
    role = models.CharField(max_length=20, choices=ROLE_CHOICE, default='learner')

    streak_count = models.IntegerField(default=0)
    warning_message = models.TextField(null=True, blank=True)

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default='beginner'
    )

    placement_required = models.BooleanField(default=False)
    placement_passed = models.BooleanField(default=False)

    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True,
        default="avatars/default.png"
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