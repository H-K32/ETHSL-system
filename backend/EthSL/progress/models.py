from django.db import models 
from django.conf import settings
from courses.models import Lesson, Quiz, Question, Option

User = settings.AUTH_USER_MODEL

class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta: 
        unique_together = ('user', 'lesson')
        
class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    
    score = models.IntegerField(default=0)
    passed = models.BooleanField(default=False)
    
    taken_at = models.DateTimeField(auto_now_add=True)
    
class Answer(models.Model):
    attempt = models.ForeignKey(
        QuizAttempt,
        on_delete=models.CASCADE,
        related_name="answers"
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, on_delete=models.CASCADE)
    
    is_correct = models.BooleanField(default=False)