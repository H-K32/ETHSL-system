import { Link, useParams } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getCourses } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import '../styles/courses.css'

export default function Courses() {
  const { levelId } = useParams()
  const { data, loading, error, reload } = useAsync(() => getCourses(levelId), [levelId])

  if (loading) return <Spinner />
<<<<<<< HEAD

  if (error)
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <ErrorState error={error} onRetry={reload} />
      </div>
    )

  const courses = data?.results || data || []

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
      <p className="text-sm text-slate-500 mt-1">
        Courses available at this level.
      </p>

      {courses.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No courses yet" />
        </div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {courses.map((c) => {
            const locked = c.locked === true || c.is_locked === true

            const Card = (
              <div
                className={`rounded-xl border p-5 ${
                  locked
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : 'bg-white border-slate-200 hover:border-brand-500 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-900">{c.title}</h3>
                  {locked && <span className="text-xs text-slate-500">🔒</span>}
                </div>

                {c.description && (
                  <p className="text-sm text-slate-600 mt-1">
                    {c.description}
                  </p>
                )}

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(c.progress ?? 0)}%</span>
                  </div>
                  <ProgressBar value={c.progress ?? 0} />
                </div>
              </div>
            )

            return locked ? (
              <div key={c.id}>{Card}</div>
            ) : (
              <Link key={c.id} to={`/courses/${c.id}/lessons`}>
                {Card}
              </Link>
            )
          })}
=======
  if (error) {
    return (
      <div className="courses-page">
        <div className="courses-shell">
          <ErrorState error={error} onRetry={reload} />
>>>>>>> lud-branch
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
            <span className="courses-eyebrow">Curriculum / Courses</span>
            <h1 className="courses-title">Available Courses</h1>
            <p className="courses-subtitle">Select a course to start learning</p>
          </div>
          <Link to="/levels" className="courses-back">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Levels
          </Link>
        </header>

        {courses.length === 0 ? (
          <EmptyState title="No courses available" hint="Check back soon for new courses." />
        ) : (
          <div className="courses-grid">
            {courses.map((course) => {
              const progress = course.progress ?? 0
              const hasQuiz = course.has_quiz === true
              const quizId = course.quiz_id

              return (
                <article key={course.id} className="course-card">
                  <div className="course-icon">📚</div>
                  <h3 className="course-title">{course.title}</h3>
                  {course.description && (
                    <p className="course-description">{course.description}</p>
                  )}

                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="progress-text">{Math.round(progress)}%</span>
                  </div>

                  <div className="course-buttons">
                    <Link to={`/lessons/${course.id}`} className="course-btn lessons-btn">
                      View Lessons
                    </Link>
                    {hasQuiz && quizId && (
                      <Link to={`/quiz/${quizId}`} className="course-btn quiz-btn">
                        Take Course Quiz
                      </Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}