from django.urls import path
from .views.user_views import UserProfileView

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]
