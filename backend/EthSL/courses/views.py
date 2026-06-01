from django.shortcuts import render
from rest_framework.views import APIView
from users.permissions import IsAdminUserRole
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Level, Course, Lesson, Quiz, Question, Option
from users.models import User
from rest_framework.response import Response
from django.db import models
from django.db.models import Count, Avg, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
import cloudinary
import traceback
import json
import re

 
from progress.models import LessonProgress, QuizAttempt


def normalize_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def has_question_content(q_data, request_files, q_index):
    question_text = q_data.get("question_text")
    if isinstance(question_text, str) and question_text.strip():
        return True
    if f"question_image_{q_index}" in request_files:
        return True
    if f"question_video_{q_index}" in request_files:
        return True
    return False


def has_option_content(o_data, request_files, q_index, o_index):
    option_text = o_data.get("option_text")
    if isinstance(option_text, str) and option_text.strip():
        return True
    if f"option_image_{q_index}_{o_index}" in request_files:
        return True
    if f"option_video_{q_index}_{o_index}" in request_files:
        return True
    return False


def validate_quiz_payload(data, request_files):
    errors = {}

    passing_score = normalize_int(data.get("passing_score"))
    if passing_score is None:
        errors["passing_score"] = "Passing score is required and must be an integer."
    elif passing_score < 1:
        errors["passing_score"] = "Passing score must be at least 1."

    questions = data.get("questions", [])
    if not isinstance(questions, list):
        errors["questions"] = "Questions must be a list."
        return errors

    if len(questions) < 2:
        errors["questions"] = "Quiz must contain at least two questions."

    question_errors = {}
    for q_index, q_data in enumerate(questions):
        q_item_errors = {}

        points = normalize_int(q_data.get("points", 1))
        if points is None:
            q_item_errors["points"] = "Points must be an integer."
        elif points < 1:
            q_item_errors["points"] = "Points must be at least 1."

        if not has_question_content(q_data, request_files, q_index):
            q_item_errors["question"] = "Question must include text, image, or video."

        options = q_data.get("options", [])
        if not isinstance(options, list):
            q_item_errors["options"] = "Options must be a list."
        else:
            option_errors = {}
            for o_index, o_data in enumerate(options):
                if not has_option_content(o_data, request_files, q_index, o_index):
                    option_errors[str(o_index)] = "Each option must include text, image, or video."
            if option_errors:
                q_item_errors["options"] = option_errors

        if q_item_errors:
            question_errors[str(q_index)] = q_item_errors

    if question_errors:
        errors["question_errors"] = question_errors

    return errors


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
        from progress.models import LessonProgress, QuizAttempt
        from certificates.models import Certificate
        from django.utils.timezone import now
        from datetime import timedelta
        from django.db.models import Avg

        today = now()
        thirty_days_ago = today - timedelta(days=30)
        seven_days_ago = today - timedelta(days=7)

        total_levels = Level.objects.count()
        total_courses = Course.objects.count()
        total_lessons = Lesson.objects.count()
        total_quizzes = Quiz.objects.count()
        total_users = User.objects.filter(role='learner').count()
        total_certificates = Certificate.objects.count()

        active_users = User.objects.filter(
            role='learner',
            last_login__gte=thirty_days_ago
        ).count()

        new_registrations = User.objects.filter(
            role='learner',
            date_joined__gte=thirty_days_ago
        ).count()

        quiz_attempts = QuizAttempt.objects.count()
        passed_attempts = QuizAttempt.objects.filter(passed=True).count()

        avg_score_result = QuizAttempt.objects.aggregate(avg=Avg('score'))['avg']
        avg_quiz_score = round(avg_score_result, 1) if avg_score_result else 0

        total_lesson_completions = LessonProgress.objects.filter(is_completed=True).count()
        possible_completions = total_users * total_lessons if total_lessons and total_users else 1
        completion_rate = round((total_lesson_completions / possible_completions) * 100, 1) if possible_completions else 0

        # Learner distribution by level
        level_distribution = {
            'beginner': User.objects.filter(role='learner', level='beginner').count(),
            'intermediate': User.objects.filter(role='learner', level='intermediate').count(),
            'advanced': User.objects.filter(role='learner', level='advanced').count(),
        }

        # Recent registrations (last 5)
        recent_users = list(
            User.objects.filter(role='learner')
            .order_by('-date_joined')[:5]
            .values('id', 'username', 'email', 'date_joined', 'level', 'is_active')
        )
        for u in recent_users:
            u['date_joined'] = u['date_joined'].strftime('%b %d, %Y')

        # Recent quiz attempts (last 5)
        recent_attempts = []
        for attempt in QuizAttempt.objects.select_related('user', 'quiz').order_by('-taken_at')[:5]:
            recent_attempts.append({
                'user': attempt.user.username,
                'quiz': attempt.quiz.description or f'Quiz #{attempt.quiz.id}',
                'score': attempt.score,
                'passed': attempt.passed,
                'date': attempt.taken_at.strftime('%b %d, %Y'),
            })

        # Recent lesson completions (last 5)
        recent_completions = []
        for lp in LessonProgress.objects.select_related('user', 'lesson').filter(is_completed=True).order_by('-completed_at')[:5]:
            recent_completions.append({
                'user': lp.user.username,
                'lesson': lp.lesson.title,
                'date': lp.completed_at.strftime('%b %d, %Y') if lp.completed_at else '',
            })

        # User growth: registrations per day for last 7 days
        user_growth = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            count = User.objects.filter(
                role='learner',
                date_joined__date=day.date()
            ).count()
            user_growth.append({'day': day.strftime('%a'), 'count': count})

        # Quiz performance: pass rate per day for last 7 days
        quiz_trend = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_attempts = QuizAttempt.objects.filter(taken_at__date=day.date())
            total_day = day_attempts.count()
            passed_day = day_attempts.filter(passed=True).count()
            quiz_trend.append({
                'day': day.strftime('%a'),
                'attempts': total_day,
                'passed': passed_day,
            })

        # Most popular courses by lesson completions
        popular_courses = []
        for course in Course.objects.annotate(
            completions=Count('lessons__lessonprogress', filter=Q(lessons__lessonprogress__is_completed=True))
        ).order_by('-completions')[:5]:
            popular_courses.append({
                'title': course.title,
                'completions': course.completions,
            })

        # Placement test stats
        placement_quizzes = Quiz.objects.filter(level__isnull=False, lesson__isnull=True, course__isnull=True)
        placement_attempts = QuizAttempt.objects.filter(quiz__in=placement_quizzes)
        placement_total = placement_attempts.count()
        placement_passed = placement_attempts.filter(passed=True).count()
        placement_pass_rate = round((placement_passed / placement_total) * 100, 1) if placement_total else 0

        # Reported users count
        from community.models import Report
        from django.db.models import Count as DCount
        reported_users_count = (
            Report.objects
            .values('reported_user')
            .annotate(c=DCount('id'))
            .count()
        )

        return Response({
            'total_learners': total_users,
            'total_levels': total_levels,
            'total_courses': total_courses,
            'total_lessons': total_lessons,
            'total_quizzes': total_quizzes,
            'total_certificates': total_certificates,
            'active_users': active_users,
            'new_registrations': new_registrations,
            'quiz_attempts': quiz_attempts,
            'avg_quiz_score': avg_quiz_score,
            'completion_rate': completion_rate,
            'reported_users_count': reported_users_count,
            'level_distribution': level_distribution,
            'recent_users': recent_users,
            'recent_quiz_attempts': recent_attempts,
            'recent_completions': recent_completions,
            'user_growth': user_growth,
            'quiz_trend': quiz_trend,
            'popular_courses': popular_courses,
            'placement_stats': {
                'total': placement_total,
                'passed': placement_passed,
                'pass_rate': placement_pass_rate,
            },
        })
