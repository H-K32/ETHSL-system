/**
 * Translation Service for Frontend
 * Handles all translation operations: API calls, caching, state management, error logging
 */

import api from './client.js'

/**
 * Debug logger for translation service
 */
class TranslationDebugger {
  log(message, data = null) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8)
    console.log(`[${timestamp}] [TranslationService] ${message}`, data || '')
  }

  warn(message, data = null) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8)
    console.warn(`[${timestamp}] [TranslationService] ${message}`, data || '')
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8)
    console.error(`[${timestamp}] [TranslationService] ${message}`, error || '')
  }
}

const debugger_ = new TranslationDebugger()

/**
 * Translation Service
 * Manages translation API calls, caching, and error handling
 */
class TranslationService {
  constructor() {
    // In-memory cache: { "type:id:field": "translated_text" }
    this.cache = new Map()
    this.pendingRequests = new Map()
    this.supportedTypes = ['lesson', 'course', 'level', 'quiz', 'question', 'post', 'comment', 'report']
  }

  /**
   * Get cache key for a translation
   */
  getCacheKey(type, id, field) {
    return `${type}:${id}:${field}`
  }

  /**
   * Check if translation is in cache
   */
  getCached(type, id, field) {
    const key = this.getCacheKey(type, id, field)
    if (this.cache.has(key)) {
      debugger_.log(`CACHE HIT: ${key}`)
      return this.cache.get(key)
    }
    return null
  }

  /**
   * Store translation in cache
   */
  setCached(type, id, field, translated) {
    const key = this.getCacheKey(type, id, field)
    this.cache.set(key, translated)
    debugger_.log(`CACHE SET: ${key} (len=${translated.length})`)
  }

  /**
   * Translate a piece of content
   * 
   * @param {string} type - Content type (lesson, course, etc.)
   * @param {number|string} id - Content ID
   * @param {string} field - Field name (title, description, etc.)
   * @returns {Promise<string>} - Translated text
   * @throws {Error} - On API error or validation failure
   */
  async translate(type, id, field) {
    // Validate inputs
    if (!type || !id || !field) {
      throw new Error(`Invalid parameters: type=${type}, id=${id}, field=${field}`)
    }

    // Check cache first
    const cached = this.getCached(type, id, field)
    if (cached) {
      return cached
    }

    // Avoid duplicate requests
    const key = this.getCacheKey(type, id, field)
    if (this.pendingRequests.has(key)) {
      debugger_.log(`DEDUP: Waiting for pending request: ${key}`)
      return this.pendingRequests.get(key)
    }

    // Make API request
    debugger_.log(`API REQUEST: type=${type} id=${id} field=${field}`)
    const promise = (async () => {
      try {
        const response = await api.post('/ai/translate/', { type, id, field })
        const { translated } = response.data

        if (!translated) {
          debugger_.warn(`EMPTY TRANSLATION: type=${type} id=${id} field=${field}`)
          return ''
        }

        this.setCached(type, id, field, translated)
        debugger_.log(`API SUCCESS: type=${type} id=${id} field=${field} (len=${translated.length})`)
        return translated
      } catch (error) {
        debugger_.error(`API ERROR: type=${type} id=${id} field=${field}`, error)
        const errorMsg = error?.response?.data?.error || error?.message || 'Translation failed'
        throw new Error(errorMsg)
      } finally {
        this.pendingRequests.delete(key)
      }
    })()

    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * Translate multiple fields for an item
   * 
   * @param {string} type - Content type
   * @param {number|string} id - Content ID
   * @param {Array<string>} fields - Field names
   * @returns {Promise<Object>} - { field: translated_text, ... }
   */
  async translateMultiple(type, id, fields) {
    debugger_.log(`TRANSLATE MULTIPLE: type=${type} id=${id} fields=${fields.join(', ')}`)
    const results = {}
    const promises = fields.map(async (field) => {
      try {
        results[field] = await this.translate(type, id, field)
      } catch (error) {
        debugger_.error(`FAILED: ${type}:${id}:${field}`, error)
        results[field] = null
      }
    })
    await Promise.all(promises)
    return results
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear()
    debugger_.log('Cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Global instance
let instance = null

/**
 * Get or create the global translation service instance
 */
export function getTranslationService() {
  if (!instance) {
    instance = new TranslationService()
    debugger_.log('TranslationService initialized')
  }
  return instance
}

/**
 * Convenience function to translate content
 */
export async function translateContent(type, id, field) {
  const service = getTranslationService()
  return service.translate(type, id, field)
}

/**
 * Debug helper: Log cache stats to console
 */
export function debugTranslationCache() {
  const service = getTranslationService()
  const stats = service.getCacheStats()
  console.table({ ...stats, keys: stats.keys.join('\n') })
  return stats
}

/**
 * Debug helper: Clear translation cache
 */
export function clearTranslationCache() {
  const service = getTranslationService()
  service.clearCache()
}

export default getTranslationService()
