from django.urls import path
from . import views

urlpatterns = [
    path('', views.ResponseListView.as_view(), name='response-list'),
    path('form/<uuid:form_id>/', views.ResponseCreateView.as_view(), name='response-create'),
    path('form/<uuid:form_id>/responses/', views.FormResponsesView.as_view(), name='form-responses'),
    path('form/<uuid:form_id>/export/', views.ExportCSVView.as_view(), name='export-csv'),  # Add this line
]
