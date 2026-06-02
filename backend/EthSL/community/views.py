from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Max

from .models import Post, Comment, Report
from users.models import User
from users.permissions import IsAdminUserRole
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

            if reported_user == request.user:
                return Response({"detail": "You cannot report yourself."}, status=400)

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


# ---------------- ADMIN: REPORTED USERS LIST ----------------
class AdminReportedUsersView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        reported = (
            Report.objects
            .values('reported_user')
            .annotate(report_count=Count('id'), last_report=Max('created_at'))
            .filter(report_count__gte=1)
            .order_by('-report_count')
        )

        data = []
        for entry in reported:
            try:
                user = User.objects.get(pk=entry['reported_user'])
            except User.DoesNotExist:
                continue
            data.append({
                'id': user.id,
                'username': user.username,
                'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'email': user.email,
                'report_count': entry['report_count'],
                'last_report': entry['last_report'].strftime('%b %d, %Y') if entry['last_report'] else '',
                'is_active': user.is_active,
            })
        return Response(data)


# ---------------- ADMIN: REPORT DETAILS FOR A USER ----------------
class AdminUserReportDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request, user_id):
        try:
            reported_user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)

        reports = Report.objects.filter(reported_user=reported_user).select_related('reporter').order_by('-created_at')

        report_list = []
        for r in reports:
            report_list.append({
                'id': r.id,
                'reported_by': r.reporter.username,
                'reporter_email': r.reporter.email,
                'reason': r.reason,
                'date': r.created_at.strftime('%b %d, %Y %H:%M') if r.created_at else '',
            })

        return Response({
            'user': {
                'id': reported_user.id,
                'username': reported_user.username,
                'full_name': f"{reported_user.first_name} {reported_user.last_name}".strip() or reported_user.username,
                'email': reported_user.email,
                'is_active': reported_user.is_active,
                'date_joined': reported_user.date_joined.strftime('%b %d, %Y'),
            },
            'reports': report_list,
            'total_reports': len(report_list),
        })