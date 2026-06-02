from rest_framework import serializers
from .models import Course, Lesson, Quiz, Question, Option, Level
from progress.models import LessonProgress, QuizAttempt
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

        for prev in obj.course.lessons.filter(order__lt=obj.order):
            if not LessonProgress.objects.filter(
                user=user, lesson=prev, is_completed=True
            ).exists():
                return False
            prev_quiz = getattr(prev, 'quiz', None)
            if prev_quiz:
                if not QuizAttempt.objects.filter(
                    user=user, quiz=prev_quiz, passed=True
                ).exists():
                    return False

        return True
    
class OptionSerializer(serializers.ModelSerializer):
    option_video = serializers.SerializerMethodField()
    option_image = serializers.SerializerMethodField()

    class Meta:
        model = Option
        fields = [
            "id",
            "option_text",
            "option_image",
            "option_video",
            "is_correct",
        ]

    def _resolve_video_url(self, field):
        if not field:
            return None
        try:
            name = field.name
            # Already a full URL stored directly
            if name.startswith('http'):
                return name.replace('/image/upload/', '/video/upload/')
            # Cloudinary storage — .url returns full URL but wrong resource type
            raw = field.url
            return raw.replace('/image/upload/', '/video/upload/')
        except Exception as e:
            print("VIDEO RESOLVE ERROR:", e)
            return None

    def _resolve_image_url(self, field):
        if not field:
            return None
        try:
            name = field.name
            if name.startswith('http'):
                return name
            return field.url
        except Exception as e:
            print("IMAGE RESOLVE ERROR:", e)
            return None

    def get_option_video(self, obj):
        return self._resolve_video_url(obj.option_video)

    def get_option_image(self, obj):
        return self._resolve_image_url(obj.option_image)


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, required=False)
    question_video = serializers.SerializerMethodField()
    question_image = serializers.SerializerMethodField()

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

    def _resolve_video_url(self, field):
        if not field:
            return None
        try:
            name = field.name
            if name.startswith('http'):
                return name.replace('/image/upload/', '/video/upload/')
            raw = field.url
            return raw.replace('/image/upload/', '/video/upload/')
        except Exception as e:
            print("VIDEO RESOLVE ERROR:", e)
            return None

    def _resolve_image_url(self, field):
        if not field:
            return None
        try:
            name = field.name
            if name.startswith('http'):
                return name
            return field.url
        except Exception as e:
            print("IMAGE RESOLVE ERROR:", e)
            return None

    def get_question_video(self, obj):
        return self._resolve_video_url(obj.question_video)

    def get_question_image(self, obj):
        return self._resolve_image_url(obj.question_image)


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