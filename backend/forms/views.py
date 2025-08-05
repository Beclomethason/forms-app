from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import FeedbackForm, Question
from .serializers import FeedbackFormSerializer, FormCreateSerializer, QuestionSerializer

@method_decorator(csrf_exempt, name='dispatch')
class FormListCreateView(generics.ListCreateAPIView):
    serializer_class = FeedbackFormSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow any for testing
    
    def get_queryset(self):
        # For now, return all forms - we'll add user filtering later
        return FeedbackForm.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FormCreateSerializer
        return FeedbackFormSerializer
    
    def perform_create(self, serializer):
        # For now, assign to first user - we'll fix this later
        from django.contrib.auth.models import User
        user = User.objects.first()
        serializer.save(creator=user)
        print(f"Form created successfully by user: {user.username}")

@method_decorator(csrf_exempt, name='dispatch')
class FormDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FeedbackFormSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return FeedbackForm.objects.filter(is_active=True)

@method_decorator(csrf_exempt, name='dispatch')
class QuestionListView(generics.ListAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        form_id = self.kwargs['pk']
        return Question.objects.filter(form_id=form_id)
