from django.urls import path
from ..views.contact_views import EmergencyContactView, EmergencyContactDetailView, SMSTemplateView

urlpatterns = [
    path('', EmergencyContactView.as_view(), name='emergency-contacts'),
    path('sms-template/', SMSTemplateView.as_view(), name='sms-template'),
    path('<uuid:pk>/', EmergencyContactDetailView.as_view(), name='emergency-contacts-detail'),
]
