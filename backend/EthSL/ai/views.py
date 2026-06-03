from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from courses.models import Lesson, Course
from openai import OpenAI
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


class AskTutorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lesson_id = request.data.get('lesson_id')
        message = request.data.get('message', '').strip()

        if not message:
            return Response({'error': 'Message is required'}, status=400)

        context = ""
        if lesson_id:
            try:
                lesson = Lesson.objects.get(pk=lesson_id)
                context = f"Lesson: {lesson.title}\n{lesson.description or ''}"
            except Lesson.DoesNotExist:
                pass

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
            return Response({'error': 'AI service unavailable. Please try again later.'}, status=503)


class TranslateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        content_type = request.data.get('type')   # 'lesson' or 'course'
        content_id   = request.data.get('id')
        field        = request.data.get('field')  # 'title' or 'description'

        if not all([content_type, content_id, field]):
            return Response({'error': 'type, id and field are required'}, status=400)

        try:
            if content_type == 'lesson':
                obj = Lesson.objects.get(pk=content_id)
            elif content_type == 'course':
                obj = Course.objects.get(pk=content_id)
            else:
                return Response({'error': 'Invalid type'}, status=400)
        except (Lesson.DoesNotExist, Course.DoesNotExist):
            return Response({'error': 'Not found'}, status=404)

        am_field = f'am_{field}'

        # Return cached translation if it exists
        cached = getattr(obj, am_field, None)
        if cached:
            return Response({'translated': cached})

        original = getattr(obj, field, '')
        if not original:
            return Response({'translated': ''})

        try:
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
            setattr(obj, am_field, translated)
            obj.save(update_fields=[am_field])
            return Response({'translated': translated})
        except Exception:
            return Response({'error': 'Translation service unavailable.'}, status=503)


class ModerateContentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'flagged': False})

        try:
            result = client.moderations.create(input=text)
            flagged = result.results[0].flagged
            return Response({'flagged': flagged})
        except Exception:
            # If moderation API fails, allow the content through
            return Response({'flagged': False})
