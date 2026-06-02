from django.db import models
from django.core.validators import MinValueValidator


class Level(models.Model):
    LEVEL_CHOICES = (
        ("beginner", "ጀማሪ"),
        ("intermediate", "መካከለኛ"),
        ("advanced", "ከፍተኛ"),
    )

    name = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    order = models.IntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class Course(models.Model):
    level = models.ForeignKey(
        Level,
        on_delete=models.CASCADE,
        related_name='courses'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='lessons'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    video = models.FileField(upload_to='videos/lesson/')
    order = models.PositiveIntegerField()
    duration = models.CharField(max_length=50, null=True, blank=True)
    thumbnail = models.ImageField(upload_to="images/lesson_thumbnails/", null=True, blank=True)

    class Meta:
        ordering = ['order']
        unique_together = ('course', 'order')

    def __str__(self):
        return self.title


class Quiz(models.Model):
    lesson = models.OneToOneField(
        Lesson,
        on_delete=models.CASCADE,
        related_name="quiz",
        null=True,
        blank=True
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="quizzes",
        null=True,
        blank=True
    )

    # 🔥 FIX: allow multiple quizzes per level
    level = models.ForeignKey(
        Level,
        on_delete=models.CASCADE,
        related_name="quizzes",
        null=True,
        blank=True
    )

    quiz_type = models.CharField(
        max_length=30,
        choices=[
            ("placement", "Placement"),
            ("lesson", "Lesson"),
            ("final", "Final")
        ],
        default="lesson"
    )

    description = models.TextField()
    passing_score = models.IntegerField(validators=[MinValueValidator(1)])

    class Meta:
        constraints = [
            # One quiz per course (course-level, not lesson-level)
            models.UniqueConstraint(
                fields=["course"],
                condition=models.Q(lesson__isnull=True),
                name="unique_quiz_per_course"
            ),
            # One final quiz per level
            models.UniqueConstraint(
                fields=["level", "quiz_type"],
                condition=models.Q(
                    lesson__isnull=True,
                    course__isnull=True,
                    quiz_type="final"
                ),
                name="unique_final_quiz_per_level"
            ),
            # One placement test per level
            models.UniqueConstraint(
                fields=["level", "quiz_type"],
                condition=models.Q(
                    lesson__isnull=True,
                    course__isnull=True,
                    quiz_type="placement"
                ),
                name="unique_placement_quiz_per_level"
            ),
        ]

    def __str__(self):
        if self.lesson:
            return f"Lesson Quiz - {self.lesson.title}"
        elif self.course:
            return f"Course Quiz - {self.course.title}"
        elif self.level:
            return f"{self.level.name} - {self.quiz_type}"
        return "Quiz"

class Question(models.Model):
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="questions"
    )
    question_text = models.TextField(blank=True, null=True)
    question_image = models.ImageField(upload_to="images/question/", blank=True, null=True)
    question_video = models.FileField(upload_to="videos/question/", blank=True, null=True)
    points = models.IntegerField(default=1, validators=[MinValueValidator(1)])

class Option(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="options"
    )
    option_text = models.TextField(blank=True, null=True)
    option_image = models.ImageField(upload_to="images/option/", blank=True, null=True)
    option_video = models.FileField(upload_to="videos/option/", blank=True, null=True)
    is_correct = models.BooleanField(default=False)