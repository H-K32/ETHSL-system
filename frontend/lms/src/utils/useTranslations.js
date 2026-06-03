import { useState, useEffect, useRef } from 'react'
import { translateContent } from '../api/lms.js'

/**
 * Reusable translation hook for any content type.
 *
 * @param {string} lang        - current language ('en' | 'am')
 * @param {string} type        - content type: 'lesson' | 'course' | 'level' | 'quiz' | 'question'
 * @param {Array}  items       - array of objects with at least { id }
 * @param {Array}  fields      - array of field names to translate e.g. ['title', 'description']
 *
 * @returns {Object} translations - { [itemId]: { [field]: translatedString } }
 *
 * Usage:
 *   const translations = useTranslations(lang, 'lesson', lessons, ['title', 'description'])
 *   const title = translations[lesson.id]?.title || lesson.title
 */
export function useTranslations(lang, type, items, fields) {
  const [translations, setTranslations] = useState({})
  // Track which (id, field) pairs we've already requested to avoid duplicate calls
  const requested = useRef(new Set())

  useEffect(() => {
    if (lang !== 'am' || !items || items.length === 0) return

    items.forEach(item => {
      if (!item?.id) return
      fields.forEach(field => {
        const key = `${type}:${item.id}:${field}`
        if (requested.current.has(key)) return
        // Check if we already have this translation in state
        if (translations[item.id]?.[field]) return

        requested.current.add(key)

        console.log(`[useTranslations] Requesting ${type} id=${item.id} field=${field}`)

        translateContent(type, item.id, field)
          .then(r => {
            console.log(`[useTranslations] OK ${type} id=${item.id} field=${field}:`, r.translated)
            setTranslations(prev => ({
              ...prev,
              [item.id]: {
                ...prev[item.id],
                [field]: r.translated,
              },
            }))
          })
          .catch(e => {
            console.error(`[useTranslations] FAILED ${type} id=${item.id} field=${field}:`, e?.response?.data || e?.message || e)
            // Remove from requested so it can be retried on next render if needed
            requested.current.delete(key)
          })
      })
    })
  }, [lang, type, items?.length, fields.join(',')])

  return translations
}

/**
 * Helper: get translated value or fall back to original.
 *
 * @param {Object} translations - result of useTranslations
 * @param {string} lang
 * @param {number} id
 * @param {string} field
 * @param {*}      original     - fallback value
 */
export function tx(translations, lang, id, field, original) {
  if (lang !== 'am') return original
  return translations[id]?.[field] || original
}
