from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from courses.models import Lesson, Course, Level, Quiz, Question
from community.models import Post, Comment, Report
from openai import OpenAI
from django.conf import settings
from .translation_service import get_translation_service
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# INITIALIZATION LOGGING
# ============================================================================
_openai_key = getattr(settings, 'OPENAI_API_KEY', None)
if not _openai_key:
    logger.error('[AI] CRITICAL: OPENAI_API_KEY is not set in settings/environment. Translation and tutor features will fail.')
else:
    logger.info('[AI] OPENAI_API_KEY is loaded from environment')

try:
    client = OpenAI(api_key=_openai_key)
    logger.info('[AI] OpenAI client initialized successfully')
except Exception as e:
    logger.error('[AI] CRITICAL: Failed to initialize OpenAI client: %s', e, exc_info=True)
    client = None

# ============================================================================
# TRANSLATABLE CONTENT TYPES
# ============================================================================
# Maps type_name -> (ModelClass, [translatable_fields])
TRANSLATABLE_TYPES = {
    'lesson':   (Lesson,   ['title', 'description']),
    'course':   (Course,   ['title', 'description']),
    'level':    (Level,    ['display_name']),
    'quiz':     (Quiz,     ['description']),
    'question': (Question, ['question_text']),
    'post':     (Post,     ['title', 'content']),
    'comment':  (Comment,  ['content']),
    'report':   (Report,   ['reason']),
}


class AskTutorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lesson_id = request.data.get('lesson_id')
        message = request.data.get('message', '').strip()

        if not message:
            return Response({'error': 'Message is required'}, status=400)

        if not client:
            logger.error('[AskTutor] OpenAI client not initialized')
            return Response({'error': 'AI service unavailable. Please try again later.'}, status=503)

        context = ""
        if lesson_id:
            try:
                lesson = Lesson.objects.get(pk=lesson_id)
                context = f"Lesson: {lesson.title}\n{lesson.description or ''}"
            except Lesson.DoesNotExist:
                logger.warning('[AskTutor] Lesson %s not found', lesson_id)

        system_prompt = (
            "You are a helpful tutor for an Ethiopian Sign Language (ETHSL) learning platform. "
            "Answer questions clearly and concisely, focused on the lesson content provided. "
            "If the question is unrelated to the lesson or sign language learning, politely redirect."
        )
        if context:
            system_prompt += f"\n\nCurrent lesson context:\n{context}"

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                max_tokens=400,
                temperature=0.7,
            )
            reply = response.choices[0].message.content.strip()
            return Response({'reply': reply})
        except Exception as e:
            logger.error('[AskTutor] OpenAI request failed: %s', e, exc_info=True)
            return Response({'error': 'AI service unavailable. Please try again later.'}, status=503)


class TranslateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        translation_service = get_translation_service()
        
        # ====== REQUEST VALIDATION ======
        content_type = request.data.get('type')
        content_id   = request.data.get('id')
        field        = request.data.get('field')

        logger.debug('[TranslateView] Request received: type=%s id=%s field=%s from user=%s', 
                    content_type, content_id, field, request.user.id)

        if not all([content_type, content_id, field]):
            logger.warning('[TranslateView] VALIDATION FAILED: Missing required parameters. type=%s id=%s field=%s', 
                          content_type, content_id, field)
            return Response(
                {'error': 'type, id and field are required'}, 
                status=400
            )

        # ====== CONTENT TYPE VALIDATION ======
        if content_type not in TRANSLATABLE_TYPES:
            logger.warning('[TranslateView] VALIDATION FAILED: Unsupported content type "%s". Supported: %s', 
                          content_type, list(TRANSLATABLE_TYPES.keys()))
            return Response(
                {'error': f'Unsupported type "{content_type}". Supported: {list(TRANSLATABLE_TYPES.keys())}'}, 
                status=400
            )

        ModelClass, allowed_fields = TRANSLATABLE_TYPES[content_type]

        # ====== FIELD VALIDATION ======
        if field not in allowed_fields:
            logger.warning('[TranslateView] VALIDATION FAILED: Field "%s" not translatable for type "%s". Allowed: %s', 
                          field, content_type, allowed_fields)
            return Response(
                {'error': f'Field "{field}" is not translatable for type "{content_type}"'}, 
                status=400
            )

        # ====== FETCH OBJECT ======
        try:
            obj = ModelClass.objects.get(pk=content_id)
            logger.debug('[TranslateView] Object fetched: %s id=%s', content_type, content_id)
        except ModelClass.DoesNotExist:
            logger.warning('[TranslateView] DB ERROR: %s with id=%s not found', content_type, content_id)
            return Response({'error': 'Not found'}, status=404)
        except Exception as e:
            logger.error('[TranslateView] DB ERROR: Failed to fetch %s id=%s: %s', content_type, content_id, e, exc_info=True)
            return Response({'error': 'Database error'}, status=500)

        # ====== GET ORIGINAL TEXT ======
        original = getattr(obj, field, '') or ''
        if not original.strip():
            logger.debug('[TranslateView] EMPTY ORIGINAL: %s id=%s field=%s', content_type, content_id, field)
            return Response({'translated': ''})

        logger.debug('[TranslateView] Original text (len=%d): %s...', len(original), original[:50])

        # ====== CHECK CACHE ======
        cached = translation_service.check_cache(obj, field)
        if cached:
            logger.info('[TranslateView] CACHE HIT: %s id=%s field=%s', content_type, content_id, field)
            return Response({'translated': cached})

        # ====== CHECK SERVICE AVAILABILITY ======
        if not translation_service.is_available():
            logger.error('[TranslateView] CRITICAL: Translation service not available')
            return Response({'error': 'Translation service unavailable.'}, status=503)

        # ====== CALL OPENAI ======
        try:
            logger.info('[TranslateView] OpenAI request: model=%s, type=%s id=%s field=%s', 
                        translation_service.model, content_type, content_id, field)
            translated = translation_service.translate(original)
            logger.info('[TranslateView] OpenAI SUCCESS: %s id=%s field=%s (len=%d)', 
                       content_type, content_id, field, len(translated))
        except Exception as e:
            logger.error('[TranslateView] OPENAI ERROR: %s id=%s field=%s: %s', 
                        content_type, content_id, field, e, exc_info=True)
            return Response({'error': 'Translation service unavailable.'}, status=503)

        # ====== CACHE RESULT ======
        translation_service.save_cache(obj, field, translated)

        logger.debug('[TranslateView] Returning translation: type=%s id=%s field=%s', content_type, content_id, field)
        return Response({'translated': translated})


class ModerateContentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'flagged': False})

        if not client:
            logger.error('[Moderate] OpenAI client not initialized')
            return Response({'flagged': False})

        try:
            result = client.moderations.create(input=text)
            flagged = result.results[0].flagged
            return Response({'flagged': flagged})
        except Exception as e:
            logger.error('[Moderate] OpenAI moderation failed: %s', e, exc_info=True)
            # If moderation API fails, allow the content through
            return Response({'flagged': False})
