from django.urls import path

from django.urls import path

from .views import (
 
    PostListCreateView,
    PostDetailView,
    CommentListCreateView,
    ReportUserView,

)

urlpatterns = [
    path("posts/", PostListCreateView.as_view()),
    path("posts/<int:post_id>/", PostDetailView.as_view()),

    path("comments/", CommentListCreateView.as_view()),

    path("report/", ReportUserView.as_view()),
]