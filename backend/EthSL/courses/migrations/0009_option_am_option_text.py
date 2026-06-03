from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0008_translation_cache_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='option',
            name='am_option_text',
            field=models.TextField(blank=True, null=True),
        ),
    ]
