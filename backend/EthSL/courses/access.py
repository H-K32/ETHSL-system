# courses/access.py

from progress.models import LessonProgress, QuizAttempt
from courses.models import Quiz


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def _user_level_order(user):
    """Numeric order of the user's placement-assigned level."""
    level_map = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
    return level_map.get(getattr(user, 'level', 'beginner'), 1)


def _get_level_final_quiz(level):
    """
    Return the final/level quiz for a level (no lesson, no course attached).
    Prefers quiz_type='final', falls back to any level-linked standalone quiz.
    Returns None if none exists.
    """
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
    """True if the user has passed the standalone final quiz for this level."""
    quiz = _get_level_final_quiz(level)
    if not quiz:
        # No final quiz configured — do not block progression
        return True
    return QuizAttempt.objects.filter(
        user=user, quiz=quiz, passed=True
    ).exists()


def _all_lessons_completed_in_level(user, level):
    """
    True if the user has completed every lesson in every course of this level
    AND passed every lesson quiz within those courses.
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
        # Course-level quiz (linked to course, not a lesson)
        course_quiz = Quiz.objects.filter(
            course=course,
            lesson__isnull=True,
        ).first()
        if course_quiz:
            if not QuizAttempt.objects.filter(
                user=user, quiz=course_quiz, passed=True
            ).exists():
                return False
    return True


# ─────────────────────────────────────────────
# LEVEL ACCESS
# ─────────────────────────────────────────────

def can_access_level(user, level):
    """
    A learner can access a level when:

    Level order == 1 (Beginner):
        Always accessible to everyone.

    Level order > 1 (Intermediate, Advanced …):
        ALL of the following must be true for the immediately preceding level:
          1. Every lesson in every course is completed.
          2. Every lesson quiz (and course quiz) is passed.
          3. The level's own final quiz is passed.

    Exception — placement bypass:
        If the user's placement-assigned level is >= this level's order
        (i.e. they tested into intermediate/advanced at registration),
        they get immediate access.
    """
    # Beginner is always open
    if level.order == 1:
        return True

    # Placement bypass: user was assigned this level or higher
    if _user_level_order(user) >= level.order:
        return True

    # Require ALL THREE conditions on the previous level
    Level = level.__class__
    try:
        prev_level = Level.objects.get(order=level.order - 1)
    except Level.DoesNotExist:
        return True  # No previous level — edge case, allow

    # Condition 1 & 2: all lessons completed + all lesson/course quizzes passed
    if not _all_lessons_completed_in_level(user, prev_level):
        return False

    # Condition 3: previous level's final quiz passed
    if not _passed_level_final_quiz(user, prev_level):
        return False

    return True


def can_take_level_quiz(user, level):
    """
    A learner can attempt the level final quiz when:
      - They can access this level (level is unlocked), AND
      - All lessons in THIS level are completed and all lesson/course quizzes passed.
    They do NOT need to have already passed the final quiz (that is what they are taking).
    """
    if not can_access_level(user, level):
        return False
    return _all_lessons_completed_in_level(user, level)


# ─────────────────────────────────────────────
# COURSE ACCESS
# ─────────────────────────────────────────────

def can_access_course(user, course):
    """
    A course is accessible when:
      - The parent level is accessible (enforces the three-condition level gate), AND
      - All courses that come before this one (ordered by id) in the same level
        are fully completed (all lessons done + lesson quizzes passed).

    Placement-assigned users whose level is strictly above this course's level
    get immediate access to all courses in lower levels.
    """
    if not can_access_level(user, course.level):
        return False

    # Placement bypass for lower levels
    if _user_level_order(user) > course.level.order:
        return True

    # Sequential gating within the level (ordered by creation id as proxy)
    for prev_course in course.level.courses.filter(id__lt=course.id):
        for lesson in prev_course.lessons.all():
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
        # Course-level quiz of previous course
        prev_course_quiz = Quiz.objects.filter(
            course=prev_course, lesson__isnull=True
        ).first()
        if prev_course_quiz:
            if not QuizAttempt.objects.filter(
                user=user, quiz=prev_course_quiz, passed=True
            ).exists():
                return False
    return True


def can_take_course_quiz(user, course):
    """Can take a course quiz only when all lessons in THIS course are
    completed and all lesson quizzes within it are passed."""
    if not can_access_course(user, course):
        return False
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
# LESSON ACCESS
# ─────────────────────────────────────────────

def can_access_lesson(user, lesson):
    """
    A lesson is accessible when:
      - The parent course is accessible, AND
      - All lessons that come before this one (by order) in the same course
        are completed and their quizzes passed.

    Placement-assigned users whose level is strictly above this lesson's level
    get immediate access.
    """
    if not can_access_course(user, lesson.course):
        return False

    # Placement bypass for lower levels
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
