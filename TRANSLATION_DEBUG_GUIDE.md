# Translation System Debugging & Testing Guide

## Overview
This document provides step-by-step instructions for verifying and debugging the AI translation feature across the entire application.

## System Architecture

### Backend Flow
```
Frontend API Call (/ai/translate/)
    ↓
[TranslateView] Validate request
    ↓
[TranslateView] Check if object exists
    ↓
[TranslateView] Check translation cache
    ↓
[TranslationService] Translate via OpenAI
    ↓
[TranslationService] Save to cache
    ↓
Return translated text
```

### Frontend Flow
```
Component renders (useTranslationWithCache or useTranslations)
    ↓
Check if lang === 'am'
    ↓
getTranslationService().translate(type, id, field)
    ↓
Check frontend cache
    ↓
Make API call
    ↓
Cache result in memory
    ↓
Update component state
    ↓
Component renders translated text
```

## Environment Setup Checklist

### 1. Backend Configuration
```bash
# Verify OPENAI_API_KEY is set
# In backend/.env or environment variables:
OPENAI_API_KEY=sk-... # Must be valid

# Check Django settings
# backend/EthSL/core/settings.py line 283:
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
```

### 2. Database Migrations
```bash
# Ensure all translation cache fields exist:
# Run migrations for:
cd backend
python manage.py migrate
# Should include migration: community/0004_add_translation_cache_fields.py
```

### 3. Required Model Fields
Verify these cache fields exist on all models:

**Courses App:**
- Lesson: am_title, am_description
- Course: am_title, am_description
- Level: am_display_name
- Quiz: am_description
- Question: am_question_text

**Community App:**
- Post: am_title, am_content
- Comment: am_content
- Report: am_reason

## Testing Checklist

### Phase 1: Backend Verification

#### Test 1.1 - OpenAI Configuration
```bash
# SSH into backend
# Check if client is initialized
python manage.py shell
>>> from ai.translation_service import get_translation_service
>>> service = get_translation_service()
>>> print(service.is_available())
# Should print: True
```

#### Test 1.2 - Test Translation Service
```bash
# From Django shell:
>>> from ai.translation_service import get_translation_service
>>> service = get_translation_service()
>>> result = service.translate("Hello, world!")
>>> print(result)
# Should return Amharic translation
```

#### Test 1.3 - API Endpoint Test
```bash
# Using curl or Postman:
curl -X POST http://localhost:8000/api/ai/translate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "lesson", "id": 1, "field": "title"}'

# Expected response:
# {"translated": "የተርጉም ጽሑፍ"}
```

#### Test 1.4 - Check Backend Logs
```bash
# Monitor Django logs for translation requests
# Look for patterns:
# [AI] OPENAI_API_KEY is loaded from environment
# [TranslationService] OpenAI client initialized successfully
# [TranslateView] Request received: type=lesson id=1 field=title
```

### Phase 2: Frontend Verification

#### Test 2.1 - Debug Tools
```javascript
// Open browser console and run:
window.__translationDebug.help()
// Should show available debugging commands

// Check system status:
window.__translationDebug.getStatus()
// Should show API is accessible
```

#### Test 2.2 - Test Single Translation
```javascript
// Open browser console:
await window.__translationDebug.testTranslation('lesson', 1, 'title')
// Should show:
// ✅ Translation successful
// Result: "ትርጉም"
// Duration: 500ms (approximate)
```

#### Test 2.3 - Test Cache
```javascript
// Open browser console:
window.__translationDebug.getCacheStats()
// Should show cached translations

// Clear cache:
window.__translationDebug.clearCache()
// Verify cache is empty:
window.__translationDebug.getCacheStats()
```

#### Test 2.4 - Backend Configuration Verification
```javascript
// Open browser console:
await window.__translationDebug.verifyBackendConfig()
// Should show:
// ✅ Backend is responding to translate requests
```

### Phase 3: End-to-End Flow Testing

#### Test 3.1 - Lesson Page Translation
1. Navigate to: http://localhost:5173/levels
2. Select a level → Select a course → View lessons
3. Change language to Amharic (toggle in header)
4. Check browser Network tab:
   - Should see POST requests to `/api/ai/translate/`
   - Status: 200
   - Response should contain `{translated: "..."}`
5. Check browser Console:
   - Should see logs like: `[useTranslations] Requesting lesson id=X field=title`
   - Should see logs like: `[useTranslations] OK lesson id=X field=title: ትርጉም`
6. Verify translated titles appear in the UI

#### Test 3.2 - LessonDetail Page Translation
1. Navigate to a lesson
2. Change language to Amharic
3. Verify:
   - Lesson title is translated
   - Lesson description is translated
   - Check browser console for translation logs
4. Check Network tab for translation API calls

#### Test 3.3 - Courses Page Translation
1. Navigate to courses list
2. Change language to Amharic
3. Verify:
   - Course descriptions are translated
   - Check Network tab for requests
4. Verify cached translations on language switch back to English

#### Test 3.4 - Community Page Translation
1. Navigate to community posts
2. Create a test post
3. Change language to Amharic
4. Verify:
   - Post title is translated (if it has one)
   - Post content is translated
   - Comments are translated

### Phase 4: Error Handling & Troubleshooting

#### Test 4.1 - Missing OpenAI Key
```javascript
// Backend log should show:
// [AI] CRITICAL: OPENAI_API_KEY is not set in settings/environment
// API response: {"error": "Translation service unavailable."} (503)
```

#### Test 4.2 - Invalid Content Type
```javascript
// Browser console:
await window.__translationDebug.testTranslation('invalid_type', 1, 'title')
// Should show error in console
// Backend log should show: [TranslateView] Unsupported content type "invalid_type"
```

