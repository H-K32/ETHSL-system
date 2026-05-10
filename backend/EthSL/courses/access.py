# courses/access.py

from progress.models import LessonProgress, QuizAttempt
from courses.models import Quiz


# ---------------- LESSON ----------------
def can_access_lesson(user, lesson):
    previous_lessons = lesson.course.lessons.filter(order__lt=lesson.order)

    for prev in previous_lessons:
        if not LessonProgress.objects.filter(
            user=user,
            lesson=prev,
            is_completed=True
        ).exists():
            return False

        quiz = getattr(prev, "quiz", None)

        if quiz:
            if not QuizAttempt.objects.filter(
                user=user,
                quiz=quiz,
                passed=True
            ).exists():
                return False

    return True


# ---------------- COURSE ----------------
def can_access_course(user, course):
    for lesson in course.lessons.all():
        if not LessonProgress.objects.filter(
            user=user,
            lesson=lesson,
            is_completed=True
        ).exists():
            return False

        quiz = getattr(lesson, "quiz", None)

        if quiz:
            if not QuizAttempt.objects.filter(
                user=user,
                quiz=quiz,
                passed=True
            ).exists():
                return False

    return True


def can_take_course_quiz(user, course):
    # all lessons completed + quizzes passed
    return can_access_course(user, course)


# ---------------- LEVEL ----------------
def can_access_level(user, level):
    previous_levels = level.__class__.objects.filter(order__lt=level.order)

    for prev in previous_levels:
        for course in prev.courses.all():
            if not can_access_course(user, course):
                return False

        quiz = getattr(prev, "final_quiz", None)

        if quiz:
            if not QuizAttempt.objects.filter(
                user=user,
                quiz=quiz,
                passed=True
            ).exists():
                return False

    return True


def can_take_level_quiz(user, level):
    return can_access_level(user, level)