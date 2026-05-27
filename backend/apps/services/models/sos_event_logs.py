from django.db import models
from apps.users.models.user_profile import UserProfile

class SOSEventLog(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, to_field='firebase_uid', db_column='user_id', related_name='sos_event_logs')
    event_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'service_call_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.event_type} at {self.created_at}"
