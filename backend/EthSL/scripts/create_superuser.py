#!/usr/bin/env python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
username = 'admin@example.com'
password = 'AdminPass123!'
email = 'admin@example.com'
if User.objects.filter(username=username).exists():
    print('SUPERUSER_EXISTS')
else:
    User.objects.create_superuser(username=username, email=email, password=password)
    print('SUPERUSER_CREATED')
