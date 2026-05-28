from django.urls import path
from .views import (
    RegisterView,
    VerifyEmailView,
    CustomLoginView,

    PasswordResetRequestView,
    PasswordResetConfirmView,

    AdminPasswordResetRequestView,
    AdminPasswordResetConfirmView,

    AdminUserListView,
    AdminProfileView,

    ChangePasswordView,
    UserProfileView,

    ReportUserView,
    WarnUserView,
    ActivateUserView,
    DeactivateUserView,
)

from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    # Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomLoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", TokenBlacklistView.as_view(), name="logout"),

    # Email Verification
    path("verify-email/<uidb64>/<token>/", VerifyEmailView.as_view(), name="verify_email"),

    # Password Reset (User)
    path("password-reset/", PasswordResetRequestView.as_view(), name="password_reset"),
    path(
        "password-reset-confirm/<uidb64>/<token>/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),

    # Password Reset (Admin)
    path("admin/password-reset/", AdminPasswordResetRequestView.as_view(), name="admin_password_reset"),
    path(
        "admin/password-reset-confirm/<uidb64>/<token>/",
        AdminPasswordResetConfirmView.as_view(),
        name="admin_password_reset_confirm",
    ),

    # User Profile
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),

    # Admin
    path("list/", AdminUserListView.as_view(), name="admin_user_list"),
    path("admin/profile/", AdminProfileView.as_view(), name="admin_profile"),
    path("warn/<int:user_id>/", WarnUserView.as_view(), name="warn_user"),
    path("activate/<int:user_id>/", ActivateUserView.as_view(), name="activate_user"),
    path("deactivate/<int:user_id>/", DeactivateUserView.as_view(), name="deactivate_user"),

    # Reports
    path("report/", ReportUserView.as_view(), name="report_user"),
]