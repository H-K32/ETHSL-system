import { Link, useParams } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getLessons } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Lessons() {
  const { courseId } = useParams()
  const { data, loading, error, reload } = useAsync(() => getLessons(courseId), [courseId])
  if (loading) return <Spinner />
  if (error) return <div className="max-w-4xl mx-auto px-4 py-10"><ErrorState error={error} onRetry={reload} /></div>
  const lessons = (data?.results || data || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Lessons</h1>
      {lessons.length === 0 ? (
        <div className="mt-6"><EmptyState title="No lessons in this course yet" /></div>
      ) : (
        <ul className="mt-6 space-y-3">
          {lessons.map((l, i) => {
            const locked = l.locked === true || l.is_locked === true
            const completed = l.completed === true || l.is_completed === true
            const Row = (
              <div className={`flex items-center justify-between rounded-xl border p-4 ${
                locked ? 'bg-slate-50 border-slate-200 opacity-70' :
                'bg-white border-slate-200 hover:border-brand-500'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 grid place-items-center rounded-full text-sm font-semibold ${
                    completed ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-700'
                  }`}>
                    {completed ? '✓' : i + 1}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{l.title}</div>
                    {l.description && <div className="text-xs text-slate-500 line-clamp-1">{l.description}</div>}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {locked ? '🔒 Locked' : completed ? 'Completed' : 'Open'}
                </div>
              </div>
            )
            return (
              <li key={l.id}>
                {locked ? Row : <Link to={`/lesson/${l.id}`}>{Row}</Link>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
