import { Link, useParams } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getCourses } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import '../styles/courses.css'

export default function Courses() {
  const { levelId } = useParams()
  const { data, loading, error, reload } = useAsync(
    () => getCourses(levelId),
    [levelId]
  )

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

  const courses = Array.isArray(data) ? data : (data?.results || [])

  return (
    <div className="courses-page">
      <div className="courses-shell">
        <header className="courses-header">
          <div>
            <span className="courses-eyebrow">Curriculum / Modules</span>
            <h1 className="courses-title">Available Modules</h1>
            <p className="courses-subtitle">
              Select a module to start learning
            </p>
          </div>

          <Link to="/levels" className="courses-back">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Levels
          </Link>
        </header>

        {courses.length === 0 ? (
          <EmptyState
            title="No modules available"
            hint="Check back soon for new modules."
          />
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id}>
                <article className="course-card">
                  <div className="course-icon">📚</div>
                  <h3 className="course-title">{course.title}</h3>
                  {course.description && (
                    <p className="course-description">{course.description}</p>
                  )}
                  <div className="course-buttons">
                    <Link
                      to={`/lessons/${course.id}`}
                      state={{ levelId }}
                      className="course-btn lessons-btn"
                    >
                      View Lessons
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