from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/services/', include('apps.services.urls')),
    path('api/contacts/', include('apps.emergency_contacts.urls')),
    path('api/sos/', include('apps.sos.urls.sos_urls')),
]
