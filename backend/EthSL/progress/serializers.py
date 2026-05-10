from rest_framework import serializers
from .models import QuizAttempt, Answer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["question", "selected_option"]

class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz = serializer.IntegerField()
    answers = AnswerSerializer(many=True)
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "full_name", "role"]