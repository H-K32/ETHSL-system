# Deployment & Next Steps Checklist

## Pre-Deployment Verification

### Backend Setup
- [ ] **Database Migrations**: Run migrations to add translation cache fields
  ```bash
  cd backend
  python manage.py migrate
  # Verify no errors
  ```

- [ ] **Environment Variables**: Verify OPENAI_API_KEY is set
  ```bash
  echo $OPENAI_API_KEY
  # Should output: sk-...
  ```

- [ ] **Dependencies**: Verify OpenAI package is installed
  ```bash
  pip show openai
  # Should show version 1.0+
  ```

- [ ] **Static Analysis**: Check for import errors
  ```bash
  python -c "from ai.views import TranslateView; print('✅ Imports OK')"
  python -c "from ai.translation_service import get_translation_service; print('✅ Service OK')"
  python -c "from community.models import Post; print('✅ Models OK')"
  ```

- [ ] **Django Test**: Run any existing tests
  ```bash
  python manage.py test ai
  python manage.py test community
  ```

### Frontend Setup
- [ ] **Dependencies**: Verify React/axios versions
  ```bash
  cd frontend/lms
  npm list react react-router-dom axios
  ```

- [ ] **Build**: Ensure frontend builds without errors
  ```bash
  npm run build
  # Check for any warnings
  ```

- [ ] **Console**: Verify no TypeScript/syntax errors
  - Open DevTools → Console
  - Should be clean (no red errors)

### Configuration
- [ ] **API URL**: Verify VITE_API_BASE_URL is correctly set
- [ ] **CORS**: Backend allows requests from frontend URL
- [ ] **Authentication**: JWT tokens are being sent correctly

## Deployment Steps

### Step 1: Deploy Backend
```bash
# Pull latest code
git pull origin main

# Install dependencies
pip install -r requirements.txt

# Run migrations (including translation cache fields)
python manage.py migrate

# Collect static files (if needed)
python manage.py collectstatic --noinput

# Restart server
# (Depends on your deployment platform)
```

### Step 2: Deploy Frontend
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Deploy dist/ folder
# (Depends on your deployment platform)
```

### Step 3: Verify Deployment
```bash
# Backend health check
curl https://your-backend.com/api/health/ -H "Authorization: Bearer token"

# Test translation endpoint
curl -X POST https://your-backend.com/api/ai/translate/ \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"type": "lesson", "id": 1, "field": "title"}'
```

## Post-Deployment Testing

### Immediate Tests (Manual)

1. **Backend Logs**
   - Check for OpenAI initialization
   - Verify no critical errors
   - Look for successful translation requests

2. **Frontend Console**
   ```javascript
   window.__translationDebug.getStatus()
   // Should show API is accessible
   ```

3. **User Flow Test**
   - Login to app
   - Navigate to Lessons
   - Toggle language to Amharic
   - Verify lesson titles translate
   - Check browser Network tab for successful API calls

4. **Community Test**
   - Create a post
   - Switch to Amharic
   - Verify post content translates
   - Check comments translate

### Performance Baseline
- Record translation response times
- Check for cache effectiveness
- Monitor error rates

### Monitoring Setup
- [ ] Enable request logging for `/api/ai/translate/`
- [ ] Set up alerts for 5xx responses
- [ ] Monitor OpenAI API usage
- [ ] Track translation cache hit rate

## Rollback Plan

If critical issues arise:

### Option 1: Quick Rollback
```bash
# Backend
git revert <commit-hash>
git push origin main
python manage.py migrate  # Reverse migrations