class AdminQuizListCreateView(APIView):
    permission_classes = [IsAdminUserRole]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        quizzes = Quiz.objects.all()
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    def post(self, request):
        raw = request.data.get("data")
        if not raw:
            return Response({"error": "'data' field is missing"}, status=400)
        try:
            data = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return Response({"error": "Invalid JSON in 'data' field"}, status=400)

        request_files = request.FILES

        validation_errors = validate_quiz_payload(data, request_files)
        if validation_errors:
            return Response({"errors": validation_errors}, status=400)

        quiz = Quiz.objects.create(
            lesson_id=data.get("lesson"),
            course_id=data.get("course"),
            level_id=data.get("level"),
            quiz_type=data.get("quiz_type", "lesson"),
            description=data.get("description"),
            passing_score=data.get("passing_score"),
        )

        for q_index, q_data in enumerate(data.get("questions", [])):
            question = Question.objects.create(
                quiz=quiz,
                question_text=q_data.get("question_text", ""),
                points=q_data.get("points", 1),
            )

            img_key = f"question_image_{q_index}"
            vid_key = f"question_video_{q_index}"

            if img_key in request_files:
                question.question_image = request_files[img_key]
            if vid_key in request_files:
                question.question_video = request_files[vid_key]

            question.save()

            for o_index, o_data in enumerate(q_data.get("options", [])):
                option = Option.objects.create(
                    question=question,
                    option_text=o_data.get("option_text", ""),
                    is_correct=o_data.get("is_correct", False),
                )

                o_img = f"option_image_{q_index}_{o_index}"
                o_vid = f"option_video_{q_index}_{o_index}"

                if o_img in request_files:
                    option.option_image = request_files[o_img]
                if o_vid in request_files:
                    option.option_video = request_files[o_vid]

                option.save()

        return Response({"message": "Quiz created"}, status=201)


