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

        for ans in answers_data:
            question = Question.objects.get(id=ans["question"])
            selected_option = Option.objects.get(id=ans["selected_option"])

            is_correct = selected_option.is_correct

            if is_correct:
                score += question.points

            Answer.objects.create(
                attempt=attempt,
                question=question,
                selected_option=selected_option,
                is_correct=is_correct
            )

        attempt.score = score
        attempt.passed = score >= quiz.passing_score
        attempt.save()

        user = request.user

        if attempt.passed:
            # Check if this is a lesson quiz and try to issue certificate
            if quiz.quiz_type == "lesson" and quiz.lesson:
                issue_certificate_if_all_quizzes_passed(
                    user,
                    quiz.lesson.course.level
                )

            # Handle placement quiz level advancement
            if quiz.level and quiz.quiz_type == "placement":
                if quiz.level.name == "beginner":
                    user.level = "intermediate"
                    user.placement_required = False
                elif quiz.level.name == "intermediate":
                    user.level = "advanced"
                    user.placement_required = False

            user.save()

        return Response({
            "score": score,
            "passed": attempt.passed
        })    
        
class CompleteLessonView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, lesson_id):
        obj, created = LessonProgress.objects.get_or_create(
            user=request.user,
            lesson_id=lesson_id
        )
        
        obj.is_completed = True
        obj.completed_at = now()
        obj.save()
        
        return Response({"message": "Lesson completed"})
            
    

class UserProgressDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        lessons_completed = LessonProgress.objects.filter(
            user=user,
            is_completed=True
        ).count()

        quizzes_passed = QuizAttempt.objects.filter(
            user=user,
            passed=True
        ).count()

        total_attempts = QuizAttempt.objects.filter(user=user).count()

        return Response({
            "completed_lessons": lessons_completed,
            "quizzes_passed": quizzes_passed,
            "total_quiz_attempts": total_attempts,
        })