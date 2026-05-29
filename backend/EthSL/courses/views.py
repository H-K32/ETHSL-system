from django.shortcuts import render
from rest_framework.views import APIView
from users.permissions import IsAdminUserRole
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Level, Course, Lesson, Quiz
from users.models import User
from rest_framework.response import Response
from django.db.models import Count, Avg
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from rest_framework.exceptions import ValidationError
import traceback
 
from progress.models import LessonProgress, QuizAttempt

from .serializers import (
    LevelSerializer,
    CourseSerializer,
    LessonReadSerializer,
    LessonWriteSerializer,
    QuizSerializer
)
from .access import (
    can_access_lesson,
    can_access_course,
    can_access_level,
    can_take_course_quiz,
    can_take_level_quiz
)
    
class AdminLevelListCreateView(APIView):
    permission_classes = [IsAdminUserRole]
    
    
    def get(self, request):
        levels = Level.objects.all()
        serializer = LevelSerializer(levels, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = LevelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status.HTTP_201_CREATED)
        return Response(serializer.errors,  status=status.HTTP_400_BAD_REQUEST)
    
class AdminLevelDetailView(APIView):
    permission_classes = [IsAdminUserRole]
    
    def get_object(self, pk):
        try:
            return Level.objects.get(pk = pk)
        except Level.DoesNotExist:
            return None
        
    def get(self, request, pk):
        level = self.get_object(pk)
        if not level:
            return Response({"detail": "Not found"}, status=404)   
        serializer = LevelSerializer(level)
        return Response(serializer.data)
    
    def put(self, request, pk):
        level = self.get_object(pk)
        if not level:
            return Response({"detail": "Not found"}, status=404)
        serializer = LevelSerializer(level, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    def patch(self, request, pk):
        level = self.get_object(pk)
        if not level:
            return Response({"detail": "Not found"}, status=404)
        serializer = LevelSerializer(level, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    def delete(self, request, pk):
        level = self.get_object(pk)
        if not level:
            return Response({"detail": "Not found"}, status=404)
        level.delete()
        return Response({"detail": "Deleted successfully"}, status=204)
    
class AdminCourseListCreateView(APIView):
    permission_classes = [IsAdminUserRole]
       
    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status.HTTP_201_CREATED)
        return Response(serializer.errors,  status=status.HTTP_400_BAD_REQUEST)
    
class AdminCourseDetailView(APIView):
    permission_classes = [IsAdminUserRole]
    
    def get_object(self, pk):
        try:
            return Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return None
    def get(self, request, pk):
        course = self.get_object(pk)
        if not course:
            return Response({"detail": "Not found"}, status=404)
        serializer = CourseSerializer(course)
        return Response(serializer.data)
    def put(self, request, pk):
        course = self.get_object(pk)
        if not course: 
            return Response({"detail": "Not found"}, status=404)
        serializer = CourseSerializer(course, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    def patch(self, request, pk):
        course = self.get_object(pk)
        if not course:
            return Response({"detail": "Not found"}, status=404)
        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    def delete(self, request, pk):
        course = self.get_object(pk)
        if not course:
            return Response({"detail": "Not found"}, status=404)
        course.delete()
        return Response({"detail": "Deleted Successfully"}, status=204)
      
class AdminLessonListCreateView(APIView):
    permission_classes = [IsAdminUserRole]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        lessons = Lesson.objects.all()
        serializer = LessonReadSerializer(
            lessons,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = LessonWriteSerializer(data=request.data)

        if serializer.is_valid():
            lesson = serializer.save()

            return Response(
                LessonReadSerializer(
                    lesson,
                    context={"request": request}
                ).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class AdminLessonDetailView(APIView):
    permission_classes = [IsAdminUserRole]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self, pk):
        try:
            return Lesson.objects.get(pk=pk)
        except Lesson.DoesNotExist:
            return None

    def get(self, request, pk):
        lesson = self.get_object(pk)
        if not lesson:
            return Response({"detail": "Not found"}, status=404)

        serializer = LessonReadSerializer(lesson, context={"request": request})
        return Response(serializer.data)

    def put(self, request, pk):
        lesson = self.get_object(pk)
        if not lesson:
            return Response({"detail": "Not found"}, status=404)

        serializer = LessonWriteSerializer(lesson, data=request.data)
        if serializer.is_valid():
            lesson = serializer.save()
            return Response(
                LessonReadSerializer(lesson, context={"request": request}).data
            )

        return Response(serializer.errors, status=400)

    def patch(self, request, pk):
        lesson = self.get_object(pk)
        if not lesson:
            return Response({"detail": "Not found"}, status=404)

        serializer = LessonWriteSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            lesson = serializer.save()
            return Response(
                LessonReadSerializer(lesson, context={"request": request}).data
            )

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        lesson = self.get_object(pk)
        if not lesson:
            return Response({"detail": "Not found"}, status=404)

        lesson.delete()
        return Response({"detail": "deleted successfully"}, status=204)
    
class AdminStatisticsView(APIView):
    permission_classes = [IsAdminUserRole]
    
    def get(self, request):
        total_levels = Level.objects.count()
        total_courses = Course.objects.count()
        total_lessons = Lesson.objects.count()
        total_users = User.objects.count()
        
        data = {
            "total_levels": total_levels,
            "total_courses": total_courses,
            "total_lessons": total_lessons,
            "total_users": total_users
        }
        
        return Response(data)
    
class AdminQuizListCreateView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        quizzes = Quiz.objects.all()
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = QuizSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

class AdminQuizDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get_object(self, pk):
        try:
            return Quiz.objects.get(pk=pk)
        except Quiz.DoesNotExist:
            return None

    def get(self, request, pk):
        quiz = self.get_object(pk)
        if not quiz:
            return Response({"detail": "Not found"}, status=404)

        return Response(QuizSerializer(quiz).data)

    def put(self, request, pk):
        quiz = self.get_object(pk)
        if not quiz:
            return Response({"detail": "Not found"}, status=404)

        serializer = QuizSerializer(quiz, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    
    def patch(self, request, pk):
        quiz = self.get_object(pk)
        if not quiz:
            return Response({"detail": "Not found"}, status=404)

        serializer = QuizSerializer(quiz, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        quiz = self.get_object(pk)
        if not quiz:
            return Response({"detail": "Not found"}, status=404)

        quiz.delete()
        return Response({"detail": "Deleted"}, status=204)
    
    
    
class LearnerLevelListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        levels = Level.objects.all().order_by("order")

        data = []

        from courses.access import (
            can_access_level,
            can_take_level_quiz
        )

        for level in levels:

            level_quiz = Quiz.objects.filter(level=level).first()

            data.append({
                "id": level.id,
                "name": level.name,
                "display_name": level.get_name_display(),
                "order": level.order,
                "unlocked": can_access_level(user, level),
                "has_quiz": level_quiz is not None,
                "quiz_id": level_quiz.id if level_quiz else None,
                "can_take_quiz": can_take_level_quiz(user, level),
            })

        return Response(data)
    
class LearnerCourseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, level_id):
        courses = Course.objects.filter(level_id=level_id)
        data = []

        for course in courses:
            course_quiz = Quiz.objects.filter(course=course).first()

            data.append({
                "id": course.id,
                "title": course.title,
                "description": course.description,

                "unlocked": can_access_course(request.user, course),

                "has_quiz": course_quiz is not None,
                "quiz_id": course_quiz.id if course_quiz else None,
            })

        return Response(data)
    
class LearnerLessonListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        lessons = Lesson.objects.filter(course_id=course_id).order_by("order")

        data = []

        for lesson in lessons:
            unlocked = can_access_lesson(request.user, lesson)

            data.append({
                "id": lesson.id,
                "title": lesson.title,
                "video": request.build_absolute_uri(lesson.video.url) if lesson.video else None,
                "unlocked": unlocked,
                "completed": LessonProgress.objects.filter(
                    user=request.user,
                    lesson=lesson,
                    is_completed=True
                ).exists(),

                "has_quiz": hasattr(lesson, "quiz"),
                "quiz_id": getattr(getattr(lesson, "quiz", None), "id", None),
            })

        return Response(data)
class LearnerLessonDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        if not can_access_lesson(request.user, lesson):
            return Response({"detail": "This lesson is locked"}, status=403)

        # 🔥 SAFE VIDEO HANDLING
        video_url = None
        if lesson.video:
            try:
                video_url = request.build_absolute_uri(lesson.video.url)
            except Exception:
                video_url = None

        quiz_data = None

        if hasattr(lesson, "quiz"):
            quiz = lesson.quiz
            quiz_data = {
                "id": quiz.id,
                "description": quiz.description,
                "passing_score": quiz.passing_score,
                "questions": [
                    {
                        "id": q.id,
                        "question_text": q.question_text,
                        "options": [
                            {
                                "id": o.id,
                                "option_text": o.option_text
                            }
                            for o in q.options.all()
                        ]
                    }
                    for q in quiz.questions.all()
                ]
            }

        return Response({
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "video": video_url,
            "quiz": quiz_data
        })
               
class LearnerCourseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        course_quiz = Quiz.objects.filter(course=course).first()

        return Response({
            "id": course.id,
            "title": course.title,
            "description": course.description,

            "has_quiz": course_quiz is not None,
            "quiz_id": course_quiz.id if course_quiz else None,
        })
               
class LearnerQuizDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id):
        quiz = (
            Quiz.objects
            .filter(id=quiz_id)
            .prefetch_related("questions__options")
            .first()
        )

        if not quiz:
            return Response({"detail": "Not found"}, status=404)

        return Response({
            "id": quiz.id,
            "description": quiz.description,
            "passing_score": quiz.passing_score,
            "questions": [
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "options": [
                        {
                            "id": o.id,
                            "option_text": o.option_text,
                        }
                        for o in q.options.all()
                    ]
                }
                for q in quiz.questions.all()
            ]
        })


class PublicLevelListView(APIView):
    permission_classes = []  # 🔥 public endpoint

    def get(self, request):
        levels = Level.objects.all().order_by("order")
        serializer = LevelSerializer(levels, many=True)
        return Response(serializer.data)