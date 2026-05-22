import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import useAsync from '../utils/useAsync.js'
import { getLesson, completeLesson } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import '../styles/lessondetail.css'

function YouTubeOrVideo({ url }) {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([\w-]+)/)
  if (yt) {
    return (
      <div className="video-container">
        <iframe 
          src={`https://www.youtube.com/embed/${yt[1]}`} 
          allowFullScreen 
          title="lesson"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    )
  }
  return (
    <div className="video-container">
      <video controls controlsList="nodownload">
        <source src={url} />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export default function LessonDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: lesson, loading, error, reload } = useAsync(() => getLesson(id), [id])
  const [completing, setCompleting] = useState(false)
  const [done, setDone] = useState(false)

  if (loading) return <Spinner />
  if (error) return <div className="lesson-detail-container"><ErrorState error={error} onRetry={reload} /></div>

  const onComplete = async () => {
    setCompleting(true)
    try { 
      await completeLesson(id)
      setDone(true)
      // Show success message
      alert('Lesson completed! You can now proceed to the quiz if available.')
    } catch (e) { 
      alert(e?.response?.data?.detail || 'Could not mark as complete') 
    } finally { 
      setCompleting(false) 
    }
  }

  const completed = done || lesson?.completed || lesson?.is_completed
  const videoUrl = lesson?.video_url || lesson?.video
  const quizData = lesson?.quiz
  const quizId = quizData?.id || lesson?.quiz_id

  return (
    <div className="lesson-detail-container">
      <Link to="#" onClick={() => nav(-1)} className="back-link">
        ← Back to Lessons
      </Link>
      <h1 className="lesson-title">{lesson?.title}</h1>
      
      <YouTubeOrVideo url={videoUrl} />
      
      {lesson?.description && (
        <div className="lesson-description">
          <p>{lesson.description}</p>
        </div>
      )}
      
      <div className="lesson-actions">
        {/* Mark Complete button - only show if not completed */}
        {!completed && (
          <button
            disabled={completing}
            onClick={onComplete}
            className="btn-complete"
          >
            {completing ? 'Saving…' : '✓ Mark as complete'}
          </button>
        )}
        
        {/* Show Quiz button after lesson is completed */}
        {completed && quizId && (
          <button 
            onClick={() => nav(`/quiz/${quizId}`)} 
            className="btn-quiz"
          >
            📝 Take Quiz →
          </button>
        )}
        
        {/* Show message if completed but no quiz */}
        {completed && !quizId && (
          <div className="completed-message">
            ✓ Lesson completed! No quiz for this lesson.
          </div>
        )}
        
        {/* Show message if not completed but quiz exists */}
        {!completed && quizId && (
          <div className="quiz-warning">
            ⚠️ Complete the lesson first to unlock the quiz
          </div>
        )}
      </div>
    </div>
  )
}