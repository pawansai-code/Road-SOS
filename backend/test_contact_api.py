import os
import django
from django.test import Client
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()

client = Client()

response = client.post(
    '/api/contacts/',
    data=json.dumps({
        'contact_name': 'Test Contact',
        'relationship': 'Brother',
        'phone_number': '1234567890'
    }),
    content_type='application/json',
    HTTP_X_FIREBASE_UID='dummy_user_123'
)

print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.content.decode('utf-8')}")
