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
    
class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(
            {"message": "Password reset link sent if email exists."},
            status=status.HTTP_200_OK
            
        )
        
class PasswordResetConfirmView(APIView):
    def post(self, request, uidb64, token):
        data = request.data.copy()
        data['uidb64'] = uidb64
        data['token'] = token
        
        serializer = PasswordResetConfirmSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        
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

    def post(self, request):

        serializer = (
            AdminPasswordResetRequestSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        return Response({
            "message":
            "If admin account exists, reset email sent."
        })


class AdminPasswordResetConfirmView(APIView):

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