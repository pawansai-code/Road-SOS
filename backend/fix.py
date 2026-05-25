import os
from dotenv import load_dotenv
load_dotenv()
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("DELETE FROM django_migrations WHERE app='services';")
    print('Deleted migration records')
