import { Link } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getLevels } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import '../styles/levels.css'
export default function Levels() {
  const { data, loading, error, reload } = useAsync(getLevels, [])
  if (loading) return <Spinner />
  if (error) return <div className="max-w-5xl mx-auto px-4 py-10"><ErrorState error={error} onRetry={reload} /></div>
  const levels = Array.isArray(data) ? data : []
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Your Levels</h1>
      <p className="text-sm text-slate-500 mt-1">Pick a level to view its courses.</p>
      {levels.length === 0 ? (
        <div className="mt-6"><EmptyState title="No levels available" hint="Check back soon." /></div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((l) => {
            const locked = !l.unlocked
            const Card = (
              <div className={`rounded-xl border p-5 transition ${locked ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-200 hover:border-brand-500 hover:shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-1 rounded">Level {l.order ?? ''}</span>
                  {locked && <span className="text-xs text-slate-500">🔒 Locked</span>}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">
  {l.display_name || l.name}
</h3>
                {l.description && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{l.description}</p>}
              </div>
            )
            return locked ? <div key={l.id}>{Card}</div> : <Link key={l.id} to={`/courses/${l.id}`}>{Card}</Link>
          })}
        </div>
      )}
    </div>
  )
}
