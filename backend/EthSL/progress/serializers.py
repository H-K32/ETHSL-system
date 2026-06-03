from rest_framework import serializers
from .models import QuizAttempt, Answer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["question", "selected_option"]

class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz = serializers.IntegerField()
    answers = AnswerSerializer(many=True)

    class Meta:
        model = QuizAttempt
        fields = ["quiz", "answers"]