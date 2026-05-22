from rest_framework import serializers
from .models import Course, Lesson, Quiz, Question, Option, Level
from progress.models import LessonProgress
 

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
    class Meta:
        model = Lesson
        fields = "__all__"
        
        
class LessonReadSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()

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

        previous_lessons = obj.course.lessons.filter(order__lt=obj.order)

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
    options = OptionSerializer(many=True)

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
    questions = QuestionSerializer(many=True)

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

    # ---------------- CREATE ----------------
    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])

        quiz = Quiz.objects.create(**validated_data)

        for q_data in questions_data:
            options_data = q_data.pop("options", [])

            question = Question.objects.create(
                quiz=quiz,
                **q_data
            )

            for o_data in options_data:
                Option.objects.create(
                    question=question,
                    **o_data
                )

        return quiz

    # ---------------- UPDATE ----------------
    def update(self, instance, validated_data):
        questions_data = validated_data.pop("questions", [])

        instance.lesson = validated_data.get(
            "lesson",
            instance.lesson
        )

        instance.course = validated_data.get(
            "course",
            instance.course
        )

        instance.level = validated_data.get(
            "level",
            instance.level
        )

        instance.description = validated_data.get(
            "description",
            instance.description
        )

        instance.passing_score = validated_data.get(
            "passing_score",
            instance.passing_score
        )

        instance.save()

        # delete old questions
        instance.questions.all().delete()

        # recreate
        for q_data in questions_data:
            options_data = q_data.pop("options", [])

            question = Question.objects.create(
                quiz=instance,
                **q_data
            )

            for o_data in options_data:
                Option.objects.create(
                    question=question,
                    **o_data
                )

        return instance
    
    
 