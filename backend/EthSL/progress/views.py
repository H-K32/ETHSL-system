from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from courses.models import Quiz, Question, Option
from .models import QuizAttempt, Answer, LessonProgress
from certificates.models import Certificate
import uuid
from django.utils.timezone import now

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

        if attempt.passed:

            if quiz.level and quiz.quiz_type == "final":

                Certificate.objects.get_or_create(
                    learner=request.user,
                    level=quiz.level,
                    defaults={
                        "certificate_id":
                        f"CERT-{uuid.uuid4().hex[:8]}"
                    }
                )

        user = request.user

        if attempt.passed:

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