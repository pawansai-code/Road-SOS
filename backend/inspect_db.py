import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sos_incidents';")
    print('INCIDENT SCHEMA:', cursor.fetchall())