#### Test 4.3 - Non-existent ID
```javascript
// Browser console:
await window.__translationDebug.testTranslation('lesson', 99999, 'title')
// Should show error: "Not found" (404)
// Backend log should show: [TranslateView] Document not found
```

#### Test 4.4 - Missing Field
```javascript
// Browser console:
await window.__translationDebug.testTranslation('lesson', 1, 'invalid_field')
// Should show error
// Backend log should show: [TranslateView] Field not translatable
```

#### Test 4.5 - Cache Field Missing
```javascript
// If a model has translation requested but no am_* field:
// Backend log should show: [TranslateView] CACHE FIELD MISSING
// Still returns translation, but won't cache it
```

## Monitoring & Logging

### Enable Verbose Logging
```javascript
// Browser console:
window.__translationDebug.enableVerboseLogging()
// Then perform translations
// All translation service logs will appear in console
```

### Monitor Backend Logs
```bash
# Watch Django logs in real-time:
tail -f logs/django.log | grep -E '\[Translate\]|\[AI\]|\[TranslationService\]'
```

### Common Log Patterns

#### Success Pattern:
```
[TranslateView] Request received: type=lesson id=1 field=title from user=123
[TranslateView] Object fetched: lesson id=1
[TranslateView] Original text (len=50): "Learn the basics..."
[TranslateView] CACHE HIT/MISS: lesson id=1 field=title
[TranslationService.translate] Translating text (len=50)
[TranslateView] OpenAI SUCCESS: lesson id=1 field=title (len=45)
[TranslateView] CACHE SAVED: lesson id=1 field=title
```

#### Failure Pattern (Look for):
```
[TranslateView] VALIDATION FAILED: Missing required parameters
[TranslateView] OPENAI ERROR: *** error message ***
[TranslateView] DB ERROR: *** database error ***
[TranslateView] CACHE FIELD MISSING: Model *** has no field
```

## Quick Diagnostic Steps

If translations aren't working:

1. **Check Backend Logs First**
   ```bash
   grep -n "CRITICAL\|ERROR" backend.log
   ```

2. **Check Frontend Console**
   ```javascript
   window.__translationDebug.getStatus()
   ```

3. **Verify API Connectivity**
   ```javascript
   await window.__translationDebug.verifyBackendConfig()
   ```

4. **Test a Known Item**
   ```javascript
   await window.__translationDebug.testTranslation('lesson', 1, 'title')
   ```

5. **Check Request/Response in Network Tab**
   - Filter: `/api/translate`
   - Status should be 200
   - Response should have `{"translated": "..."}`

6. **Verify Environment Variables**
   ```bash
   # Check if OPENAI_API_KEY is set:
   echo $OPENAI_API_KEY
   ```

## Performance Metrics

### Expected Performance
- **Cache Hit**: < 1ms
- **API Call (first time)**: 500-1500ms (includes OpenAI latency)
- **Network Request**: 200-500ms
- **OpenAI Processing**: 300-1000ms

### Optimization Tips
1. Translations are cached in frontend memory
2. Translations are cached in backend database (am_* fields)
3. Multiple requests for same item are deduplicated
4. Language toggle should use cached translations

## Supported Content Types & Fields

```javascript
{
  lesson: ['title', 'description'],
  course: ['title', 'description'],
  level: ['display_name'],
  quiz: ['description'],
  question: ['question_text'],
  post: ['title', 'content'],
  comment: ['content'],
  report: ['reason'],
}
```

## API Response Examples

### Successful Translation
```json
POST /api/ai/translate/
Headers: Authorization: Bearer token

Request:
{
  "type": "lesson",
  "id": 1,
  "field": "title"
}

Response (200):
{
  "translated": "ትምህርት ርዕስ"
}
```

### Error: Missing Parameters
```json
Response (400):
{
  "error": "type, id and field are required"
}
```

### Error: Service Unavailable
```json
Response (503):
{
  "error": "Translation service unavailable."
}
```

### Error: Not Found
```json
Response (404):
{
  "error": "Not found"
}
```

## Cleanup & Reset

### Clear All Caches
```javascript
window.__translationDebug.clearCache()
```

### Reset Translated Fields in Database
```bash
python manage.py shell
>>> from courses.models import Lesson
>>> Lesson.objects.all().update(am_title='', am_description='')
```

## Testing Automation

### Test Script (Node.js/Browser Console)
```javascript
const testItems = [
  { type: 'lesson', id: 1, field: 'title' },
  { type: 'lesson', id: 1, field: 'description' },
  { type: 'course', id: 1, field: 'title' },
  { type: 'post', id: 1, field: 'content' },
];

await window.__translationDebug.testBatch(testItems);
```

## Success Indicators

When everything is working correctly, you should see:

✅ Backend Logs:
- OPENAI_API_KEY loaded
- OpenAI client initialized
- Translation requests being processed
- Translations being cached

✅ Frontend Logs:
- Translation service initialized
- Cache hits/misses logged
- API requests successful
- Translated text displayed in UI

✅ User Experience:
- Language toggle works smoothly
- Translations appear immediately (cached) or within 1-2 seconds (first time)
- No error messages in console
- All dynamic content is translated when language is Amharic

✅ Network Traffic:
- POST requests to `/ai/translate/` return 200
- Response contains translated text
- Request frequency reduces over time (caching working)

## Additional Resources

- Backend AI module: `backend/EthSL/ai/views.py`
- Translation Service: `backend/EthSL/ai/translation_service.py`
- Frontend Translation Service: `frontend/lms/src/services/TranslationService.js`
- Debugging Utils: `frontend/lms/src/utils/translationDebugger.js`
- Model Definitions: `backend/EthSL/courses/models.py`, `backend/EthSL/community/models.py`
