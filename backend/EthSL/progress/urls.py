from django.urls import path
from .views import SubmitQuizView, CompleteLessonView, UserProgressDashboardView

urlpatterns = [
    path("submit-quiz/", SubmitQuizView.as_view()),
    path("complete-lesson/<int:lesson_id>/", CompleteLessonView.as_view()),
    path("profile/dashboard/", UserProgressDashboardView.as_view()),
    
]