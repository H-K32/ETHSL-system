from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from courses.models import Quiz, Question, Option, Lesson
from .models import QuizAttempt, Answer, LessonProgress
from certificates.models import Certificate
import uuid
from django.utils.timezone import now


def issue_certificate_if_all_quizzes_passed(user, level):
    """Issue a certificate if user has passed all lesson quizzes in the level."""
    if not level:
        return None
    
    # Get all lessons in this level
    lessons = Lesson.objects.filter(course__level=level)
    if not lessons.exists():
        return None
    
    # Check that each lesson has a quiz
    lesson_quiz_ids = []
    for lesson in lessons:
        quiz = getattr(lesson, 'quiz', None)
        if not quiz:
            return None  # Missing quiz for a lesson, cannot issue certificate yet
        lesson_quiz_ids.append(quiz.id)
    
    # Check how many of these quizzes the user has passed
    passed_count = QuizAttempt.objects.filter(
        user=user,
        quiz_id__in=lesson_quiz_ids,
        passed=True
    ).values('quiz_id').distinct().count()
    
    # If all quizzes are passed, issue certificate
    if passed_count == len(lesson_quiz_ids):
        certificate, _ = Certificate.objects.get_or_create(
            learner=user,
            level=level,
            defaults={"certificate_id": f"CERT-{uuid.uuid4().hex[:8]}"}
        )
        return certificate
    
    return None

class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        quiz_id = request.data.get("quiz")
        answers_data = request.data.get("answers", [])

        quiz = Quiz.objects.get(id=quiz_id)

        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz
        )

        score = 0
        review = []

        for ans in answers_data:
            question = Question.objects.get(id=ans["question"])
            selected_option = Option.objects.get(id=ans["selected_option"])
            correct_option = question.options.filter(is_correct=True).first()

            is_correct = selected_option.is_correct
            if is_correct:
                score += question.points

            Answer.objects.create(
                attempt=attempt,
                question=question,
                selected_option=selected_option,
                is_correct=is_correct
            )

            review.append({
                "question_id": question.id,
                "question_text": question.question_text,
                "selected_option_id": selected_option.id,
                "selected_option_text": selected_option.option_text,
                "correct_option_id": correct_option.id if correct_option else None,
                "correct_option_text": correct_option.option_text if correct_option else None,
                "is_correct": is_correct,
            })

        attempt.score = score
        attempt.passed = score >= quiz.passing_score
        attempt.save()

        user = request.user

        if attempt.passed:
            # If this is a lesson quiz, mark the lesson as complete and try to issue certificate
            if quiz.lesson:
                LessonProgress.objects.update_or_create(
                    user=user,
                    lesson=quiz.lesson,
                    defaults={"is_completed": True, "completed_at": now()}
                )
                certificate = issue_certificate_if_all_quizzes_passed(
                    user,
                    quiz.lesson.course.level
                )
                if certificate:
                    return Response({
                        "score": score,
                        "passed": attempt.passed,
                        "certificate_earned": True,
                        "level_name": quiz.lesson.course.level.get_name_display(),
                        "review": review,
                    })

        return Response({
            "score": score,
            "passed": attempt.passed,
            "certificate_earned": False,
            "review": review,
        })    
        
class CompleteLessonView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        from django.utils.timezone import now as tz_now
        from datetime import timedelta

        user = request.user
        completion_time = tz_now()

        obj, created = LessonProgress.objects.get_or_create(
            user=user,
            lesson_id=lesson_id
        )

        already_completed = obj.is_completed
        obj.is_completed = True
        obj.completed_at = completion_time
        obj.save()

        # Only update streak when this is a new completion
        if not already_completed:
            today = completion_time.date()
            # Find the most recent other completed lesson before this one
            last = (
                LessonProgress.objects
                .filter(user=user, is_completed=True)
                .exclude(lesson_id=lesson_id)
                .order_by("-completed_at")
                .values_list("completed_at", flat=True)
                .first()
            )
            if last is None:
                # First ever lesson completed
                user.streak_count = 1
            else:
                last_date = last.date()
                if last_date == today:
                    # Already completed a lesson today — streak unchanged
                    pass
                elif last_date == today - timedelta(days=1):
                    # Consecutive day — extend streak
                    user.streak_count += 1
                else:
                    # Gap of more than one day — reset
                    user.streak_count = 1
            user.save(update_fields=["streak_count"])

        return Response({"message": "Lesson completed", "streak_count": user.streak_count})
            
    

class UserProgressDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from courses.models import Course, Lesson, Quiz, Level
        from django.db.models import Avg
        from courses.access import can_access_level

        user = request.user

        lessons_completed = LessonProgress.objects.filter(
            user=user, is_completed=True
        ).count()

        quizzes_passed = QuizAttempt.objects.filter(
            user=user, passed=True
        ).count()

        quizzes_failed = QuizAttempt.objects.filter(
            user=user, passed=False
        ).count()

        total_attempts = QuizAttempt.objects.filter(user=user).count()

        quiz_avg = QuizAttempt.objects.filter(user=user).aggregate(
            avg=Avg("score")
        )["avg"]
        # Recent activities — last 5 completed lessons + passed quizzes
        recent_lessons = LessonProgress.objects.filter(
            user=user, is_completed=True
        ).select_related("lesson").order_by("-completed_at")[:3]

        recent_quizzes = QuizAttempt.objects.filter(
            user=user, passed=True
        ).select_related("quiz").order_by("-taken_at")[:3]

        recent_activities = []
        for lp in recent_lessons:
            recent_activities.append({
                "type": "lesson",
                "lesson_title": lp.lesson.title,
                "date": lp.completed_at.strftime("%b %d, %Y") if lp.completed_at else "",
                "_sort": lp.completed_at,
            })
        for qa in recent_quizzes:
            recent_activities.append({
                "type": "quiz",
                "score": qa.score,
                "date": qa.taken_at.strftime("%b %d, %Y") if qa.taken_at else "",
                "_sort": qa.taken_at,
            })
        recent_activities = sorted(
            recent_activities, key=lambda x: x["_sort"] or now(), reverse=True
        )[:5]
        for a in recent_activities:
            a.pop("_sort", None)

        # Recommended levels
        recommended_levels = []
        for level in Level.objects.all().order_by("order"):
            if not can_access_level(user, level):
                continue
            total_lessons = Lesson.objects.filter(course__level=level).count()
            if total_lessons == 0:
                continue
            done = LessonProgress.objects.filter(
                user=user, lesson__course__level=level, is_completed=True
            ).count()
            progress = round((done / total_lessons) * 100)
            if progress < 100:
                recommended_levels.append({
                    "name": level.get_name_display(),
                    "progress": progress,
                    "done": done,
                    "total": total_lessons,
                })

        return Response({
            "completed_lessons": lessons_completed,
            "quizzes_passed": quizzes_passed,
            "quizzes_failed": quizzes_failed,
            "total_quiz_attempts": total_attempts,
            "quiz_average": round(quiz_avg, 1) if quiz_avg is not None else None,
            "streak_count": user.streak_count,
            "current_level": user.get_level_display(),
            "recent_activities": recent_activities,
            "recommended_levels": recommended_levels,
        })