from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import render

from rest_framework import generics
from .serializers import RegisterSerializer, UserSerializer, UserReportSerializer
from .models import User, UserReport
from users.permissions import IsAdminUserRole
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from progress.models import LessonProgress
from community.models import Report
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import smart_bytes
from django.utils.encoding import force_bytes
 

import resend
from django.conf import settings



from .serializers import RegisterSerializer
from .models import User
 
from .password_serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)

from .admin_password_serializer import (
    AdminPasswordResetRequestSerializer,
    AdminPasswordResetConfirmSerializer
)
resend.api_key = settings.RESEND_API_KEY


def _blacklist_all_tokens(user):
    """Blacklist all outstanding refresh tokens for a user."""
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
    tokens = OutstandingToken.objects.filter(user=user)
    for token in tokens:
        BlacklistedToken.objects.get_or_create(token=token)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass  # already blacklisted or invalid — still log out
        return Response({"detail": "Logged out successfully."}, status=200)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        print("REGISTER PAYLOAD:", request.data)

        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors, status=400)

        user = serializer.save()
            

        # EMAIL VERIFICATION
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        verify_link = f"https://ethsl-system-jl5a.vercel.app/verify-email/{uid}/{token}/"
        #verify_link = f"http://localhost:5173/verify-email/{uid}/{token}/"

        try:
            resend.Emails.send({
                "from": "ETHSL <onboarding@resend.dev>",
                "to": [user.email],
                "subject": "Verify your email",
                "text": f"Click to verify your email:\n{verify_link}",
            })
        except Exception as e:
            print("EMAIL ERROR:", e)

        return Response({
            "message": "Verification email sent, Verify and you will be redirected to login.",
            "uidb64": uid,
        }, status=201)
        
class EmailVerificationStatusView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            return Response({"verified": user.email_verified})
        except Exception:
            return Response({"verified": False})


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"error": "Invalid link"}, status=400)

        # Already verified — treat as success so re-clicks on the link still work
        if user.email_verified and user.is_active:
            return Response({"message": "Email already verified"})

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=400)

        user.email_verified = True
        user.is_active = True
        user.save(update_fields=["email_verified", "is_active"])
        return Response({"message": "Email verified successfully"})
        
 
# ---------------- REQUEST PASSWORD RESET ----------------
class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)

            uid = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)

            reset_link = (
                f"https://ethsl-system-jl5a.vercel.app/reset-password/{uid}/{token}/"
            )

            # ---------------- RESEND EMAIL ----------------
            # send_mail(
            #     subject="Password Reset Request",
            #     message=f"Use this link to reset your password:\n{reset_link}",
            #     from_email=settings.DEFAULT_FROM_EMAIL,
            #     recipient_list=[email],
            #     fail_silently=False,  # IMPORTANT for production
            # )
            
            resend.Emails.send({
                "from": "ETHSL <onboarding@resend.dev>",
                "to": [email],
                "subject": "Password Reset Request",
                "text": f"Click the link below to reset your password:\n\n{reset_link}",
            })

        except User.DoesNotExist:
            # security: don't reveal user existence
            pass

        except Exception as e:
            print("EMAIL ERROR:", e)

        return Response(
            {"message": "If email exists, reset link sent."},
            status=status.HTTP_200_OK
        )


# ---------------- CONFIRM PASSWORD RESET ----------------
class PasswordResetConfirmView(APIView):
    def post(self, request, uidb64, token):
        data = request.data.copy()
        data["uidb64"] = uidb64
        data["token"] = token

        serializer = PasswordResetConfirmSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        # 🔥 IMPORTANT: actually update password
        serializer.save()

        return Response(
            {"message": "Password reset successful."},
            status=status.HTTP_200_OK
        )
        
class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        users = User.objects.all()

        data = []

        for user in users:
            reports_count = Report.objects.filter(
                reported_user=user
            ).count()

            user_data = UserSerializer(user).data
            user_data["reports_count"] = reports_count

            data.append(user_data)

        return Response(data)
    
