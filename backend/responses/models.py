from django.db import models
from forms.models import FeedbackForm, Question

class Response(models.Model):
    form = models.ForeignKey(FeedbackForm, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Response to {self.form.title} at {self.submitted_at}"

class Answer(models.Model):
    response = models.ForeignKey(Response, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField()
    
    def __str__(self):
        return f"Answer to {self.question.text}"
