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

  if (loading) return <Spinner />
  if (error) return <div className="max-w-3xl mx-auto px-4 py-10"><ErrorState error={error} onRetry={reload} /></div>

  const questions = quiz?.questions || []
  console.log("QUIZ DATA:", quiz)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = Object.entries(answers).map(([question, option]) => ({
        question: Number(question),
        selected_option: Number(option)
      }))
      const r = await submitQuiz(id, payload)
      setResult(r)
    } catch (e) {
      alert(e?.response?.data?.detail || 'Submission failed')
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
          <button onClick={() => { setResult(null); setAnswers({}) }} className="px-4 py-2 rounded-lg border border-slate-200">Retake</button>
          <button onClick={() => nav(-1)} className="px-4 py-2 rounded-lg bg-brand-600 text-white">Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">{quiz?.title || 'Quiz'}</h1>
      {quiz?.description && <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-5">

            {/* ================= QUESTION ================= */}
            <div className="font-medium text-slate-900">
              {idx + 1}. {q.question_text}
            </div>

            {/* QUESTION IMAGE */}
            {q.question_image && (
              <img
                src={q.question_image}
                alt="question"
                className="mt-3 rounded max-h-60"
              />
            )}

            {/* QUESTION VIDEO */}
            {q.question_video && (
              <video controls className="mt-3 rounded max-h-60">
                <source src={q.question_video} />
              </video>
            )}

            {/* ================= OPTIONS ================= */}
            <div className="mt-3 space-y-2">
              {(q.options || []).map((o) => (
                <label key={o.id} className="flex flex-col gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">

                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={o.id}
                      checked={answers[q.id] === o.id}
                      onChange={() =>
                        setAnswers({ ...answers, [q.id]: o.id })
                      }
                    />

                    <span>{o.option_text}</span>
                  </div>

                  {/* OPTION IMAGE */}
                  {o.option_image && (
                    <img
                      src={o.option_image}
                      alt="option"
                      className="max-h-32 rounded"
                    />
                  )}

                  {/* OPTION VIDEO */}
                  {o.option_video && (
                    <video controls className="max-h-40 rounded">
                      <source src={o.option_video} />
                    </video>
                  )}

                </label>
              ))}
            </div>

          </div>
        ))}

        <button
          disabled={submitting}
          className="px-5 py-3 rounded-lg bg-brand-600 text-white disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit quiz'}
        </button>
      </form>
    </div>
  )
}