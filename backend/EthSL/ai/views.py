from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from courses.models import Lesson, Course, Level, Quiz, Question
from openai import OpenAI
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Guard against missing API key at startup
_openai_key = getattr(settings, 'OPENAI_API_KEY', None)
if not _openai_key:
    logger.error('[AI] OPENAI_API_KEY is not set in settings/environment. Translation and tutor features will fail.')

try:
    client = OpenAI(api_key=_openai_key)
except Exception as e:
    logger.error('[AI] Failed to initialize OpenAI client: %s', e)
    client = None

# Supported content types and their translatable fields
# Maps type_name -> (ModelClass, [translatable_fields])
TRANSLATABLE_TYPES = {
    'lesson':   (Lesson,   ['title', 'description']),
    'course':   (Course,   ['title', 'description']),
    'level':    (Level,    ['display_name']),
    'quiz':     (Quiz,     ['description']),
    'question': (Question, ['question_text']),
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
        content_type = request.data.get('type')
        content_id   = request.data.get('id')
        field        = request.data.get('field')

        # --- Validate required fields ---
        if not all([content_type, content_id, field]):
            logger.warning('[Translate] Missing params: type=%s id=%s field=%s', content_type, content_id, field)
            return Response({'error': 'type, id and field are required'}, status=400)

        # --- Validate content type ---
        if content_type not in TRANSLATABLE_TYPES:
            logger.warning('[Translate] Unsupported content type: %s', content_type)
            return Response({'error': f'Unsupported type "{content_type}". Supported: {list(TRANSLATABLE_TYPES.keys())}'}, status=400)

        ModelClass, allowed_fields = TRANSLATABLE_TYPES[content_type]

        # --- Validate field ---
        if field not in allowed_fields:
            logger.warning('[Translate] Field "%s" not translatable for type "%s"', field, content_type)
            return Response({'error': f'Field "{field}" is not translatable for type "{content_type}"'}, status=400)

        # --- Fetch object ---
        try:
            obj = ModelClass.objects.get(pk=content_id)
        except ModelClass.DoesNotExist:
            logger.warning('[Translate] %s with id=%s not found', content_type, content_id)
            return Response({'error': 'Not found'}, status=404)
        except Exception as e:
            logger.error('[Translate] DB error fetching %s id=%s: %s', content_type, content_id, e, exc_info=True)
            return Response({'error': 'Database error'}, status=500)

        am_field = f'am_{field}'

        # --- Check if am_ cache field exists on model ---
        if not hasattr(obj, am_field):
            logger.warning('[Translate] Model %s has no field "%s" — cache not available', content_type, am_field)
            # Still attempt translation but cannot cache
            can_cache = False
        else:
            can_cache = True

        # --- Return cached translation if available ---
        if can_cache:
            cached = getattr(obj, am_field, None)
            if cached:
                logger.debug('[Translate] Cache hit for %s id=%s field=%s', content_type, content_id, field)
                return Response({'translated': cached})

        # --- Get original text ---
        original = getattr(obj, field, '') or ''
        if not original.strip():
            logger.debug('[Translate] Empty original for %s id=%s field=%s', content_type, content_id, field)
            return Response({'translated': ''})

        # --- Check OpenAI client ---
        if not client:
            logger.error('[Translate] OpenAI client not initialized — cannot translate')
            return Response({'error': 'Translation service unavailable.'}, status=503)

        # --- Call OpenAI ---
        try:
            logger.info('[Translate] Requesting translation for %s id=%s field=%s', content_type, content_id, field)
            response = client.chat.completions.create(
                model='gpt-3.5-turbo',
                messages=[
                    {'role': 'system', 'content': 'You are a professional translator. Translate the following text to Amharic. Return only the translated text, nothing else.'},
                    {'role': 'user', 'content': original},
                ],
                max_tokens=500,
                temperature=0.3,
            )
            translated = response.choices[0].message.content.strip()
            logger.info('[Translate] Translation successful for %s id=%s field=%s', content_type, content_id, field)
        except Exception as e:
            logger.error('[Translate] OpenAI error for %s id=%s field=%s: %s', content_type, content_id, field, e, exc_info=True)
            return Response({'error': 'Translation service unavailable.'}, status=503)

        # --- Cache the result ---
        if can_cache:
            try:
                setattr(obj, am_field, translated)
                obj.save(update_fields=[am_field])
                logger.debug('[Translate] Cached translation for %s id=%s field=%s', content_type, content_id, field)
            except Exception as e:
                logger.error('[Translate] Cache save failed for %s id=%s field=%s: %s', content_type, content_id, field, e, exc_info=True)
                # Return translation anyway even if caching failed

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
