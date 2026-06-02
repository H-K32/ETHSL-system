import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getQuiz, submitQuiz } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'

export default function Quiz() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: quiz, loading, error, reload } = useAsync(() => getQuiz(id), [id])
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  // Track which questions were left unanswered on a submit attempt
  const [unanswered, setUnanswered] = useState([])

  if (loading) return <Spinner />
  if (error) return <div className="max-w-3xl mx-auto px-4 py-10"><ErrorState error={error} onRetry={reload} /></div>

  const questions = quiz?.questions || []

  const onSubmit = async (e) => {
    e.preventDefault()

    // Validate — every question must have a selected answer
    const missing = questions.filter((q) => answers[q.id] === undefined).map((q) => q.id)
    if (missing.length > 0) {
      setUnanswered(missing)
      // Scroll to the first unanswered question
      const el = document.getElementById(`question-${missing[0]}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setUnanswered([])
    setSubmitting(true)
    try {
      const payload = Object.entries(answers).map(([question, option]) => ({
        question: Number(question),
        selected_option: Number(option)
      }))
      const r = await submitQuiz(id, payload)
      setResult(r)
    } catch (err) {
      alert(err?.response?.data?.detail || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    const passed = result.passed ?? (result.score >= (quiz?.passing_score ?? 0))
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {passed ? 'Passed' : 'Did not pass'}
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Your score: {result.score ?? '—'}</h1>
        {quiz?.passing_score != null && (
          <p className="mt-1 text-sm text-slate-500">Passing score: {quiz.passing_score}</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => { setResult(null); setAnswers({}); setUnanswered([]) }}
            className="px-4 py-2 rounded-lg border border-slate-200"
          >
            Retake
          </button>
          <button onClick={() => nav(-1)} className="px-4 py-2 rounded-lg bg-brand-600 text-white">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined)
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">{quiz?.title || 'Quiz'}</h1>
      {quiz?.description && <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>}

      {/* Progress indicator */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
          {answeredCount} / {questions.length} answered
        </span>
      </div>

      {/* Unanswered warning banner */}
      {unanswered.length > 0 && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          ⚠️ Please answer all {unanswered.length} remaining question{unanswered.length > 1 ? 's' : ''} before submitting.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {questions.map((q, idx) => {
          const isUnanswered = unanswered.includes(q.id)
          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              className={`bg-white border rounded-xl p-5 transition-colors ${
                isUnanswered
                  ? 'border-red-400 ring-2 ring-red-200'
                  : answers[q.id] !== undefined
                  ? 'border-emerald-300'
                  : 'border-slate-200'
              }`}
            >
              {/* Question */}
              <div className="font-medium text-slate-900 flex items-start gap-2">
                <span className={`text-xs font-mono mt-0.5 px-1.5 py-0.5 rounded ${
                  isUnanswered ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {idx + 1}
                </span>
                <span>{q.question_text}</span>
              </div>

              {isUnanswered && (
                <p className="mt-1 ml-7 text-xs text-red-500 font-medium">This question requires an answer.</p>
              )}

              {q.question_image && (
                <img src={q.question_image} alt="question" className="mt-3 rounded max-h-60" />
              )}
              {q.question_video && (
                <video controls className="mt-3 rounded max-h-60">
                  <source src={q.question_video} />
                </video>
              )}

              {/* Options */}
              <div className="mt-3 space-y-2">
                {(q.options || []).map((o) => (
                  <label
                    key={o.id}
                    className={`flex flex-col gap-2 p-2 rounded cursor-pointer transition-colors ${
                      answers[q.id] === o.id
                        ? 'bg-emerald-50 border border-emerald-300'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={o.id}
                        checked={answers[q.id] === o.id}
                        onChange={() => {
                          setAnswers({ ...answers, [q.id]: o.id })
                          // Clear unanswered highlight for this question once answered
                          setUnanswered((prev) => prev.filter((qid) => qid !== q.id))
                        }}
                      />
                      <span>{o.option_text}</span>
                    </div>
                    {o.option_image && (
                      <img src={o.option_image} alt="option" className="max-h-32 rounded" />
                    )}
                    {o.option_video && (
                      <video controls className="max-h-40 rounded">
                        <source src={o.option_video} />
                      </video>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )
        })}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className={`px-5 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-60 ${
              allAnswered ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-400 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Submitting…' : 'Submit quiz'}
          </button>
          {!allAnswered && (
            <span className="text-xs text-slate-400 font-mono">
              Answer all questions to submit
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
