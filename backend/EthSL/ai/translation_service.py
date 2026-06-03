"""
Translation Service Module
Provides a clean, reusable interface for handling translations.
"""

from openai import OpenAI
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class TranslationService:
    """
    Handles all translation operations: validation, caching, OpenAI API calls.
    """

    def __init__(self):
        self.openai_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.client = None
        self.model = 'gpt-3.5-turbo'
        
        if self.openai_key:
            try:
                self.client = OpenAI(api_key=self.openai_key)
                logger.info('[TranslationService] OpenAI client initialized')
            except Exception as e:
                logger.error('[TranslationService] Failed to initialize OpenAI client: %s', e, exc_info=True)
        else:
            logger.error('[TranslationService] OPENAI_API_KEY not configured')

    def is_available(self):
        """Check if translation service is ready."""
        return self.client is not None

    def translate(self, text):
        """
        Translate text to Amharic using OpenAI.
        
        Args:
            text (str): Text to translate
            
        Returns:
            str: Translated text, or empty string on error
            
        Raises:
            Exception: On OpenAI API error or network issues
        """
        if not text or not text.strip():
            logger.debug('[TranslationService.translate] Empty text provided')
            return ''

        if not self.client:
            logger.error('[TranslationService.translate] OpenAI client not initialized')
            raise RuntimeError('Translation service not available')

        try:
            logger.debug('[TranslationService.translate] Translating text (len=%d)', len(text))
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        'role': 'system',
                        'content': 'You are a professional translator. Translate the following text to Amharic. Return only the translated text, nothing else.'
                    },
                    {'role': 'user', 'content': text},
                ],
                max_tokens=500,
                temperature=0.3,
            )
            translated = response.choices[0].message.content.strip()
            logger.debug('[TranslationService.translate] Translation success (len=%d)', len(translated))
            return translated
        except Exception as e:
            logger.error('[TranslationService.translate] OpenAI API error: %s', e, exc_info=True)
            raise

    def get_cache_field_name(self, field):
        """Get the cache field name for a given field."""
        return f'am_{field}'

    def check_cache(self, obj, field):
        """
        Check if translation is cached on the object.
        
        Args:
            obj: Django model instance
            field (str): Field name to translate
            
        Returns:
            str or None: Cached translation, or None if not cached
        """
        cache_field = self.get_cache_field_name(field)
        if not hasattr(obj, cache_field):
            return None
        cached = getattr(obj, cache_field, None)
        if cached:
            logger.debug('[TranslationService.check_cache] Cache hit for field=%s', field)
            return cached
        return None

    def save_cache(self, obj, field, translated):
        """
        Save translation to cache field on the object.
        
        Args:
            obj: Django model instance
            field (str): Field name
            translated (str): Translated text
            
        Returns:
            bool: True if cached successfully, False if cache field doesn't exist
        """
        cache_field = self.get_cache_field_name(field)
        if not hasattr(obj, cache_field):
            logger.warning('[TranslationService.save_cache] No cache field for field=%s', field)
            return False
        try:
            setattr(obj, cache_field, translated)
            obj.save(update_fields=[cache_field])
            logger.debug('[TranslationService.save_cache] Cache saved for field=%s', field)
            return True
        except Exception as e:
            logger.error('[TranslationService.save_cache] Failed to save cache for field=%s: %s', field, e, exc_info=True)
            return False


# Global instance
_translation_service = None


def get_translation_service():
    """Get or create the global translation service instance."""
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service
