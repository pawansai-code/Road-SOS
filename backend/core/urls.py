# Root URL config
from django.contrib import admin
from django.urls import path, include

from django.http import JsonResponse

def api_home(request):
    return JsonResponse({"status": "success", "message": "Road SOS API is running smoothly!"})

urlpatterns = [
    path('', api_home, name='home'),
    path('admin/', admin.site.urls),

    # SOS API routes
    path('api/sos/', include('apps.sos.urls.sos_urls')),
]