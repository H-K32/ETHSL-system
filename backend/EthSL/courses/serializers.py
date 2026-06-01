from rest_framework import serializers
from .models import Course, Lesson, Quiz, Question, Option, Level
from progress.models import LessonProgress
import re
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
    order = serializers.IntegerField(min_value=1)
    video = serializers.FileField(required=False, allow_null=True)

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

    def validate(self, attrs):
        # Only require video on creation, not on updates
        if self.instance is None and not attrs.get("video"):
            raise serializers.ValidationError({
                "video": "Video is required for a new lesson.",
            })
        return attrs
        
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
    option_video = serializers.SerializerMethodField()

    class Meta:
        model = Option
        fields = [
            "id",
            "option_text",
            "option_image",
            "option_video",
            "is_correct",
        ]

    def get_option_video(self, obj):
        if not obj.option_video:
            return None

        try:
            path = obj.option_video.name

            match = re.search(
                r"videos/option/(.*)$",
                path
            )

            if match:
                filename = match.group(1)

                return (
                    "https://res.cloudinary.com/"
                    "dn5rumfy7/video/upload/"
                    f"videos/option/{filename}"
                )

        except Exception as e:
            print("OPTION VIDEO ERROR:", e)

        return None


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, required=False)
    question_video = serializers.SerializerMethodField()

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

    def get_question_video(self, obj):
        if not obj.question_video:
            return None

        try:
            path = obj.question_video.name

            match = re.search(
                r"videos/question/(.*)$",
                path
            )

            if match:
                filename = match.group(1)

                return (
                    "https://res.cloudinary.com/"
                    "dn5rumfy7/video/upload/"
                    f"videos/question/{filename}"
                )

        except Exception as e:
            print("QUESTION VIDEO ERROR:", e)

        return None


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "quiz_type",
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