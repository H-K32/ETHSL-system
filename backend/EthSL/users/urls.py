from django.urls import path
from .views import (
    RegisterView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    AdminUserListView,
    AdminProfileView, 
    ChangePasswordView,
    UserProfileView,
    
    ReportUserView,
    WarnUserView,
    RemoveUserView,
    
    

 
    )
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
    
)

urlpatterns = [
   
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='logout'),
    path('list/', AdminUserListView.as_view(), name='admin_user_list'),
]

urlpatterns += [
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path(
        'password-reset-confirm/<uidb64>/<token>/',
        PasswordResetConfirmView.as_view(),
        name='password_reset_confirm'
    ),
]

urlpatterns += [
    path("admin/profile/", AdminProfileView.as_view()),
    path("profile/", UserProfileView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
    
    path("report/", ReportUserView.as_view()),
    path("warn/<int:user_id>/", WarnUserView.as_view()),
    path("remove/<int:user_id>/", RemoveUserView.as_view()),
]