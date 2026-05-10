from rest_framework import serializers
from .models import Post, Comment, Report
from users.models import User
 


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    avatar = serializers.CharField(source="user.avatar", read_only=True)

    class Meta:
        model = Comment
        fields = "__all__"
        read_only_fields = ["user"]


class PostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    avatar = serializers.CharField(source="user.avatar", read_only=True)
    replies = serializers.SerializerMethodField()

    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "username",
            "avatar",
            "title",
            "content",
            "created_at",
            "replies",
            "comments",
        ]
        read_only_fields = ["user"]

    def get_replies(self, obj):
        return obj.comments.count()
    
    
class UserReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["reported_user", "reason"]