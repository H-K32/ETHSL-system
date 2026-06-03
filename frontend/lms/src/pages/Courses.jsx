import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useAsync from '../utils/useAsync.js'
import { getCourses, translateContent } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import '../styles/courses.css'

export default function Courses() {
  const { levelId } = useParams()
  const { lang, t } = useLanguage()
  const { data, loading, error, reload } = useAsync(() => getCourses(levelId), [levelId])
  const [amTranslations, setAmTranslations] = useState({})
  const [translationErrors, setTranslationErrors] = useState({})

  const courses = Array.isArray(data) ? data : (data?.results || [])

  useEffect(() => {
    if (lang !== 'am' || courses.length === 0) return
    courses.forEach(course => {
      if (amTranslations[course.id]) return
      console.log('[Courses] Translating description for course', course.id)
      translateContent('course', course.id, 'description')
        .then(r => { 
          console.log('[Courses] Translation SUCCESS:', r.translated); 
          setAmTranslations(prev => ({ ...prev, [course.id]: r.translated })) 
        })
        .catch(e => { 
          console.error('[Courses] Translation FAILED:', e); 
          setTranslationErrors(prev => ({ ...prev, [course.id]: e.message }))
        })
    })
  }, [lang, courses.length])

  if (loading) return <Spinner />

  if (error) {
    return (
      <div className="courses-page">
        <div className="courses-shell">
          <ErrorState error={error} onRetry={reload} />
        </div>
      </div>
    )
  }

  return (
    <div className="courses-page">
      <div className="courses-shell">
        <header className="courses-header">
          <div>
            <span className="courses-eyebrow">Curriculum / Modules</span>
            <h1 className="courses-title">{t('availableModules')}</h1>
            <p className="courses-subtitle">{t('selectModule')}</p>
          </div>

          <Link to="/levels" className="courses-back">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('backToLevels')}
          </Link>
        </header>

        {courses.length === 0 ? (
          <EmptyState title={t('noModules')} hint="Check back soon for new modules." />
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id}>
                <article className="course-card">
                  <div className="course-icon">📚</div>
                  <h3 className="course-title">{course.title}</h3>
                  {course.description && (
                    <p className="course-description">
                      {lang === 'am' && amTranslations[course.id] ? amTranslations[course.id] : course.description}
                    </p>
                  )}
                  <div className="course-buttons">
                    <Link to={`/lessons/${course.id}`} state={{ levelId }} className="course-btn lessons-btn">
                      {t('viewLessons')}
                    </Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
