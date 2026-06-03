from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0007_course_am_description_course_am_title_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='level',
            name='am_display_name',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='quiz',
            name='am_description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='question',
            name='am_question_text',
            field=models.TextField(blank=True, null=True),
        ),
    ]
