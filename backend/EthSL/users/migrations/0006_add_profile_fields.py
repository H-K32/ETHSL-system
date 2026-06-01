# Generated migration for profile fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_alter_user_username'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='country',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='bio',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='learning_goal',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='learning_style',
            field=models.CharField(
                blank=True,
                choices=[
                    ('visual', 'Visual'),
                    ('audio', 'Audio'),
                    ('reading', 'Reading'),
                    ('practice', 'Practice-based'),
                ],
                max_length=50,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='daily_study_time',
            field=models.CharField(
                blank=True,
                choices=[
                    ('15min', '15 minutes'),
                    ('30min', '30 minutes'),
                    ('1hr', '1 hour'),
                    ('2hr+', '2+ hours'),
                ],
                max_length=50,
                null=True,
            ),
        ),
    ]
