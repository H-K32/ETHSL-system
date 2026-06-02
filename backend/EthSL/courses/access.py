# courses/access.py

from progress.models import LessonProgress, QuizAttempt
from courses.models import Quiz


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def _user_level_order(user):
    level_map = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
    return level_map.get(getattr(user, 'level', 'beginner'), 1)


def _get_level_final_quiz(level):
    quiz = Quiz.objects.filter(
        quiz_type='final',
        level=level,
        lesson__isnull=True,
        course__isnull=True,
    ).first()
    if not quiz:
        quiz = Quiz.objects.filter(
            level=level,
            lesson__isnull=True,
            course__isnull=True,
        ).exclude(quiz_type='placement').first()
    return quiz


def _passed_level_final_quiz(user, level):
    quiz = _get_level_final_quiz(level)
    if not quiz:
        return True
    return QuizAttempt.objects.filter(
        user=user, quiz=quiz, passed=True
    ).exists()


def _all_lessons_completed_in_level(user, level):
    """
    True if the user has:
      - completed every lesson in every module of this level, AND
      - passed every lesson quiz within those modules.
    Module (course) quizzes are intentionally NOT checked here.
    """
    for course in level.courses.prefetch_related('lessons').all():
        for lesson in course.lessons.all():
            if not LessonProgress.objects.filter(
                user=user, lesson=lesson, is_completed=True
            ).exists():
                return False
            lesson_quiz = getattr(lesson, 'quiz', None)
            if lesson_quiz:
                if not QuizAttempt.objects.filter(
                    user=user, quiz=lesson_quiz, passed=True
                ).exists():
                    return False
    return True


# ─────────────────────────────────────────────
# LEVEL ACCESS
# ─────────────────────────────────────────────

def can_access_level(user, level):
    """
    Level 1 (Beginner): always accessible.
    Level N > 1: requires ALL of the following on the previous level:
      1. Every lesson completed.
      2. Every lesson quiz passed.
      3. The level's own final quiz passed.
    Placement bypass: user assigned this level or higher gets immediate access.
    """
    if level.order == 1:
        return True

    if _user_level_order(user) >= level.order:
        return True

    Level = level.__class__
    try:
        prev_level = Level.objects.get(order=level.order - 1)
    except Level.DoesNotExist:
        return True

    if not _all_lessons_completed_in_level(user, prev_level):
        return False

    if not _passed_level_final_quiz(user, prev_level):
        return False

    return True


def can_take_level_quiz(user, level):
    """
    Can take the level quiz when:
      - The level is accessible (unlocked), AND
      - All lessons in THIS level are completed and all lesson quizzes passed.
    """
    if not can_access_level(user, level):
        return False
    return _all_lessons_completed_in_level(user, level)


# ─────────────────────────────────────────────
# MODULE (COURSE) ACCESS — always open, no locking
# ─────────────────────────────────────────────

def can_access_course(user, course):
    """
    Modules are always accessible as long as the parent level is accessible.
    No sequential gating between modules.
    """
    return can_access_level(user, course.level)


def can_take_course_quiz(user, course):
    """
    Kept for API compatibility but modules have no quizzes.
    Always returns False so no course quiz buttons appear.
    """
    return False


# ─────────────────────────────────────────────
# LESSON ACCESS
# ─────────────────────────────────────────────

def can_access_lesson(user, lesson):
    """
    A lesson is accessible when:
      - The parent module's level is accessible, AND
      - All lessons before this one (by order) in the same module
        are completed AND their quizzes passed.
    Placement bypass for lower levels.
    """
    if not can_access_course(user, lesson.course):
        return False

    if _user_level_order(user) > lesson.course.level.order:
        return True

    for prev in lesson.course.lessons.filter(order__lt=lesson.order):
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
