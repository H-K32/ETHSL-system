# courses/access.py

from progress.models import LessonProgress, QuizAttempt
from courses.models import Quiz


def _placement_passed_for_level(user, level):
    """True if user passed a placement quiz linked to this level."""
    placement_quiz = Quiz.objects.filter(
        quiz_type='placement',
        level=level,
        lesson__isnull=True,
        course__isnull=True,
    ).first()
    # Fallback for quizzes saved with wrong quiz_type
    if not placement_quiz:
        placement_quiz = Quiz.objects.filter(
            level=level,
            lesson__isnull=True,
            course__isnull=True,
        ).first()
    if not placement_quiz:
        return False
    return QuizAttempt.objects.filter(
        user=user, quiz=placement_quiz, passed=True
    ).exists()


# ---------------- LESSON ----------------
def can_access_lesson(user, lesson):
    # If user passed placement for this lesson's level, unlock all lessons in it
    if _placement_passed_for_level(user, lesson.course.level):
        return True

    # Also unlock if user's assigned level is higher than this lesson's level
    level_order = lesson.course.level.order
    if hasattr(user, 'level'):
        user_level_order = _user_level_order(user)
        if user_level_order > level_order:
            return True

    previous_lessons = lesson.course.lessons.filter(order__lt=lesson.order)
    for prev in previous_lessons:
        if not LessonProgress.objects.filter(
            user=user, lesson=prev, is_completed=True
        ).exists():
            return False
        quiz = getattr(prev, "quiz", None)
        if quiz:
            if not QuizAttempt.objects.filter(
                user=user, quiz=quiz, passed=True
            ).exists():
                return False
    return True


# ---------------- COURSE ----------------
def can_access_course(user, course):
    # If user passed placement for this course's level, unlock all courses in it
    if _placement_passed_for_level(user, course.level):
        return True

    # Also unlock if user's assigned level is higher than this course's level
    if _user_level_order(user) > course.level.order:
        return True

    for lesson in course.lessons.all():
        if not LessonProgress.objects.filter(
            user=user, lesson=lesson, is_completed=True
        ).exists():
            return False
        quiz = getattr(lesson, "quiz", None)
        if quiz:
            if not QuizAttempt.objects.filter(
                user=user, quiz=quiz, passed=True
            ).exists():
                return False
    return True


def can_take_course_quiz(user, course):
    return can_access_course(user, course)


# ---------------- LEVEL ----------------
def can_access_level(user, level):
    # User can always access levels at or below their assigned level
    if _user_level_order(user) >= level.order:
        return True

    previous_levels = level.__class__.objects.filter(order__lt=level.order)
    for prev in previous_levels:
        for course in prev.courses.all():
            if not can_access_course(user, course):
                return False
        level_quiz = Quiz.objects.filter(
            level=prev, quiz_type='final',
            lesson__isnull=True, course__isnull=True
        ).first()
        if level_quiz:
            if not QuizAttempt.objects.filter(
                user=user, quiz=level_quiz, passed=True
            ).exists():
                return False
    return True


def can_take_level_quiz(user, level):
    return can_access_level(user, level)


# ---------------- HELPER ----------------
def _user_level_order(user):
    """Return the order number of the user's assigned level."""
    level_map = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
    return level_map.get(getattr(user, 'level', 'beginner'), 1)