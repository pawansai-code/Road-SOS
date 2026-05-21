from django.db import models

class UserProfile(models.Model):
    # Using a simple integer or UUID as primary key is standard, assuming there's a User relation eventually.
    # user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    blood_group = models.CharField(max_length=10)
    medical_notes = models.TextField(blank=True, null=True)
    profile_image = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.full_name