class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        from .admin_profile_serializer import AdminProfileSerializer
        serializer = AdminProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        from .admin_profile_serializer import AdminProfileSerializer
        user = request.user
        serializer = AdminProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError

        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not current_password or not new_password:
            return Response({"detail": "All fields are required."}, status=400)

        if not user.check_password(current_password):
            return Response({"detail": "Current password is incorrect."}, status=400)

        if user.check_password(new_password):
            return Response(
                {"detail": "New password must be different from your current password."},
                status=400
            )

        try:
            validate_password(new_password, user)
        except DjangoValidationError as e:
            return Response({"detail": e.messages[0]}, status=400)

        user.set_password(new_password)
        user.save()
        _blacklist_all_tokens(user)
        return Response({"detail": "Password updated successfully."})


class EmailChangeRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .models import EmailChangeToken
        from django.core.validators import validate_email
        from django.core.exceptions import ValidationError as DjangoValidationError

        new_email = request.data.get("new_email", "").strip().lower()

        if not new_email:
            return Response({"detail": "Email is required."}, status=400)

        try:
            validate_email(new_email)
        except DjangoValidationError:
            return Response({"detail": "Invalid email format."}, status=400)

        if new_email == request.user.email.lower():
            return Response({"detail": "New email must be different from your current email."}, status=400)

        if User.objects.filter(email__iexact=new_email).exclude(pk=request.user.pk).exists():
            return Response({"detail": "This email is already in use by another account."}, status=400)

        # Invalidate previous unused tokens for this user
        EmailChangeToken.objects.filter(user=request.user, used=False).delete()

        # Generate token the same way registration does
        record = EmailChangeToken.objects.create(user=request.user, new_email=new_email)
        uid = urlsafe_base64_encode(force_bytes(record.pk))
        token = default_token_generator.make_token(request.user)

        # Route to the correct frontend based on role
        if request.user.role == 'admin':
            frontend_base = "https://ethsl-system.vercel.app"
        else:
            frontend_base = "https://ethsl-system-jl5a.vercel.app"

        verify_link = f"{frontend_base}/verify-email-change/{uid}/{token}/"

        resend.Emails.send({
            "from": "ETHSL <onboarding@resend.dev>",
            "to": [new_email],
            "subject": "Verify your new email address",
            "text": (
                f"You requested an email change for your ETHSL account.\n\n"
                f"Click the link below to verify your new email address:\n{verify_link}\n\n"
                f"This link expires in 24 hours. If you did not request this, ignore this email."
            ),
        })

        return Response({"detail": "Verification email sent. Please verify your new email address to complete the update."})


