 import { useParams, useNavigate, Link } from 'react-router-dom'
 import { useState } from 'react'
 import useAsync from '../utils/useAsync.js'
 import { getLesson, completeLesson } from '../api/lms.js'
 import Spinner from '../components/Spinner.jsx'
 import ErrorState from '../components/ErrorState.jsx'
 import '../styles/LessonDetail.css'
 
function VideoPlayer({ url }) {
  if (!url) return null

  // 1. Detect YouTube first
  const ytMatch = url.match(
    /(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
  )

  if (ytMatch?.[1]) {
    return (
      <div className="lesson-media lesson-media-aspect">
        <iframe
          className="lesson-iframe"
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          allowFullScreen
          title="lesson video"
        />
      </div>
    )
  }

 

  // 2. Fallback: treat as media file (Neon/Postgres stored path)
  return (
    <div className="lesson-media">
      <video controls className="lesson-video" preload="metadata">
        <source src={url} type="video/mp4" />
        Your browser does not support this video.
      </video>
    </div>
  )
}
 export default function LessonDetail() {
   const { id } = useParams()
   const nav = useNavigate()
 
   const { data: lesson, loading, error, reload } = useAsync(
     () => getLesson(id),
     [id]
   )
 
   const [completing, setCompleting] = useState(false)
   const [done, setDone] = useState(false)
 
   if (loading) return <Spinner />
 
   if (error)
     return (
       <div className="lesson-detail-page">
         <div className="lesson-detail-shell">
           <ErrorState error={error} onRetry={reload} />
         </div>
       </div>
     )
 
   const videoUrl = lesson?.video
   const completed = done || lesson?.completed === true
   const quizId = lesson?.quiz?.id || lesson?.quiz_id

   console.log("LESSON DATA:", lesson)
   console.log("VIDEO URL:", lesson?.video)
 

 
   const onComplete = async () => {
     setCompleting(true)
     try {
       await completeLesson(id)
       setDone(true)
     } catch (e) {
       alert(e?.response?.data?.detail || 'Could not mark as complete')
     } finally {
       setCompleting(false)
     }
   }
 
   return (
     <div className="lesson-detail-page">
       <div className="lesson-detail-shell">
         <Link to={-1} className="lesson-back">
           ← Back to lessons
         </Link>
 
         <span className="lesson-detail-eyebrow">Lesson</span>
 
         <h1 className="lesson-detail-title">{lesson?.title}</h1>
 
         <VideoPlayer url={videoUrl} />
 
         {lesson?.description && (
           <div className="lesson-body">{lesson.description}</div>
         )}
 
         <div className="lesson-actions">
           <button
             disabled={completing || completed}
             onClick={onComplete}
             className={`lesson-btn ${
               completed ? 'lesson-btn-success' : 'lesson-btn-primary'
             }`}
           >
             {completed ? '✓ Completed' : completing ? 'Saving…' : 'Mark as complete'}
           </button>
 
           {quizId && (
             <button
               onClick={() => nav(`/quiz/${quizId}`)}
               className="lesson-btn lesson-btn-ghost"
             >
               Take quiz →
             </button>
           )}
         </div>
       </div>
     </div>
   )
 }