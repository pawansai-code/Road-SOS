import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()

from apps.users.models.user_profile import UserProfile
from apps.emergency_contacts.models.contact import EmergencyContact
from apps.emergency_contacts.serializers.contact_serializer import EmergencyContactSerializer

try:
    user = UserProfile.objects.get(firebase_uid='test_user_123')
except UserProfile.DoesNotExist:
    user = UserProfile.objects.create(firebase_uid='test_user_123', full_name='Test Name')

data = {
    'contact_name': 'Test',
    'relationship': 'Test',
    'phone_number': '123'
}

serializer = EmergencyContactSerializer(data=data)
if serializer.is_valid():
    try:
        serializer.save(user=user)
        print("Success!")
    except Exception as e:
        print(f"Error: {type(e).__name__} - {e}")
else:
    print(serializer.errors)