class AdminQuizDetailView(APIView):
    permission_classes = [IsAdminUserRole]
    parser_classes = (MultiPartParser, FormParser)

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

        raw = request.data.get("data")
        if not raw:
            return Response({"error": "'data' field is missing"}, status=400)
        try:
            data = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return Response({"error": "Invalid JSON in 'data' field"}, status=400)

        request_files = request.FILES

        validation_errors = validate_quiz_payload(data, request_files)
        if validation_errors:
            return Response({"errors": validation_errors}, status=400)

        quiz.lesson_id = data.get("lesson")
        quiz.course_id = data.get("course")
        quiz.level_id = data.get("level")
        quiz.quiz_type = data.get("quiz_type", quiz.quiz_type)
        quiz.description = data.get("description")
        quiz.passing_score = data.get("passing_score")
        quiz.save()

        # Get existing questions
        existing_questions = list(quiz.questions.all())
        new_questions_data = data.get("questions", [])

        # Delete questions that are no longer in the update
        if len(new_questions_data) < len(existing_questions):
            for i in range(len(new_questions_data), len(existing_questions)):
                existing_questions[i].delete()

        # Update or create questions
        for q_index, q_data in enumerate(new_questions_data):
            img_key = f"question_image_{q_index}"
            vid_key = f"question_video_{q_index}"

            # Use existing question if available, otherwise create new one
            if q_index < len(existing_questions):
                question = existing_questions[q_index]
                question.question_text = q_data.get("question_text", "")
                question.points = q_data.get("points", 1)
            else:
                question = Question.objects.create(
                    quiz=quiz,
                    question_text=q_data.get("question_text", ""),
                    points=q_data.get("points", 1),
                )

            # Only update files if new ones are provided
            if img_key in request_files:
                question.question_image = request_files[img_key]
            if vid_key in request_files:
                question.question_video = request_files[vid_key]

            question.save()

            # Delete existing options and recreate them
            question.options.all().delete()

            for o_index, o_data in enumerate(q_data.get("options", [])):
                option = Option.objects.create(
                    question=question,
                    option_text=o_data.get("option_text", ""),
                    is_correct=o_data.get("is_correct", False),
                )

                o_img = f"option_image_{q_index}_{o_index}"
                o_vid = f"option_video_{q_index}_{o_index}"

                if o_img in request_files:
                    option.option_image = request_files[o_img]
                if o_vid in request_files:
                    option.option_video = request_files[o_vid]

                option.save()

        return Response(QuizSerializer(quiz).data)

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

class LearnerCurriculumView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        levels = Level.objects.prefetch_related('courses__lessons').order_by('order')
        curriculum = []

        for level in levels:
            level_quiz = Quiz.objects.filter(level=level).first()
            course_items = []

            for course in level.courses.all():
                course_quiz = Quiz.objects.filter(course=course).first()
                lesson_items = []

                for lesson in course.lessons.all().order_by('order'):
                    lesson_items.append({
                        "id": lesson.id,
                        "title": lesson.title,
                        "unlocked": can_access_lesson(user, lesson),
                        "completed": LessonProgress.objects.filter(
                            user=user,
                            lesson=lesson,
                            is_completed=True
                        ).exists(),
                        "has_quiz": hasattr(lesson, "quiz"),
                        "quiz_id": getattr(getattr(lesson, "quiz", None), "id", None),
                    })

                course_items.append({
                    "id": course.id,
                    "title": course.title,
                    "description": course.description,
                    "unlocked": can_access_course(user, course),
                    "has_quiz": course_quiz is not None,
                    "quiz_id": course_quiz.id if course_quiz else None,
                    "lessons": lesson_items,
                })

            curriculum.append({
                "id": level.id,
                "name": level.name,
                "display_name": level.get_name_display(),
                "order": level.order,
                "unlocked": can_access_level(user, level),
                "has_quiz": level_quiz is not None,
                "quiz_id": level_quiz.id if level_quiz else None,
                "can_take_quiz": can_take_level_quiz(user, level),
                "courses": course_items,
            })

        return Response(curriculum)

class LearnerLessonDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        
        print("VIDEO FIELD:", lesson.video)

        if not can_access_lesson(request.user, lesson):
            return Response({"detail": "This lesson is locked"}, status=403)

        # 🔥 SAFE VIDEO HANDLING
        video_url = None
         

        if lesson.video:
            try:
                path = lesson.video.name

                match = re.search(
                    r'v(\d+)/(.*)$',
                    path
                )

                if match:
                    version = match.group(1)
                    filename = match.group(2)

                    video_url = (
                        f"https://res.cloudinary.com/"
                        f"dn5rumfy7/video/upload/"
                        f"v{version}/{filename}"
                    )

                print("FINAL VIDEO URL:", video_url)

            except Exception as e:
                print("VIDEO ERROR:", e)
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
            print("VIDEO FIELD:", lesson.video)
            print("VIDEO URL:", lesson.video.url)
        return Response({
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "video": video_url,
            "quiz": quiz_data,
            "completed": LessonProgress.objects.filter(
                user=request.user,
                lesson=lesson,
                is_completed=True
            ).exists(),
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

        serializer = QuizSerializer(quiz)

        return Response(serializer.data)



class PublicLevelListView(APIView):
    permission_classes = []  # 🔥 public endpoint

    def get(self, request):
        levels = Level.objects.all().order_by("order")
        serializer = LevelSerializer(levels, many=True)
        return Response(serializer.data)
