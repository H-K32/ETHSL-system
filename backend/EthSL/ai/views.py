from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from courses.models import Lesson, Course, Level, Quiz, Question
from community.models import Post, Comment, Report
from django.conf import settings
from .translation_service import get_translation_service
import logging

logger = logging.getLogger(__name__)

# ── Optional Gemini client for tutor/moderation ───────────────
_client = None
_api_key = getattr(settings, 'GEMINI_API_KEY', None)

if _api_key:
    try:
        from google import genai
        _client = genai.Client(api_key=_api_key)
        _MODEL = 'gemini-2.0-flash'
        logger.info('[AI] Gemini client initialized')
    except Exception as e:
        logger.warning('[AI] Gemini not available: %s', e)

# ── Translatable types ────────────────────────────────────────
TRANSLATABLE_TYPES = {
    'lesson':   (Lesson,   ['title', 'description']),
    'course':   (Course,   ['title', 'description']),
    'level':    (Level,    ['name']),
    'quiz':     (Quiz,     ['description']),
    'question': (Question, ['question_text']),
    'post':     (Post,     ['title', 'content']),
    'comment':  (Comment,  ['content']),
    'report':   (Report,   ['reason']),
}


class AskTutorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '').strip()
        lesson_id = request.data.get('lesson_id')

        if not message:
            return Response({'error': 'Message is required'}, status=400)
        if not _client:
            return Response({'error': 'AI tutor is not configured.'}, status=503)

        context = ""
        if lesson_id:
            try:
                lesson = Lesson.objects.get(pk=lesson_id)
                context = f"Lesson: {lesson.title}\n{lesson.description or ''}"
            except Lesson.DoesNotExist:
                pass

        prompt = (
            "You are a helpful tutor for an Ethiopian Sign Language (ETHSL) learning platform. "
            "Answer questions clearly and concisely, focused on the lesson content provided. "
            "If the question is unrelated to the lesson or sign language learning, politely redirect."
        )
        if context:
            prompt += f"\n\nCurrent lesson context:\n{context}"
        prompt += f"\n\nStudent question: {message}"

        try:
            response = _client.models.generate_content(model=_MODEL, contents=prompt)
            return Response({'reply': response.text.strip()})
        except Exception as e:
            logger.error('[AskTutor] Gemini failed: %s', e, exc_info=True)
            return Response({'error': 'AI service unavailable.'}, status=503)


class TranslateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        translation_service = get_translation_service()

        content_type = request.data.get('type')
        content_id   = request.data.get('id')
        field        = request.data.get('field')

        if not all([content_type, content_id, field]):
            return Response({'error': 'type, id and field are required'}, status=400)
        if content_type not in TRANSLATABLE_TYPES:
            return Response({'error': f'Unsupported type "{content_type}"'}, status=400)

        ModelClass, allowed_fields = TRANSLATABLE_TYPES[content_type]
        if field not in allowed_fields:
            return Response({'error': f'Field "{field}" is not translatable for type "{content_type}"'}, status=400)

        try:
            obj = ModelClass.objects.get(pk=content_id)
        except ModelClass.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        from courses.models import Level as LevelModel
        original = obj.get_name_display() if (isinstance(obj, LevelModel) and field == 'name') else (getattr(obj, field, '') or '')
        if not original.strip():
            return Response({'translated': ''})

        cached = translation_service.check_cache(obj, field)
        if cached:
            return Response({'translated': cached})

        try:
            translated = translation_service.translate(original)
        except Exception as e:
            logger.error('[TranslateView] Translation error: %s', e, exc_info=True)
            return Response({'error': 'Translation service unavailable.'}, status=503)

        translation_service.save_cache(obj, field, translated)
        return Response({'translated': translated})


class ModerateContentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'flagged': False})
        if not _client:
            return Response({'flagged': False})

        prompt = (
            "You are a content moderation assistant. "
            "Determine if the following text contains harmful, abusive, hateful, sexual, or inappropriate content. "
            "Reply with only 'YES' if it should be flagged, or 'NO' if it is acceptable.\n\n"
            f"Text: {text}"
        )
        try:
            response = _client.models.generate_content(model=_MODEL, contents=prompt)
            flagged = response.text.strip().upper().startswith('YES')
            return Response({'flagged': flagged})
        except Exception as e:
            logger.error('[Moderate] Gemini failed: %s', e, exc_info=True)
            return Response({'flagged': False})
