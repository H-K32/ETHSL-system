import useAsync from '../utils/useAsync.js'
import { getProfile } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { logout } = useAuth()
  const { data, loading, error, reload } = useAsync(getProfile, [])
  if (loading) return <Spinner />
  if (error) return <div className="max-w-4xl mx-auto px-4 py-10"><ErrorState error={error} onRetry={reload} /></div>

  const p = data || {}
  const stats = p.stats || {
    completed_lessons: p.completed_lessons,
    quiz_average: p.quiz_average,
    current_level: p.current_level?.name || p.level?.name,
  }
  const courses = p.course_progress || p.courses || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-20 h-20 rounded-full bg-brand-600 text-white grid place-items-center text-2xl font-bold">
          {(p.full_name || p.username || 'U').slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{p.full_name || p.username}</h1>
          <p className="text-sm text-slate-500">{p.email}</p>
          <p className="text-sm text-slate-500">@{p.username}</p>
        </div>
        <button onClick={logout} className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-sm">Logout</button>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <Stat label="Completed lessons" value={stats.completed_lessons ?? 0} />
        <Stat label="Quiz average" value={stats.quiz_average != null ? `${Math.round(stats.quiz_average)}%` : '—'} />
        <Stat label="Current level" value={stats.current_level || '—'} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Course progress</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-slate-500 mt-2">No course progress yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {courses.map((c) => (
              <div key={c.id || c.course?.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-900">{c.title || c.course?.title}</span>
                  <span className="text-slate-500">
                    {c.completed_lessons ?? 0}/{c.total_lessons ?? '?'} lessons
                  </span>
                </div>
                <div className="mt-2"><ProgressBar value={c.progress ?? 0} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  )
}
