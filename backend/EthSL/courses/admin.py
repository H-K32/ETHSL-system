from django.contrib import admin
from .models import Level, Course, Lesson, Quiz, Question, Option


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "order")
    ordering = ("order",)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "level")
    list_filter = ("level",)
    search_fields = ("title",)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "order")
    ordering = ("course", "order")


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("id", "quiz_type", "level", "course", "lesson")
    list_filter = ("quiz_type",)