from django.urls import path
from . import views

urlpatterns = [
    path('', views.FormListCreateView.as_view(), name='form-list-create'),
    path('<uuid:pk>/', views.FormDetailView.as_view(), name='form-detail'),
    path('<uuid:pk>/questions/', views.QuestionListView.as_view(), name='question-list'),
]
