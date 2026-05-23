from rest_framework import serializers
from ..models.user_profile import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'firebase_uid', 'full_name', 'phone_number', 'blood_group', 
            'medical_notes', 'profile_image', 'is_verified', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['firebase_uid', 'is_verified', 'is_active', 'created_at', 'updated_at']
