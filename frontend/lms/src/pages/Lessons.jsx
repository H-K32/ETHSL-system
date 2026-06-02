import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getLessons } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import '../styles/Lessons.css'

export default function Lessons() {
  const { courseId } = useParams()
  const nav = useNavigate()
  const { state } = useLocation()
  const levelId = state?.levelId

  const { data, loading, error, reload } = useAsync(
    () => getLessons(courseId),
    [courseId]
  )

  if (loading) return <Spinner />

  if (error)
    return (
      <div className="lessons-page">
        <div className="lessons-shell">
          <ErrorState error={error} onRetry={reload} />
        </div>
      </div>
    )

  // normalize response
  const lessons = (data?.results || data || [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div className="lessons-page">
      <div className="lessons-shell">
        <span className="lessons-eyebrow">Module · Lessons</span>
        <h1 className="lessons-title">Your Learning Path</h1>
        <p className="lessons-subtitle">
          Work through each lesson in order — unlock the next as you complete them.
        </p>

        <button
          type="button"
          onClick={() => levelId ? nav(`/courses/${levelId}`) : nav(-1)}
          className="lessons-back"
        >
          ← Back to Modules
        </button>

        <div className="lessons-divider" />

        {lessons.length === 0 ? (
          <EmptyState title="No lessons in this module yet" />
        ) : (
          <ul className="lessons-list">
            {lessons.map((l, i) => {
              // ✅ BACKEND SOURCE OF TRUTH
              const locked = !l.unlocked
              const completed = l.completed === true

              const stateClass = locked
                ? 'is-locked'
                : completed
                ? 'is-completed'
                : 'is-open'

              const Row = (
                <div className={`lesson-row ${stateClass}`}>
                  <div className="lesson-row-left">
                    <div className="lesson-index">
                      {completed ? '✓' : locked ? '🔒' : i + 1}
                    </div>

                    <div className="lesson-meta">
                      <div className="lesson-name">{l.title}</div>

                      {l.description && (
                        <div className="lesson-blurb">{l.description}</div>
                      )}
                    </div>
                  </div>

                  <span className={`lesson-status ${stateClass}`}>
                    {locked ? 'Locked' : completed ? 'Completed' : 'Open'}
                  </span>
                </div>
              )

              return (
                <li key={l.id}>
                  {locked ? (
                    // locked = not clickable
                    Row
                  ) : (
                    <Link
                      to={`/lesson/${l.id}`}
                      state={{ courseId }}
                      style={{ textDecoration: 'none' }}
                    >
                      {Row}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}