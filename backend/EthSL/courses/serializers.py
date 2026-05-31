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
    
import json
from rest_framework import serializers
from .models import Quiz, Question, Option


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

    # ---------------- CREATE ----------------
    def create(self, validated_data):
        request = self.context.get("request")

        data = json.loads(request.data.get("data"))
        request_files = request.FILES

        quiz = Quiz.objects.create(
            lesson_id=data.get("lesson"),
            course_id=data.get("course"),
            level_id=data.get("level"),
            description=data.get("description"),
            passing_score=data.get("passing_score"),
        )

        for q_index, q_data in enumerate(data.get("questions", [])):

            question = Question.objects.create(
                quiz=quiz,
                question_text=q_data["question_text"],
                points=q_data.get("points", 1),
            )

            # question files
            img_key = f"question_image_{q_index}"
            vid_key = f"question_video_{q_index}"

            if img_key in request_files:
                question.question_image = request_files[img_key]

            if vid_key in request_files:
                question.question_video = request_files[vid_key]

            question.save()

            for o_index, o_data in enumerate(q_data.get("options", [])):

                option = Option.objects.create(
                    question=question,
                    option_text=o_data["option_text"],
                    is_correct=o_data["is_correct"],
                )

                o_img = f"option_image_{q_index}_{o_index}"
                o_vid = f"option_video_{q_index}_{o_index}"

                if o_img in request_files:
                    option.option_image = request_files[o_img]

                if o_vid in request_files:
                    option.option_video = request_files[o_vid]

                option.save()

        return quiz

    # ---------------- UPDATE ----------------
    def update(self, instance, validated_data):
        request = self.context.get("request")

        data = json.loads(request.data.get("data"))
        request_files = request.FILES

        instance.lesson_id = data.get("lesson")
        instance.course_id = data.get("course")
        instance.level_id = data.get("level")
        instance.description = data.get("description")
        instance.passing_score = data.get("passing_score")
        instance.save()

        instance.questions.all().delete()

        for q_index, q_data in enumerate(data.get("questions", [])):

            question = Question.objects.create(
                quiz=instance,
                question_text=q_data["question_text"],
                points=q_data.get("points", 1),
            )

            img_key = f"question_image_{q_index}"
            vid_key = f"question_video_{q_index}"

            if img_key in request_files:
                question.question_image = request_files[img_key]

            if vid_key in request_files:
                question.question_video = request_files[vid_key]

            question.save()

            for o_index, o_data in enumerate(q_data.get("options", [])):

                option = Option.objects.create(
                    question=question,
                    option_text=o_data["option_text"],
                    is_correct=o_data["is_correct"],
                )

                o_img = f"option_image_{q_index}_{o_index}"
                o_vid = f"option_video_{q_index}_{o_index}"

                if o_img in request_files:
                    option.option_image = request_files[o_img]

                if o_vid in request_files:
                    option.option_video = request_files[o_vid]

                option.save()

        return instance