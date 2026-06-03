from django.urls import path
from .views import AskTutorView, ModerateContentView, TranslateView

urlpatterns = [
    path('ask/', AskTutorView.as_view()),
    path('moderate/', ModerateContentView.as_view()),
    path('translate/', TranslateView.as_view()),
]