class EmailChangeConfirmView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        from .models import EmailChangeToken

        try:
            record_pk = force_str(urlsafe_base64_decode(uidb64))
            record = EmailChangeToken.objects.get(pk=record_pk)
        except Exception:
            return Response({"error": "Invalid or already-used verification link."}, status=400)

        if record.used:
            return Response({"error": "This verification link has already been used."}, status=400)

        if record.is_expired():
            return Response({"error": "This verification link has expired."}, status=400)

        if not default_token_generator.check_token(record.user, token):
            return Response({"error": "Invalid or expired token."}, status=400)

        if User.objects.filter(email__iexact=record.new_email).exclude(pk=record.user.pk).exists():
            return Response({"error": "This email is already in use by another account."}, status=400)

        record.user.email = record.new_email
        record.user.save(update_fields=["email"])
        record.used = True
        record.save(update_fields=["used"])
        _blacklist_all_tokens(record.user)

        return Response({"message": "Email updated successfully."})
    

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        from progress.models import QuizAttempt
        from courses.models import Course, Lesson
        from django.db.models import Avg

        user = request.user
        serializer = UserSerializer(user)
        data = serializer.data

        completed_lessons = LessonProgress.objects.filter(
            user=user, is_completed=True
        ).count()

        quizzes_passed = QuizAttempt.objects.filter(
            user=user, passed=True
        ).count()

        quiz_avg = QuizAttempt.objects.filter(
            user=user
        ).aggregate(avg=Avg("score"))["avg"]

        # Course progress
        course_progress = []
        for course in Course.objects.all():
            total = Lesson.objects.filter(course=course).count()
            if total == 0:
                continue
            completed = LessonProgress.objects.filter(
                user=user,
                lesson__course=course,
                is_completed=True
            ).count()
            course_progress.append({
                "id": course.id,
                "title": course.title,
                "completed_lessons": completed,
                "total_lessons": total,
                "progress": round((completed / total) * 100),
            })

        data["stats"] = {
            "completed_lessons": completed_lessons,
            "quizzes_passed": quizzes_passed,
            "quiz_average": round(quiz_avg, 1) if quiz_avg else None,
            "current_level": user.get_level_display(),
            "streak_count": user.streak_count,
        }
        data["course_progress"] = course_progress

        return Response(data)

    def put(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        return self.put(request)


class CompleteProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        user = request.user
        data = request.data

        # Required: level
        level = data.get('level')
        if not level or level not in ['beginner', 'intermediate', 'advanced']:
            return Response({'detail': 'Level is required.'}, status=400)

        user.level = level
        user.placement_required = level in ['intermediate', 'advanced']
        user.placement_passed = level == 'beginner'

        # Optional fields
        if data.get('bio'):
            user.bio = data.get('bio')
        if data.get('country'):
            user.country = data.get('country')
        if data.get('learning_goal'):
            user.learning_goal = data.get('learning_goal')
        if data.get('learning_style'):
            user.learning_style = data.get('learning_style')
        if data.get('daily_study_time'):
            user.daily_study_time = data.get('daily_study_time')

        # Avatar upload to Cloudinary
        avatar = request.FILES.get('avatar')
        if avatar:
            import cloudinary.uploader
            result = cloudinary.uploader.upload(
                avatar,
                folder='images/avatar',
                resource_type='image'
            )
            user.avatar = result['secure_url']

        user.profile_completed = True
        user.save()

        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'placement_required': user.placement_required,
        })


class PlacementTestView(APIView):
    """Returns the placement quiz for the requested level (intermediate or advanced)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from courses.models import Quiz
        from courses.serializers import QuizSerializer

        level_name = request.query_params.get('level', '').lower()
        if level_name not in ('intermediate', 'advanced'):
            return Response({'detail': 'level query param must be intermediate or advanced.'}, status=400)

        level_order = {'intermediate': 2, 'advanced': 3}
        order = level_order[level_name]

        quiz = Quiz.objects.filter(
            quiz_type='placement',
            level__order=order,
            lesson__isnull=True,
            course__isnull=True,
        ).prefetch_related('questions__options').first()

        if not quiz:
            quiz = Quiz.objects.filter(
                level__order=order,
                lesson__isnull=True,
                course__isnull=True,
            ).prefetch_related('questions__options').first()
            if quiz:
                quiz.quiz_type = 'placement'
                quiz.save(update_fields=['quiz_type'])

        if not quiz:
            return Response({'quiz_id': None, 'questions': []})

        serializer = QuizSerializer(quiz)
        return Response(serializer.data)


class PlacementSubmitView(APIView):
    """Scores placement test, assigns level, sets placement_passed."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from courses.models import Quiz, Question, Option
        from progress.models import QuizAttempt, Answer

        quiz_id = request.data.get('quiz_id')
        answers_data = request.data.get('answers', [])
        desired_level = request.data.get('desired_level', 'beginner')

        user = request.user

        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({'detail': 'Quiz not found.'}, status=404)

        attempt = QuizAttempt.objects.create(user=user, quiz=quiz)
        score = 0
        total_points = 0

        for ans in answers_data:
            try:
                question = Question.objects.get(id=ans['question'])
                option = Option.objects.get(id=ans['selected_option'])
                total_points += question.points
                if option.is_correct:
                    score += question.points
                Answer.objects.create(
                    attempt=attempt,
                    question=question,
                    selected_option=option,
                    is_correct=option.is_correct
                )
            except (Question.DoesNotExist, Option.DoesNotExist):
                continue

        passed = score >= quiz.passing_score
        attempt.score = score
        attempt.passed = passed
        attempt.save()

        if passed:
            user.level = desired_level
            user.placement_passed = True
            user.placement_required = False
        else:
            # Failed — fall back to beginner
            user.level = 'beginner'
            user.placement_passed = True
            user.placement_required = False

        user.save()

        return Response({
            'score': score,
            'passed': passed,
            'assigned_level': user.level,
            'assigned_level_display': user.get_level_display(),
        })


