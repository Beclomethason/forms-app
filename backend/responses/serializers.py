from rest_framework import serializers
from .models import Response as FeedbackResponse, Answer  # Rename here too
from forms.models import Question

class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    
    class Meta:
        model = Answer
        fields = ['question', 'question_text', 'answer_text']

class ResponseSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = FeedbackResponse  # Use FeedbackResponse here
        fields = ['id', 'form', 'submitted_at', 'answers']

class ResponseCreateSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, write_only=True)
    
    class Meta:
        model = FeedbackResponse  # Use FeedbackResponse here
        fields = ['form', 'answers']
    
    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        response = FeedbackResponse.objects.create(**validated_data)  # Use FeedbackResponse here
        
        for answer_data in answers_data:
            Answer.objects.create(response=response, **answer_data)
        
        return response
