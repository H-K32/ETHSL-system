from deep_translator import GoogleTranslator
import logging

logger = logging.getLogger(__name__)


class TranslationService:

    def __init__(self):
        self.translator = GoogleTranslator(source='auto', target='am')
        logger.info('[TranslationService] deep-translator (Google Translate) initialized')

    def is_available(self):
        return True

    def translate(self, text):
        if not text or not text.strip():
            return ''
        try:
            translated = self.translator.translate(text)
            logger.debug('[TranslationService] Translated successfully')
            return translated or ''
        except Exception as e:
            logger.error('[TranslationService] Translation error: %s', e, exc_info=True)
            raise

    def check_cache(self, obj, field):
        from courses.models import Level
        cache_field = 'am_display_name' if (field == 'name' and isinstance(obj, Level)) else f'am_{field}'
        if not hasattr(obj, cache_field):
            return None
        return getattr(obj, cache_field, None) or None

    def save_cache(self, obj, field, translated):
        from courses.models import Level
        cache_field = 'am_display_name' if (field == 'name' and isinstance(obj, Level)) else f'am_{field}'
        if not hasattr(obj, cache_field):
            return False
        try:
            setattr(obj, cache_field, translated)
            obj.save(update_fields=[cache_field])
            return True
        except Exception as e:
            logger.error('[TranslationService.save_cache] Failed: %s', e, exc_info=True)
            return False


_translation_service = None


def get_translation_service():
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service
