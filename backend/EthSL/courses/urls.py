from django.urls import path
from .views import (
 
    
    AdminLevelListCreateView,
    AdminLevelDetailView,
    
    AdminCourseListCreateView,
    AdminCourseDetailView,
    
    AdminLessonListCreateView,
    AdminLessonDetailView,
    
    AdminStatisticsView,
    
    AdminQuizListCreateView,
    AdminQuizDetailView,
    
    LearnerLevelListView,
    LearnerCourseDetailView,
    LearnerCourseListView,
    LearnerLessonListView,
    LearnerLessonDetailView,
    LearnerQuizDetailView,
    PublicLevelListView,
    
)

urlpatterns = [
     
     
    path("public/levels/", PublicLevelListView.as_view()),
    path('level/', AdminLevelListCreateView.as_view()),
    path('level/<int:pk>/', AdminLevelDetailView.as_view()),
    
    path('course/', AdminCourseListCreateView.as_view()),
    path('course/<int:pk>/', AdminCourseDetailView.as_view()),
    
    path('lesson/', AdminLessonListCreateView.as_view()),
    path('lesson/<int:pk>/', AdminLessonDetailView.as_view()),
    
    path('statistics/', AdminStatisticsView.as_view()),
    
    path("quiz/", AdminQuizListCreateView.as_view()),
    path("quiz/<int:pk>/", AdminQuizDetailView.as_view()),
    
    # ✅ LEARNER (NO ADMIN TOKEN NEEDED)
    path('learner/levels/', LearnerLevelListView.as_view()),
    path('learner/courses/<int:level_id>/', LearnerCourseListView.as_view()),
    path('learner/lessons/<int:course_id>/', LearnerLessonListView.as_view()),
    path('learner/lesson/<int:lesson_id>/', LearnerLessonDetailView.as_view()),
    path('learner/course/<int:course_id>/', LearnerCourseDetailView.as_view()),
    path('learner/quiz/<int:quiz_id>/', LearnerQuizDetailView.as_view()),
    
]