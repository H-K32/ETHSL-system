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
  if (error) return <div className="courses-container"><ErrorState error={error} onRetry={reload} /></div>
  
  const courses = Array.isArray(data) ? data : (data?.results || [])
  
  return (
    <div className="courses-container">
      <div className="courses-header">
        <div>
          <h1 className="courses-title">Available Courses</h1>
          <p className="courses-subtitle">Select a course to start learning</p>
        </div>
        <Link to="/levels" className="back-button">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Levels
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState title="No courses available" hint="Check back soon for new courses." />
      ) : (
        <div className="courses-grid">
          {courses.map((course) => {
            const locked = course.unlocked === false
            const progress = course.progress ?? 0
            
            return locked ? (
              <div key={course.id} className="course-card locked">
                <div className="course-locked-overlay">
                  <span>🔒</span>
                  <p>Complete previous course to unlock</p>
                </div>
                <div className="course-icon">📘</div>
                <h3 className="course-title">{course.title}</h3>
                {course.description && <p className="course-description">{course.description}</p>}
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="progress-text">{Math.round(progress)}%</span>
                </div>
              </div>
            ) : (
              // ✅ FIXED: Correct link to lessons page
              <Link key={course.id} to={`/lessons/${course.id}`} className="course-card-link">
                <div className="course-card unlocked">
                  <div className="course-icon">📚</div>
                  <h3 className="course-title">{course.title}</h3>
                  {course.description && <p className="course-description">{course.description}</p>}
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="progress-text">{Math.round(progress)}%</span>
                  </div>
                  <div className="course-action">
                    <span>View Lessons →</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}