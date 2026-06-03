/**
 * Translation Debugging Utilities
 * 
 * Provides console-accessible debugging tools for the translation system.
 * Access via window.__translationDebug in the browser console.
 * 
 * Examples:
 *   window.__translationDebug.getStatus()
 *   window.__translationDebug.testTranslation('lesson', 1, 'title')
 *   window.__translationDebug.getCacheStats()
 *   window.__translationDebug.clearCache()
 *   window.__translationDebug.enableVerboseLogging()
 */

import { getTranslationService } from '../services/TranslationService.js'
import api from '../api/client.js'

class TranslationDebugger {
  constructor() {
    this.verboseLogging = false
    this.testResults = []
  }

  log(message) {
    if (this.verboseLogging) {
      console.log(`[TranslationDebug] ${message}`)
    }
  }

  /**
   * Get overall system status
   */
  async getStatus() {
    console.group('[TranslationDebug] System Status')
    
    // Check API connectivity
    try {
      const response = await api.post('/ai/translate/', { type: 'test', id: 1, field: 'test' })
      console.log('✅ API endpoint accessible (got response)')
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ API endpoint accessible (validation error, as expected)')
      } else if (error.response?.status === 404) {
        console.log('❌ API endpoint not found (404)')
      } else if (error.response?.status === 401) {
        console.log('❌ Not authenticated (401)')
      } else {
        console.log('❌ API error:', error.message)
      }
    }

    // Check service
    const service = getTranslationService()
    console.log('Translation Service:', {
      initialized: !!service,
      cacheSize: service.cache.size,
      pendingRequests: service.pendingRequests.size,
    })

    // Check localStorage
    const token = localStorage.getItem('access_token')
    console.log('Authentication:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
    })

    console.groupEnd()
  }

  /**
   * Test translation for a specific item
   */
  async testTranslation(type, id, field) {
    console.group(`[TranslationDebug] Testing ${type}:${id}:${field}`)
    const startTime = performance.now()
    
    try {
      const service = getTranslationService()
      const result = await service.translate(type, id, field)
      const duration = performance.now() - startTime
      
      console.log('✅ Translation successful')
      console.log('Result:', result)
      console.log('Duration:', `${duration.toFixed(2)}ms`)
      
      this.testResults.push({
        type,
        id,
        field,
        status: 'success',
        duration,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      const duration = performance.now() - startTime
      console.error('❌ Translation failed')
      console.error('Error:', error.message)
      console.error('Duration:', `${duration.toFixed(2)}ms`)
      
      this.testResults.push({
        type,
        id,
        field,
        status: 'failed',
        error: error.message,
        duration,
        timestamp: new Date().toISOString(),
      })
    }
    
    console.groupEnd()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const service = getTranslationService()
    const stats = {
      cacheSize: service.cache.size,
      pendingRequests: service.pendingRequests.size,
      cachedItems: Array.from(service.cache.entries()).map(([key, value]) => ({
        key,
        length: value.length,
        preview: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
      })),
    }
    console.table(stats.cachedItems)
    return stats
  }

  /**
   * Clear cache
   */
  clearCache() {
    const service = getTranslationService()
    service.clearCache()
    console.log('[TranslationDebug] Cache cleared')
  }

  /**
   * Enable verbose logging
   */
  enableVerboseLogging() {
    this.verboseLogging = true
    console.log('[TranslationDebug] Verbose logging enabled')
  }

  /**
   * Disable verbose logging
   */
  disableVerboseLogging() {
    this.verboseLogging = false
    console.log('[TranslationDebug] Verbose logging disabled')
  }

  /**
   * Get test results
   */
  getTestResults() {
    console.table(this.testResults)
    return this.testResults
  }

  /**
   * Verify backend configuration
   */
  async verifyBackendConfig() {
    console.group('[TranslationDebug] Backend Configuration')
    
    try {
      // Try to get a simple translation
      const response = await api.get('/ai/health/', { validateStatus: () => true })
      console.log('Health endpoint:', response.status === 200 ? '✅' : '❌', response.data)
    } catch (error) {
      console.log('Health check failed (expected if endpoint not available)')
    }

    // Check if we can make a request at all
    try {
      await api.post('/ai/translate/', {
        type: 'lesson',
        id: 999999, // Non-existent ID
        field: 'title',
      }, { validateStatus: () => true })
      console.log('✅ Backend is responding to translate requests')
    } catch (error) {
      console.error('❌ Backend is not responding:', error.message)
    }

    console.groupEnd()
  }

  /**
   * Test translation for multiple items
   */
  async testBatch(items) {
    console.group('[TranslationDebug] Batch Testing')
    const results = {}
    
    for (const { type, id, field } of items) {
      results[`${type}:${id}:${field}`] = await (async () => {
        try {
          const service = getTranslationService()
          return await service.translate(type, id, field)
        } catch (error) {
          return `ERROR: ${error.message}`
        }
      })()
    }

    console.table(results)
    console.groupEnd()
    return results
  }

  /**
   * Export cache for debugging
   */
  exportCache() {
    const service = getTranslationService()
    const exported = Object.fromEntries(service.cache)
    console.log('Cache exported to JSON. Copy the following:')
    console.log(JSON.stringify(exported, null, 2))
    return exported
  }

  /**
   * Summary of all tools
   */
  help() {
    console.log(`
TranslationDebug Tools:
  getStatus()                    - Check system status and connectivity
  testTranslation(type, id, field) - Test a single translation
  testBatch(items)               - Test multiple translations
  getCacheStats()                - View cache statistics
  clearCache()                   - Clear translation cache
  enableVerboseLogging()         - Enable verbose console output
  disableVerboseLogging()        - Disable verbose console output
  getTestResults()               - View past test results
  verifyBackendConfig()          - Verify backend is configured
  exportCache()                  - Export cache as JSON

Example:
  window.__translationDebug.testTranslation('lesson', 1, 'title')
    `)
  }
}

// Create global instance
const debugger_ = new TranslationDebugger()

// Expose to window
if (typeof window !== 'undefined') {
  window.__translationDebug = debugger_
}

export default debugger_
