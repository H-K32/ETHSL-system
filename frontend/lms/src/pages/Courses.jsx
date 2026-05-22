import { Link, useParams } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getCourses } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ProgressBar from '../components/ProgressBar.jsx'

export default function Courses() {
  const { levelId } = useParams()
  const { data, loading, error, reload } = useAsync(() => getCourses(levelId), [levelId])

  if (loading) return <Spinner />

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
        </div>
      )}
    </div>
  )
}