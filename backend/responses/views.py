from rest_framework import generics, permissions
from rest_framework.response import Response as DRFResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Response as FeedbackResponse  # Rename to avoid conflict
from .serializers import ResponseSerializer, ResponseCreateSerializer
from forms.models import FeedbackForm

@method_decorator(csrf_exempt, name='dispatch')
class ResponseListView(generics.ListAPIView):
    serializer_class = ResponseSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return FeedbackResponse.objects.all()

@method_decorator(csrf_exempt, name='dispatch')
class ResponseCreateView(generics.CreateAPIView):
    serializer_class = ResponseCreateSerializer
    permission_classes = [permissions.AllowAny]
    
    def perform_create(self, serializer):
        form_id = self.kwargs['form_id']
        form = FeedbackForm.objects.get(id=form_id, is_active=True)
        serializer.save(form=form)

@method_decorator(csrf_exempt, name='dispatch')
class FormResponsesView(generics.ListAPIView):
    serializer_class = ResponseSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        form_id = self.kwargs['form_id']
        print(f"Fetching responses for form ID: {form_id}")  # Debug log
        
        # Use FeedbackResponse instead of Response
        responses = FeedbackResponse.objects.filter(form_id=form_id).prefetch_related('answers', 'answers__question')
        print(f"Found {responses.count()} responses")  # Debug log
        
        return responses
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        print(f"Serialized data: {serializer.data}")  # Debug log
        return DRFResponse(serializer.data)

# Add the CSV export view here too
import csv
from django.http import HttpResponse

@method_decorator(csrf_exempt, name='dispatch')
class ExportCSVView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, form_id):
        try:
            # Get the form
            form = FeedbackForm.objects.get(id=form_id)
            
            # Get all responses for this form using FeedbackResponse
            responses = FeedbackResponse.objects.filter(form=form).prefetch_related('answers', 'answers__question')
            
            if not responses.exists():
                return DRFResponse({'error': 'No responses found for this form'}, status=404)
            
            # Create CSV response
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{form.title}_responses.csv"'
            
            writer = csv.writer(response)
            
            # Get all questions for headers
            questions = form.questions.all().order_by('order')
            
            # Write headers
            headers = ['Response ID', 'Submitted At'] + [f"Q{i+1}: {q.text}" for i, q in enumerate(questions)]
            writer.writerow(headers)
            
            # Write data rows
            for resp in responses:
                row = [
                    str(resp.id),
                    resp.submitted_at.strftime('%Y-%m-%d %H:%M:%S')
                ]
                
                # Create answer mapping
                answer_map = {answer.question.id: answer.answer_text for answer in resp.answers.all()}
                
                # Add answers in correct order
                for question in questions:
                    answer_text = answer_map.get(question.id, 'No Answer')
                    row.append(answer_text)
                
                writer.writerow(row)
            
            return response
            
        except FeedbackForm.DoesNotExist:
            return DRFResponse({'error': 'Form not found'}, status=404)
        except Exception as e:
            print(f"CSV Export Error: {str(e)}")
            return DRFResponse({'error': str(e)}, status=500)
