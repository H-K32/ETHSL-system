# Quick Start: Translation System Testing

This guide gets you up and running with testing the translation system in 5 minutes.

## Prerequisites
- Backend running on http://localhost:8000
- Frontend running on http://localhost:5173
- You're logged in as a user
- OPENAI_API_KEY is set in backend environment

## Quick Test (5 minutes)

### 1. Backend: Verify OpenAI Configuration (30 seconds)
```bash
# SSH into backend or open Django shell
python manage.py shell

# Test 1: Check if client is initialized
from ai.translation_service import get_translation_service
service = get_translation_service()
print("Service available:", service.is_available())
# Should print: Service available: True

# Test 2: Try a simple translation
result = service.translate("Hello, world!")
print(result)
# Should print Amharic translation like: "ሰላም ዓለም!"

# Exit
exit()
```

**Expected Output:**
```
Service available: True
ሰላም ዓለም!
```

### 2. Frontend: Check Translation Service (1 minute)
Open browser console (F12) and run:

```javascript
// Test 1: Check system status
window.__translationDebug.getStatus()
// Look for: "✅ API endpoint accessible"

// Test 2: Test a translation
await window.__translationDebug.testTranslation('lesson', 1, 'title')
// Should show: "✅ Translation successful"
```

### 3. Manual UI Test (3.5 minutes)

1. Navigate to: http://localhost:5173/levels
2. Click on a level → Click on a course → View lessons
3. Open browser DevTools (F12) → Network tab
4. Switch language to Amharic (toggle in header)
5. Verify:
   - ✅ Network tab shows POST to `/ai/translate/` with status 200
   - ✅ Lesson titles appear in Amharic
   - ✅ Browser console shows translation logs

**Success Indicators:**
- Network requests show `{"translated": "..."}`
- Lesson titles display in Amharic script
- No red errors in console

## Common Issues & Quick Fixes

### Issue: "Translation service unavailable"
```bash
# Check if OPENAI_API_KEY is set
echo $OPENAI_API_KEY
# Should not be empty

# If empty, set it:
export OPENAI_API_KEY=sk-your-key-here

# Restart backend
```

### Issue: 401 Authentication Error
```javascript
// In browser console:
console.log(localStorage.getItem('access_token'))
// Should show a JWT token

// If empty, log in again
```

### Issue: No translations appearing
```javascript
// Enable verbose logging
window.__translationDebug.enableVerboseLogging()

// Try again and check console for detailed logs
await window.__translationDebug.testTranslation('lesson', 1, 'title')
```

### Issue: "api.post is not a function"
- Make sure you're using the right import
- API client might not be loaded
- Try: `window.__translationDebug.verifyBackendConfig()`

## Comprehensive Testing (15 minutes)

### Backend Verification
```bash
# 1. Check migrations
python manage.py showmigrations community
# Should show: [X] 0004_add_translation_cache_fields

# 2. Check model fields
python manage.py shell
from community.models import Post
p = Post()
print(hasattr(p, 'am_title'))  # Should be True
print(hasattr(p, 'am_content'))  # Should be True

# 3. Verify TRANSLATABLE_TYPES
from ai.views import TRANSLATABLE_TYPES
print(list(TRANSLATABLE_TYPES.keys()))
# Should include: post, comment, report, lesson, course, etc.
```

### Frontend Verification
```javascript
// 1. Check translation service
import { getTranslationService } from '/src/services/TranslationService.js'
const service = getTranslationService()
console.log(service.cache.size)  // Should be 0 initially

// 2. Test cache
await service.translate('lesson', 1, 'title')
console.log(service.cache.size)  // Should be 1

// 3. Verify deduplication
const p1 = service.translate('lesson', 1, 'title')
const p2 = service.translate('lesson', 1, 'title')
console.log(p1 === p2)  // Should be true (same promise)
```

## Content Types You Can Test

Try translating different content types:

