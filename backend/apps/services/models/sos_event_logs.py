from django.db import models

class SOSEventLog(models.Model):
    firebase_uid = models.CharField(max_length=128)
    event_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sos_event_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.event_type} at {self.created_at}"
