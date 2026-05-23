from rest_framework import serializers
from ..models.sos_event_logs import SOSEventLog

class SOSEventLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSEventLog
        fields = ['id', 'firebase_uid', 'event_type', 'created_at']
        read_only_fields = ['id', 'firebase_uid', 'created_at']
