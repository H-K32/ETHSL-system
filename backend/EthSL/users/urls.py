from django.urls import path
from .views import (
    LogoutView,
    RegisterView,
    VerifyEmailView,
    EmailVerificationStatusView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    AdminPasswordResetRequestView,
    AdminPasswordResetConfirmView,
    AdminUserListView,
    AdminProfileView,
    ChangePasswordView,
    EmailChangeRequestView,
    EmailChangeConfirmView,
    UserProfileView,
    CompleteProfileView,
    PlacementTestView,
    PlacementSubmitView,
    ReportUserView,
    WarnUserView,
    ActivateUserView,
    DeactivateUserView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from .serializers import EmailOrUsernameTokenSerializer
from rest_framework_simplejwt.views import TokenObtainPairView as BaseTokenView

class CustomTokenObtainPairView(BaseTokenView):
    serializer_class = EmailOrUsernameTokenSerializer

urlpatterns = [
    # Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),

    # Password Reset
    path(
        "admin/password-reset/",
        AdminPasswordResetRequestView.as_view(),
        name="admin_password_reset",
    ),

    path(
        "admin/password-reset-confirm/<uidb64>/<token>/",
        AdminPasswordResetConfirmView.as_view(),
        name="admin_password_reset_confirm",
    ),
    # User Profile
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("complete-profile/", CompleteProfileView.as_view(), name="complete_profile"),
    path("placement/", PlacementTestView.as_view(), name="placement_test"),
    path("placement/submit/", PlacementSubmitView.as_view(), name="placement_submit"),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change_password",
    ),
    path(
        "email-change-request/",
        EmailChangeRequestView.as_view(),
        name="email_change_request",
    ),
    path(
        "email-change-confirm/<uidb64>/<token>/",
        EmailChangeConfirmView.as_view(),
        name="email_change_confirm",
    ),

    # Admin
    path("list/", AdminUserListView.as_view(), name="admin_user_list"),
    path("admin/profile/", AdminProfileView.as_view(), name="admin_profile"),
    path("warn/<int:user_id>/", WarnUserView.as_view(), name="warn_user"),
    path(
        "activate/<int:user_id>/",
        ActivateUserView.as_view(),
        name="activate_user",
    ),
    path(
        "deactivate/<int:user_id>/",
        DeactivateUserView.as_view(),
        name="deactivate_user",
    ),

    # Reports
    path("report/", ReportUserView.as_view(), name="report_user"),
    
    
 
    path('verify-email/<uidb64>/<token>/', VerifyEmailView.as_view()),
    path('email-verification-status/<uidb64>/', EmailVerificationStatusView.as_view()),
    
        # Password Reset (USER)
    path(
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="password_reset",
    ),

    path(
        "password-reset-confirm/<uidb64>/<token>/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
 
]