# ---------------- REPORT USER ----------------
class ReportUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UserReportSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(reporter=request.user)

            reported_user = serializer.validated_data["reported_user"]

            total_reports = UserReport.objects.filter(
                reported_user=reported_user
            ).count()

            return Response({
                "detail": "User reported successfully",
                "reports": total_reports
            }, status=201)

        return Response(serializer.errors, status=400)


# ---------------- WARN USER ----------------
class WarnUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

            message = request.data.get("message", "").strip()
            if not message:
                return Response({"detail": "Warning reason is required."}, status=400)

            from django.utils.timezone import now
            user.warning_message = message
            user.warning_date = now()
            user.save()

            return Response({
                "detail": f"{user.username} warned successfully"
            })

        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

 
 
# ---------------- DEACTIVATE USER ----------------
class DeactivateUserView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsAdminUserRole
    ]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

            # Prevent admin/superadmin deactivation
            if (
                user.role == "admin"
                or user.is_superuser
            ):
                return Response(
                    {
                        "detail":
                        "Admin accounts cannot be deactivated."
                    },
                    status=403
                )

            user.is_active = False
            user.save()

            return Response({
                "detail":
                "User deactivated successfully"
            })

        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=404
            )

# ---------------- ACTIVATE USER ----------------

class ActivateUserView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsAdminUserRole
    ]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

            if (
                user.role == "admin"
                or user.is_superuser
            ):
                return Response(
                    {
                        "detail":
                        "Admin accounts cannot be modified."
                    },
                    status=403
                )

            user.is_active = True
            user.save()

            return Response({
                "detail":
                "User activated successfully"
            })

        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=404
            )
 
 


# ---------------- ADMIN PASSWORD RESET ----------------
class AdminPasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("Request data:", request.data)

        serializer = AdminPasswordResetRequestSerializer(data=request.data)

        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(
                email=email,
                role="admin",
                is_active=True
            )

            uid = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)

            reset_link = (
                f"https://ethsl-system.vercel.app/"
                f"admin-reset-password/{uid}/{token}/"
            )
            
            resend.Emails.send({
                "from": "ETHSL <onboarding@resend.dev>",
                "to": [email],
                "subject": "Admin Password Reset",
                "text": f"Click below:\n\n{reset_link}",
            })


            # send_mail(
            #     subject="Admin Password Reset",
            #     message=f"Click below:\n\n{reset_link}",
            #     from_email=settings.DEFAULT_FROM_EMAIL,
            #     recipient_list=[email],
            #     fail_silently=False,
            # )

        except User.DoesNotExist:
            pass

        except Exception as e:
            print("EMAIL ERROR:", e)
            return Response({"error": str(e)}, status=500)

        return Response({
            "message": "If admin account exists, reset email sent."
        })
        
        
class AdminPasswordResetConfirmView(APIView):

    permission_classes = [AllowAny]

    def post(
        self,
        request,
        uidb64,
        token
    ):

        data = request.data.copy()

        data["uidb64"] = uidb64
        data["token"] = token

        serializer = (
            AdminPasswordResetConfirmSerializer(
                data=data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        return Response({
            "message":
            "Admin password updated."
        })