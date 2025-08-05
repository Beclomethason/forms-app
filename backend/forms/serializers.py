from rest_framework import serializers
from .models import FeedbackForm, Question

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'options', 'is_required', 'order']

class FeedbackFormSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = FeedbackForm
        fields = ['id', 'title', 'description', 'creator', 'created_at', 'is_active', 'questions']
        read_only_fields = ['creator', 'created_at']

class FormCreateSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, write_only=True)
    
    class Meta:
        model = FeedbackForm
        fields = ['title', 'description', 'questions']
    
    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        form = FeedbackForm.objects.create(**validated_data)
        
        for question_data in questions_data:
            Question.objects.create(form=form, **question_data)
        
        return form
