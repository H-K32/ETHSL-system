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
            <span className="courses-eyebrow">Curriculum / Courses</span>
            <h1 className="courses-title">Available Courses</h1>
            <p className="courses-subtitle">
              Select a course to start learning
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
            title="No courses available"
            hint="Check back soon for new courses."
          />
        ) : (
          <div className="courses-grid">
            {courses.map((course) => {
              // ✅ BACKEND SOURCE OF TRUTH
              const locked = !course.unlocked
              const progress = course.progress ?? 0

              const hasQuiz = course.has_quiz === true
              const quizId = course.quiz_id
              const canTakeQuiz = course.can_take_course_quiz === true

              const Card = (
                <article
                  className={`course-card ${
                    locked ? 'locked opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="course-icon">📚</div>

                  <h3 className="course-title">{course.title}</h3>

                  {course.description && (
                    <p className="course-description">
                      {course.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="course-buttons">
                    <Link
                      to={locked ? '#' : `/lessons/${course.id}`}
                      state={{ levelId }}
                      className="course-btn lessons-btn"
                      onClick={(e) => locked && e.preventDefault()}
                    >
                      {locked ? 'Locked' : 'View Lessons'}
                    </Link>

                    {hasQuiz && quizId && (
                      <Link
                        to={canTakeQuiz ? `/quiz/${quizId}` : '#'}
                        className={`course-btn quiz-btn${canTakeQuiz ? '' : ' disabled'}`}
                        onClick={(e) => !canTakeQuiz && e.preventDefault()}
                        title={canTakeQuiz ? '' : 'Complete all lessons and quizzes first'}
                      >
                        Take Course Quiz
                      </Link>
                    )}
                  </div>
                </article>
              )

              return <div key={course.id}>{Card}</div>
            })}
          </div>
        )}
      </div>
    </div>
  )
}