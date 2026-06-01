from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

from .models import Post, Comment, Report
from users.models import User
from .serializers import CommentSerializer, PostSerializer, UserReportSerializer
from django.contrib.auth import get_user_model


User = get_user_model()
# ---------------- POSTS ----------------
class PostListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = Post.objects.all().order_by("-created_at")
        return Response(PostSerializer(posts, many=True).data)

    def post(self, request):
        serializer = PostSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


# ---------------- POST DETAIL / EDIT / DELETE ----------------
class PostDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        return Response(PostSerializer(post).data)

    def patch(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        if post.user != request.user:
            return Response({'detail': 'Not allowed.'}, status=403)
        if timezone.now() - post.created_at > timedelta(hours=48):
            return Response({'detail': 'Posts can only be edited within 48 hours of creation.'}, status=403)
        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        if post.user != request.user:
            return Response({'detail': 'Not allowed.'}, status=403)
        if timezone.now() - post.created_at > timedelta(hours=48):
            return Response({'detail': 'Posts can only be deleted within 48 hours of creation.'}, status=403)
        post.delete()
        return Response(status=204)


# ---------------- COMMENTS ----------------
class CommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        post_id = request.query_params.get("post")

        if not post_id:
            return Response({"error": "post query param required"}, status=400)

        comments = Comment.objects.filter(post_id=post_id).order_by("created_at")
        return Response(CommentSerializer(comments, many=True).data)

    def post(self, request):
        if not request.data.get('content', '').strip():
            return Response({'detail': 'Reply field cannot be empty.'}, status=400)
        serializer = CommentSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


# ---------------- REPORT ----------------
class ReportUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UserReportSerializer(data=request.data)

        if serializer.is_valid():
            reported_user = serializer.validated_data["reported_user"]

            Report.objects.create(
                reporter=request.user,
                reported_user=reported_user,
                reason=serializer.validated_data["reason"],
            )

            return Response({"detail": "User reported successfully"}, status=201)

        return Response(serializer.errors, status=400)


# ---------------- REPORTS AGAINST ME ----------------
class ReportsAgainstMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reports = Report.objects.filter(reported_user=request.user).values('reason')
        return Response(list(reports))