from rest_framework import serializers
from ..models.contact import EmergencyContact

class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['id', 'contact_name', 'relationship', 'phone_number', 'created_at']
        read_only_fields = ['id', 'created_at']
