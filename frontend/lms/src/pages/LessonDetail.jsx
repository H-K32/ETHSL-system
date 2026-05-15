import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import useAsync from '../utils/useAsync.js'
import { getLesson, completeLesson } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'

function YouTubeOrVideo({ url }) {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([\w-]+)/)
  if (yt) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${yt[1]}`} allowFullScreen title="lesson" />
      </div>
    )
  }
  return (
    <video controls className="w-full rounded-xl bg-black">
      <source src={url} />
    </video>
  )
}

export default function LessonDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: lesson, loading, error, reload } = useAsync(() => getLesson(id), [id])
  const [completing, setCompleting] = useState(false)
  const [done, setDone] = useState(false)

  if (loading) return <Spinner />
  if (error) return <div className="max-w-4xl mx-auto px-4 py-10"><ErrorState error={error} onRetry={reload} /></div>

  const onComplete = async () => {
    setCompleting(true)
    try { await completeLesson(id); setDone(true) }
    catch (e) { alert(e?.response?.data?.detail || 'Could not mark as complete') }
    finally { setCompleting(false) }
  }

  const completed = done || lesson?.completed || lesson?.is_completed
  const quizId = lesson?.quiz?.id || lesson?.quiz_id

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={-1} className="text-sm text-slate-500 hover:text-brand-600">← Back</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{lesson?.title}</h1>
      <div className="mt-4">
        <YouTubeOrVideo url={lesson?.video_url} />
      </div>
      {lesson?.description && (
        <div className="mt-6 prose prose-slate max-w-none whitespace-pre-wrap text-slate-700">
          {lesson.description}
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          disabled={completing || completed}
          onClick={onComplete}
          className={`px-4 py-2 rounded-lg font-medium ${
            completed ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-600 text-white hover:bg-brand-700'
          } disabled:opacity-70`}
        >
          {completed ? '✓ Completed' : completing ? 'Saving…' : 'Mark as complete'}
        </button>
        {quizId && (
          <button onClick={() => nav(`/quiz/${quizId}`)} className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">
            Take quiz →
          </button>
        )}
      </div>
    </div>
  )
}
