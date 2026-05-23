from django.db import models

class UserProfile(models.Model):
    # Django automatically adds `id` (BigAutoField) which matches the schema's `id BIGINT`
    firebase_uid = models.CharField(max_length=128, unique=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    blood_group = models.CharField(max_length=10)
    medical_notes = models.TextField(blank=True, null=True)
    profile_image = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'USERS'

    def __str__(self):
        return self.full_name
