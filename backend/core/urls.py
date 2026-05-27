# Root URL config
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # SOS API routes
    path('api/sos/', include('apps.sos.urls.sos_urls')),
]