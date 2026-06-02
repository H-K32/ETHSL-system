from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0004_alter_lesson_thumbnail_alter_lesson_video_and_more'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='quiz',
            constraint=models.UniqueConstraint(
                condition=models.Q(lesson__isnull=True),
                fields=['course'],
                name='unique_quiz_per_course',
            ),
        ),
        migrations.AddConstraint(
            model_name='quiz',
            constraint=models.UniqueConstraint(
                condition=models.Q(
                    lesson__isnull=True,
                    course__isnull=True,
                    quiz_type='final',
                ),
                fields=['level', 'quiz_type'],
                name='unique_final_quiz_per_level',
            ),
        ),
        migrations.AddConstraint(
            model_name='quiz',
            constraint=models.UniqueConstraint(
                condition=models.Q(
                    lesson__isnull=True,
                    course__isnull=True,
                    quiz_type='placement',
                ),
                fields=['level', 'quiz_type'],
                name='unique_placement_quiz_per_level',
            ),
        ),
    ]
