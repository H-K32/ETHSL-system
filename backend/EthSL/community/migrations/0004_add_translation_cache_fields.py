# Generated migration for translation cache fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('community', '0003_report_created_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='am_title',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='post',
            name='am_content',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='comment',
            name='am_content',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='am_reason',
            field=models.TextField(blank=True, null=True),
        ),
    ]