```javascript
// Lessons
await window.__translationDebug.testTranslation('lesson', 1, 'title')
await window.__translationDebug.testTranslation('lesson', 1, 'description')

// Courses
await window.__translationDebug.testTranslation('course', 1, 'title')
await window.__translationDebug.testTranslation('course', 1, 'description')

// Levels
await window.__translationDebug.testTranslation('level', 1, 'display_name')

// Quizzes
await window.__translationDebug.testTranslation('quiz', 1, 'description')

// Questions
await window.__translationDebug.testTranslation('question', 1, 'question_text')

// Community Content
await window.__translationDebug.testTranslation('post', 1, 'title')
await window.__translationDebug.testTranslation('post', 1, 'content')
await window.__translationDebug.testTranslation('comment', 1, 'content')
await window.__translationDebug.testTranslation('report', 1, 'reason')
```

## Performance Benchmarks

### Expected Times
- **First translation:** 500-1500ms (includes OpenAI latency)
- **Cached translation:** < 1ms
- **Backend cache hit:** 50-200ms

Test it:
```javascript
// Measure first call (slow)
console.time('first-translation')
await window.__translationDebug.testTranslation('lesson', 1, 'title')
console.timeEnd('first-translation')

// Measure second call (fast, from cache)
console.time('cached-translation')
await window.__translationDebug.testTranslation('lesson', 1, 'title')
console.timeEnd('cached-translation')
```

## Browser Console Cheat Sheet

```javascript
// Status & Stats
window.__translationDebug.getStatus()
window.__translationDebug.getCacheStats()
window.__translationDebug.getTestResults()

// Testing
window.__translationDebug.testTranslation('lesson', 1, 'title')
window.__translationDebug.testBatch([
  { type: 'lesson', id: 1, field: 'title' },
  { type: 'course', id: 1, field: 'title' },
])

// Verification
window.__translationDebug.verifyBackendConfig()

// Logging
window.__translationDebug.enableVerboseLogging()
window.__translationDebug.disableVerboseLogging()

// Cache Management
window.__translationDebug.clearCache()
window.__translationDebug.exportCache()

// Help
window.__translationDebug.help()
```

## Backend Log Monitoring

### Watch Logs in Real-Time
```bash
# Linux/Mac
tail -f logs/django.log | grep -E '\[Translate\]|\[AI\]'

# Or monitor while testing
python manage.py runserver 2>&1 | tee test.log
```

### What to Look For
✅ Good signs:
```
[AI] OPENAI_API_KEY is loaded from environment
[TranslationService] OpenAI client initialized successfully
[TranslateView] Request received: type=lesson id=1 field=title
[TranslateView] OpenAI SUCCESS: lesson id=1 field=title
```

❌ Bad signs:
```
[AI] CRITICAL: OPENAI_API_KEY is not set
[Translate] OpenAI error
[Translate] DB error
```

## Troubleshooting Script

Run this if something isn't working:

```javascript
// 1. Check everything
console.log('=== System Diagnostics ===')
window.__translationDebug.getStatus()

// 2. Test backend
console.log('=== Backend Verification ===')
await window.__translationDebug.verifyBackendConfig()

// 3. Try a translation
console.log('=== Test Translation ===')
await window.__translationDebug.testTranslation('lesson', 1, 'title')

// 4. Check cache
console.log('=== Cache Status ===')
window.__translationDebug.getCacheStats()
```

## Next Steps

1. **Run comprehensive tests:** See TRANSLATION_DEBUG_GUIDE.md
2. **Review implementation:** See IMPLEMENTATION_SUMMARY.md
3. **Deployment preparation:** See DEPLOYMENT_CHECKLIST.md
4. **Fix any issues:** Check backend logs + browser console

## Support

If you encounter issues:

1. **Check the logs first**
   - Backend: `grep ERROR backend.log`
   - Frontend: Open DevTools → Console

2. **Run diagnostics**
   ```javascript
   window.__translationDebug.getStatus()
   ```

3. **Test step by step**
   - Backend service: ✅ `service.is_available()`
   - API connectivity: ✅ `window.__translationDebug.verifyBackendConfig()`
   - Specific translation: ✅ `window.__translationDebug.testTranslation(...)`

4. **Refer to guides**
   - Quick fixes: This document
   - Detailed troubleshooting: TRANSLATION_DEBUG_GUIDE.md
   - System overview: IMPLEMENTATION_SUMMARY.md

## Success! 🎉

If all tests pass:
- ✅ Backend translation service is working
- ✅ Frontend translation service is working
- ✅ API communication is working
- ✅ Caching is working
- ✅ UI displays translated content

You're ready to use the translation system!
