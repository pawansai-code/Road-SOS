import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute('ALTER TABLE emergency_contacts DROP CONSTRAINT IF EXISTS emergency_contacts_user_id_fkey;')
    cursor.execute('ALTER TABLE emergency_contacts ADD CONSTRAINT emergency_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES "USERS"(id) ON DELETE CASCADE;')
    print("Database FK fixed!")
