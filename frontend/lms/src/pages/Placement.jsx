import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getPlacementQuiz, submitPlacement } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'

export default function Placement() {
  const { state } = useLocation()
  const desiredLevel = state?.level || 'intermediate' // Get level from previous page or default
  
  const { data: quiz, loading, error, reload } = useAsync(() => getPlacementQuiz(desiredLevel), [desiredLevel])
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
      const answersArray = Object.entries(answers).map(([questionId, optionId]) => ({
        question: Number(questionId),
        selected_option: Number(optionId)
      }))
      
      const r = await submitPlacement(quiz.quiz_id, answersArray, desiredLevel)
      setResult(r)
    } catch (e) {
      alert(e?.response?.data?.detail || 'Submission failed')
    }
    finally {
      setSubmitting(false)
    }
  }

  if (result) {
    const passed = result.passed
    const assignedLevel = result.assigned_level_display || result.assigned_level
    
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className={`text-5xl mb-4 ${passed ? '✅' : '⚠️'}`}></div>
        <h1 className="text-2xl font-bold text-slate-900">
          {passed ? 'Placement Test Passed!' : 'Placement Test Complete'}
        </h1>
        <p className="mt-4 text-slate-600 text-lg">
          {passed
            ? `Congratulations! You've been placed in the ${assignedLevel} level.`
            : `You've been placed in the Beginner level to help you get started.`
          }
        </p>
        <p className="mt-2 text-slate-500">
          Score: <span className="font-semibold">{result.score}</span>
        </p>
        <button
          className="mt-8 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          onClick={() => nav('/levels', { replace: true })}
        >
          Continue to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Placement Test</h1>
      <p className="text-sm text-slate-500 mt-1">Answer the questions below to determine your starting level.</p>
      
      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No placement questions available.</p>
            <button
              type="button"
              onClick={() => nav('/levels', { replace: true })}
              className="mt-4 px-5 py-2 rounded-lg bg-slate-200 text-slate-900 hover:bg-slate-300"
            >
              Skip to Dashboard
            </button>
          </div>
        ) : (
          <>
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="font-semibold text-slate-900 mb-4">
                  {idx + 1}. {q.question_text || q.text}
                </div>
                <div className="space-y-3">
                  {(q.options || []).map((o) => (
                    <label
                      key={o.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={o.id}
                        checked={answers[q.id] === o.id}
                        onChange={() => setAnswers({ ...answers, [q.id]: o.id })}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-700">{o.option_text || o.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            <button
              type="submit"
              disabled={submitting || Object.keys(answers).length < questions.length}
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed mt-6"
            >
              {submitting ? 'Submitting…' : 'Submit Answers'}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
