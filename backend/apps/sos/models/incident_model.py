from django.db import models


class Incident(models.Model):

    latitude = models.FloatField()

    longitude = models.FloatField()

    service_type = models.CharField(max_length=100)

    map_link = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):

        return self.service_type