from django.db import models
from django.conf import settings
from courses.models import Level

User = settings.AUTH_USER_MODEL


class Certificate(models.Model):

    learner = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    level = models.ForeignKey(
        Level,
        on_delete=models.CASCADE
    )

    certificate_id = models.CharField(
        max_length=100,
        unique=True
    )

    issued_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            'learner',
            'level'
        )

    def __str__(self):
        return f"{self.learner.username} - {self.level.name}"
