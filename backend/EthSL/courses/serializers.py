from rest_framework import serializers
from .models import Course, Lesson, Quiz, Question, Option, Level
from progress.models import LessonProgress

import json

class LevelSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Level
        fields = ['id', 'name', 'display_name', 'order']

    def get_display_name(self, obj):
        return obj.get_name_display()
    
    
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
        
class LessonWriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lesson
        fields = [
            "id",
            "course",
            "title",
            "description",
            "video",
            "order",
            "duration",
            "thumbnail",
        ]  
        
class LessonReadSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()

    course_title = serializers.CharField(
        source="course.title",
        read_only=True
    )

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_is_completed(self, obj):
        user = self.context['request'].user

        if not user or user.is_anonymous:
            return False

        return LessonProgress.objects.filter(
            user=user,
            lesson=obj,
            is_completed=True
        ).exists()

    def get_is_unlocked(self, obj):
        user = self.context['request'].user

        if not user or user.is_anonymous:
            return True

        previous_lessons = obj.course.lessons.filter(
            order__lt=obj.order
        )

        for prev in previous_lessons:
            if not LessonProgress.objects.filter(
                user=user,
                lesson=prev,
                is_completed=True
            ).exists():
                return False

        return True
    
class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = [
            "id",
            "option_text",
            "option_image",
            "option_video",
            "is_correct",
        ]


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = [
            "id",
            "question_text",
            "question_image",
            "question_video",
            "points",
            "options",
        ]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "lesson",
            "course",
            "level",
            "description",
            "passing_score",
            "questions",
        ]

        extra_kwargs = {
            "lesson": {"required": False, "allow_null": True},
            "course": {"required": False, "allow_null": True},
            "level": {"required": False, "allow_null": True},
        }