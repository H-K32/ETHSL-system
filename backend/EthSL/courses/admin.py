from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
from django.forms.models import BaseInlineFormSet
from .models import Level, Course, Lesson, Quiz, Question, Option


class QuizAdminForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = "__all__"
        widgets = {
            "passing_score": forms.NumberInput(attrs={"min": 1}),
        }


class QuestionAdminForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = "__all__"
        widgets = {
            "points": forms.NumberInput(attrs={"min": 1}),
        }


class QuestionInlineFormSet(BaseInlineFormSet):
    def clean(self):
        super().clean()
        questions = [
            form for form in self.forms
            if not form.cleaned_data.get("DELETE", False) and form.cleaned_data
        ]

        if len(questions) < 2:
            raise ValidationError("A quiz must contain at least two questions.")

        for form in questions:
            question_text = form.cleaned_data.get("question_text")
            question_image = form.cleaned_data.get("question_image")
            question_video = form.cleaned_data.get("question_video")

            if not (
                (isinstance(question_text, str) and question_text.strip())
                or question_image
                or question_video
            ):
                raise ValidationError(
                    "Each question must include text, image, or video."
                )


class OptionInlineFormSet(BaseInlineFormSet):
    def clean(self):
        super().clean()
        for form in self.forms:
            if form.cleaned_data.get("DELETE", False) or not form.cleaned_data:
                continue

            option_text = form.cleaned_data.get("option_text")
            option_image = form.cleaned_data.get("option_image")
            option_video = form.cleaned_data.get("option_video")

            if not (
                (isinstance(option_text, str) and option_text.strip())
                or option_image
                or option_video
            ):
                raise ValidationError(
                    "Each option must include text, image, or video."
                )


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

class OptionInline(admin.TabularInline):
    model = Option
    formset = OptionInlineFormSet
    extra = 1


class QuestionInline(admin.TabularInline):
    model = Question
    form = QuestionAdminForm
    formset = QuestionInlineFormSet
    extra = 1
    show_change_link = True


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "quiz", "question_text")
    form = QuestionAdminForm
    inlines = [OptionInline]


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    form = QuizAdminForm
    list_display = ("id", "quiz_type", "level", "course", "lesson")
    list_filter = ("quiz_type",)
    inlines = [QuestionInline]