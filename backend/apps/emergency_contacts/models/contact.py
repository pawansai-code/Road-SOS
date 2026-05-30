import uuid
from django.db import models
from apps.users.models.user_profile import UserProfile

class EmergencyContact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, db_column='user_id')
    contact_name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'emergency_contacts'
        managed = False # Table already exists in DB

    def __str__(self):
        return f"{self.contact_name} ({self.relationship}) - {self.phone_number}"
