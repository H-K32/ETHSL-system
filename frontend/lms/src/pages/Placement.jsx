import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getPlacementQuiz, submitPlacement } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'

export default function Placement() {
  const { data: quiz, loading, error, reload } = useAsync(() => getPlacementQuiz(), [])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const nav = useNavigate()

  if (loading) return <Spinner />
  if (error) return <div className="max-w-3xl mx-auto px-4 py-10"><ErrorState error={error} onRetry={reload} /></div>

  const questions = quiz?.questions || quiz?.results || quiz || []

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = Object.entries(answers).map(([question, option]) => ({ question: Number(question), option: Number(option) }))
      const r = await submitPlacement(payload)
      setResult(r)
    } catch (e) { alert(e?.response?.data?.detail || 'Submission failed') }
    finally { setSubmitting(false) }
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Placement complete</h1>
        <p className="mt-2 text-slate-600">
          Score: <span className="font-semibold">{result.score ?? '—'}</span>
          {result.level?.name && <> · Assigned level: <span className="font-semibold">{result.level.name}</span></>}
        </p>
        <button className="mt-6 px-5 py-3 rounded-lg bg-brand-600 text-white" onClick={() => nav('/levels')}>
          Continue to my levels
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Placement Test</h1>
      <p className="text-sm text-slate-500 mt-1">Answer the questions below — we'll find your starting level.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="font-medium text-slate-900">{idx + 1}. {q.question_text || q.text}</div>
            <div className="mt-3 space-y-2">
              {(q.options || []).map((o) => (
                <label key={o.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={o.id}
                    checked={answers[q.id] === o.id}
                    onChange={() => setAnswers({ ...answers, [q.id]: o.id })}
                  />
                  <span>{o.option_text || o.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button disabled={submitting} className="px-5 py-3 rounded-lg bg-brand-600 text-white disabled:opacity-60">
          {submitting ? 'Submitting…' : 'Submit answers'}
        </button>
      </form>
    </div>
  )
}
