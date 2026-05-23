from django.urls import path
from .views.event_views import SOSEventLogView

urlpatterns = [
    path('sos-event/', SOSEventLogView.as_view(), name='sos-event'),
]
