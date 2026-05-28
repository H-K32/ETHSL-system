from django.shortcuts import render

from rest_framework import generics
from .serializers import RegisterSerializer, UserSerializer, UserReportSerializer
from .models import User 
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
#from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import smart_bytes

import resend
from django.conf import settings

resend.api_key = settings.RESEND_API_KEY

 
from .password_serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)

from .admin_password_serializer import (
    AdminPasswordResetRequestSerializer,
    AdminPasswordResetConfirmSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        user = serializer.instance

        refresh = RefreshToken.for_user(user)

        print("REGISTER VIEW OVERRIDDEN - JWT VERSION ACTIVE")

        return Response({
            "user": RegisterSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })
        
        
class VerifyEmailView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.email_verified = True
                user.save()
                return Response({"message": "Email verified successfully"})

            return Response({"error": "Invalid token"}, status=400)

        except Exception:
            return Response({"error": "Invalid link"}, status=400)
        
 
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
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not user.check_password(current_password):
            return Response(
                {"detail": "Current password is incorrect"},
                status=400
            )

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password updated successfully"})
    

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

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

            message = request.data.get("message", "You have been warned by admin.")

            user.warning_message = message
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
            
            # resend.Emails.send({
            #     "from": "ETHSL <onboarding@resend.dev>",
            #     "to": [email],
            #     "subject": "Admin Password Reset",
            #     "text": f"Click below:\n\n{reset_link}",
            # })


            send_mail(
                subject="Admin Password Reset",
                message=f"Click below:\n\n{reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

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