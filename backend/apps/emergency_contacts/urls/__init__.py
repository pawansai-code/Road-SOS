from django.urls import path
from ..views.contact_views import EmergencyContactView, EmergencyContactDetailView

urlpatterns = [
    path('', EmergencyContactView.as_view(), name='emergency-contacts'),
    path('<uuid:pk>/', EmergencyContactDetailView.as_view(), name='emergency-contacts-detail'),
]
