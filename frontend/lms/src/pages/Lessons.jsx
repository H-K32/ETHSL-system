import { Link, useParams } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getLessons } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import '../styles/lessons.css'

export default function Lessons() {
  const { courseId } = useParams()
  const { data, loading, error, reload } = useAsync(() => getLessons(courseId), [courseId])
  
  if (loading) return <Spinner />
  if (error) return <div className="lessons-container"><ErrorState error={error} onRetry={reload} /></div>
  
  const lessons = Array.isArray(data) ? data : (data?.results || [])
  const sortedLessons = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  
  return (
    <div className="lessons-container">
      <div className="lessons-header">
        <div>
          <h1 className="lessons-title">Course Lessons</h1>
          <p className="lessons-subtitle">Complete each lesson and pass the quiz to unlock the next lesson</p>
        </div>
        <Link to="#" onClick={() => window.history.back()} className="back-button">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Courses
        </Link>
      </div>

      {sortedLessons.length === 0 ? (
        <EmptyState title="No lessons in this course yet" />
      ) : (
        <ul className="lessons-list">
          {sortedLessons.map((lesson, index) => {
            // Backend sends 'unlocked' based on can_access_lesson()
            // This checks if previous lesson AND its quiz are completed/passed
            const locked = lesson.unlocked === false
            const completed = lesson.completed === true
            const hasQuiz = lesson.has_quiz === true
            
            return (
              <li key={lesson.id} className="lesson-item">
                {locked ? (
                  <div className="lesson-card locked">
                    <div className="lesson-left">
                      <div className="lesson-number">{index + 1}</div>
                      <div className="lesson-info">
                        <div className="lesson-title">{lesson.title}</div>
                        {lesson.description && (
                          <div className="lesson-description">{lesson.description}</div>
                        )}
                        <div className="lesson-hint">
                          {index === 0 
                            ? "🔒 Complete previous lessons and pass quizzes to unlock" 
                            : "🔒 Complete previous lesson and pass its quiz first"}
                        </div>
                      </div>
                    </div>
                    <div className="lesson-status">
                      <span className="status-badge locked">🔒 Locked</span>
                    </div>
                  </div>
                ) : (
                  <Link to={`/lesson/${lesson.id}`} className="lesson-card-link">
                    <div className="lesson-card unlocked">
                      <div className="lesson-left">
                        <div className={`lesson-number ${completed ? 'completed' : ''}`}>
                          {completed ? '✓' : index + 1}
                        </div>
                        <div className="lesson-info">
                          <div className="lesson-title">{lesson.title}</div>
                          {lesson.description && (
                            <div className="lesson-description">{lesson.description}</div>
                          )}
                          {hasQuiz && !completed && (
                            <div className="lesson-warning">⚠️ Quiz required after this lesson</div>
                          )}
                        </div>
                      </div>
                      <div className="lesson-status">
                        {completed ? (
                          <span className="status-badge completed">✓ Completed</span>
                        ) : (
                          <span className="status-badge open">Start →</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}