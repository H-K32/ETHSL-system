/**
 * useTranslationWithCache Hook
 * 
 * Unified hook for translating content in any component.
 * Automatically handles:
 * - Caching (frontend in-memory + backend database)
 * - Deduplication of requests
 * - Error logging
 * - Language switching
 * 
 * Usage:
 *   const translated = useTranslationWithCache(lang, 'lesson', lesson.id, 'title', lesson.title)
 */

import { useState, useEffect, useRef } from 'react'
import { getTranslationService } from '../services/TranslationService.js'

export function useTranslationWithCache(lang, type, id, field, original) {
  const [translated, setTranslated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const requestedRef = useRef(false)

  useEffect(() => {
    // Only translate to Amharic
    if (lang !== 'am') {
      setTranslated(null)
      requestedRef.current = false
      return
    }

    // Skip if no ID or already requested
    if (!id || requestedRef.current) {
      return
    }

    requestedRef.current = true
    setLoading(true)
    setError(null)

    const performTranslation = async () => {
      try {
        const service = getTranslationService()
        const result = await service.translate(type, id, field)
        setTranslated(result)
        setError(null)
      } catch (err) {
        console.error(`[useTranslationWithCache] Translation failed for ${type}:${id}:${field}`, err)
        setError(err.message)
        setTranslated(null)
      } finally {
        setLoading(false)
      }
    }

    performTranslation()
  }, [lang, type, id, field])

  // Return translated text if available and Amharic is selected, otherwise original
  return {
    text: lang === 'am' && translated ? translated : original,
    translated: translated,
    loading,
    error,
    isAmharic: lang === 'am',
  }
}

/**
 * Simple helper to get translated or original text
 * 
 * Usage in JSX:
 *   <h1>{translateOrOriginal(lang, amTitle, lesson.title)}</h1>
 */
export function translateOrOriginal(lang, translatedText, originalText) {
  return lang === 'am' && translatedText ? translatedText : originalText
}

export default useTranslationWithCache