# Frontend
git revert <commit-hash>
git push origin main
npm run build && deploy
```

### Option 2: Partial Rollback (Keep models)
```bash
# Keep database migrations
# Revert only views.py to old version
git checkout main~1 -- backend/EthSL/ai/views.py
# Still need backend/EthSL/ai/translation_service.py for old views
```

## Known Limitations & Workarounds

### 1. OpenAI Rate Limiting
**Limitation:** OpenAI API has rate limits (depends on API key)
**Workaround:** Implement request queueing or batch API calls
**Status:** Not implemented yet, add if needed

### 2. Large Content Translation
**Limitation:** Very long text may exceed token limits
**Workaround:** Truncate to 500 chars (already implemented in prompt)
**Status:** Handled

### 3. Partial Content Failure
**Limitation:** If one translation fails, component might show partial content
**Workaround:** Already handles gracefully (shows original text)
**Status:** Handled

### 4. Network Disconnection
**Limitation:** Translation requests fail if network unavailable
**Workaround:** Use cached translations, queue requests for retry
**Status:** Can be enhanced

## Future Improvements

### Phase 2 (Medium Priority)
- [ ] Batch translation endpoint (translate multiple items per request)
- [ ] Translation quality metrics
- [ ] Admin dashboard for translation management
- [ ] Clear cache without page reload

### Phase 3 (Lower Priority)
- [ ] Offline translation queue (store and translate when online)
- [ ] Translation history and statistics
- [ ] A/B testing for translation quality
- [ ] Support for more languages (not just Amharic)

## Success Metrics

### Technical
- [ ] 0 console errors
- [ ] 0 unhandled promise rejections
- [ ] 100% of dynamic content shows translated text when language = Amharic
- [ ] Translation API responds < 2s (first call) / < 100ms (cache hit)
- [ ] 0 database errors in logs
- [ ] 0 OpenAI authentication errors

### User Experience
- [ ] Language toggle works smoothly
- [ ] Translations appear without full page reload
- [ ] No content flashing or flickering
- [ ] Error messages are user-friendly
- [ ] Performance is acceptable

### Data Quality
- [ ] All translatable fields are translated
- [ ] Translations are cached correctly
- [ ] Cache hit rate > 80% after first day
- [ ] No duplicate translations in database

## Support Runbook

### Issue: Translations not appearing
1. Check console: `window.__translationDebug.getStatus()`
2. Check backend logs for errors
3. Verify OPENAI_API_KEY is set
4. Test specific item: `window.__translationDebug.testTranslation('lesson', 1, 'title')`
5. Check Network tab for 500 errors

### Issue: Slow translations
1. Check cache stats: `window.__translationDebug.getCacheStats()`
2. Verify OpenAI API is responding normally
3. Check for rate limiting errors
4. Review Network tab response times

### Issue: 401 Authentication errors
1. Verify JWT token is valid
2. Check token expiration
3. Ensure Authorization header is present
4. Verify CORS settings

### Issue: 503 Service unavailable
1. Check OpenAI API status
2. Verify OPENAI_API_KEY is correct
3. Check OpenAI quota/limits
4. Review backend logs

### Issue: Database errors
1. Verify migrations were run: `python manage.py migrate`
2. Check am_* fields exist on models
3. Verify database connection
4. Check for migration conflicts

## Communication

### Stakeholders to Notify
- [ ] Backend team: New TranslationService class
- [ ] Frontend team: New translation utilities
- [ ] QA team: Testing procedures in TRANSLATION_DEBUG_GUIDE.md
- [ ] Ops team: Monitoring requirements
- [ ] Business: Timeline and success metrics

### Documentation to Share
- [ ] TRANSLATION_DEBUG_GUIDE.md (Testing)
- [ ] IMPLEMENTATION_SUMMARY.md (Overview)
- [ ] Code comments in modified files
- [ ] API documentation update (if applicable)

## Timeline

### Immediate (Before Deployment)
- [ ] Run all verification steps
- [ ] Manual testing on staging
- [ ] Code review of changes
- [ ] Security review (OpenAI API key handling)

### Week 1 Post-Deployment
- [ ] Daily monitoring of error rates
- [ ] User feedback collection
- [ ] Performance baseline establishment
- [ ] Document any issues

### Week 2+
- [ ] Analyze usage patterns
- [ ] Implement improvements
- [ ] Plan Phase 2 features

## Contacts & Resources

### Documentation
- TRANSLATION_DEBUG_GUIDE.md - Testing and troubleshooting
- IMPLEMENTATION_SUMMARY.md - Architecture overview
- Code comments in modified files

### Team
- Backend Lead: For TranslationService and API questions
- Frontend Lead: For TranslationService (frontend) and debugging
- DevOps: For deployment and monitoring setup

### External Resources
- OpenAI API docs: https://platform.openai.com/docs/
- Django REST Framework: https://www.django-rest-framework.org/
- React docs: https://react.dev/

## Final Checklist Before Go-Live

- [ ] All code merged to main branch
- [ ] All tests passing
- [ ] Database migrations verified
- [ ] Environment variables set correctly
- [ ] Secrets are secure (no API keys in code)
- [ ] Performance tested and acceptable
- [ ] Error handling verified
- [ ] Logging enabled and tested
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Team trained on debugging
- [ ] Documentation updated
- [ ] Stakeholders notified
- [ ] Go/No-Go decision made
