from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.api_info, name='api-info'),  # Add this line
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/forms/', include('forms.urls')),
    path('api/responses/', include('responses.urls')),
]
