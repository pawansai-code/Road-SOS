# Django URL utilities
from django.urls import path

# Import SOS view
from apps.sos.views.sos_views import SOSView


# URL patterns for SOS feature
urlpatterns = [

    # Endpoint:
    # /api/sos/trigger/
    path(
        "trigger/",
        SOSView.as_view(),
        name="trigger-sos"
    ),
]