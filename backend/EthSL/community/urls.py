from django.urls import path

from .views import (
    PostListCreateView,
    PostDetailView,
    CommentListCreateView,
    ReportUserView,
    ReportsAgainstMeView,
    AdminReportedUsersView,
    AdminUserReportDetailView,
)

urlpatterns = [
    path("posts/", PostListCreateView.as_view()),
    path("posts/<int:post_id>/", PostDetailView.as_view()),
    path("comments/", CommentListCreateView.as_view()),
    path("report/", ReportUserView.as_view()),
    path("reports-against-me/", ReportsAgainstMeView.as_view()),
    path("admin/reported-users/", AdminReportedUsersView.as_view()),
    path("admin/reported-users/<int:user_id>/", AdminUserReportDetailView.as_view()),
]
