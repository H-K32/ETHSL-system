import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getQuiz, submitQuiz, translateContent } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Quiz() {
  const { id } = useParams()
  const nav = useNavigate()
  const location = useLocation()
  const courseId = location.state?.courseId
  const levelId = location.state?.levelId
  const { lang, t } = useLanguage()
  const { data: quiz, loading, error, reload } = useAsync(() => getQuiz(id), [id])
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [unanswered, setUnanswered] = useState([])
  const [amQ, setAmQ] = useState({})

  const questions = quiz?.questions || []

  useEffect(() => {
    if (lang !== 'am' || questions.length === 0) return
    questions.forEach(q => {
      if (!amQ[`q_${q.id}`]) {
        translateContent('question', q.id, 'question_text')
          .then(r => setAmQ(prev => ({ ...prev, [`q_${q.id}`]: r.translated })))
          .catch(() => {})
      }
      ;(q.options || []).forEach(o => {
        if (!amQ[`o_${o.id}`]) {
          translateContent('option', o.id, 'option_text')
            .then(r => setAmQ(prev => ({ ...prev, [`o_${o.id}`]: r.translated })))
            .catch(() => {})
        }
      })
    })
  }, [lang, questions.length])

  // Translate review texts after quiz submission
  useEffect(() => {
    if (lang !== 'am' || !result?.review) return
    result.review.forEach(r => {
      if (r.question_id && !amQ[`q_${r.question_id}`]) {
        translateContent('question', r.question_id, 'question_text')
          .then(res => setAmQ(prev => ({ ...prev, [`q_${r.question_id}`]: res.translated })))
          .catch(() => {})
      }
      if (r.selected_option_id && !amQ[`o_${r.selected_option_id}`]) {
        translateContent('option', r.selected_option_id, 'option_text')
          .then(res => setAmQ(prev => ({ ...prev, [`o_${r.selected_option_id}`]: res.translated })))
          .catch(() => {})
      }
      if (r.correct_option_id && !amQ[`o_${r.correct_option_id}`]) {
        translateContent('option', r.correct_option_id, 'option_text')
          .then(res => setAmQ(prev => ({ ...prev, [`o_${r.correct_option_id}`]: res.translated })))
          .catch(() => {})
      }
    })
  }, [lang, result])

  if (loading) return <Spinner />
  if (error) return <div className="max-w-3xl mx-auto px-4 py-10"><ErrorState error={error} onRetry={reload} /></div>

  const onSubmit = async (e) => {
    e.preventDefault()
    const missing = questions.filter((q) => answers[q.id] === undefined).map((q) => q.id)
    if (missing.length > 0) {
      setUnanswered(missing)
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

  const goBack = () => {
    if (courseId) nav(`/lessons/${courseId}`, { state: { levelId } })
    else if (levelId) nav(`/courses/${levelId}`)
    else nav('/levels')
  }

  if (result) {
    const passed = result.passed ?? (result.score >= (quiz?.passing_score ?? 0))
    const review = result.review || []
    const correctCount = review.filter(r => r.is_correct).length

    if (passed && result.certificate_earned) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <div className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 mb-4">
            {t('levelComplete')}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{t('congratulations')}</h1>
          <p className="text-slate-600 mb-2 text-lg">
            {t('levelCertificateMsg')} <strong>{result.level_name}</strong> {t('levelCertificateMsg2')}
          </p>
          <p className="text-slate-500 text-sm mb-8">
            {t('score')}: <strong>{result.score}</strong> &nbsp;·&nbsp; {t('passingScore')}: <strong>{quiz?.passing_score}</strong>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={() => nav('/certificates')} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
              {t('viewMyCertificate')}
            </button>
            <button onClick={() => nav('/levels')} className="px-6 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
              {t('backToLevels2')}
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className={`rounded-2xl p-6 mb-8 text-center border ${passed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-4xl mb-2">{passed ? '🎉' : '📚'}</div>
          <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-3 ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {passed ? t('passed') : t('didNotPass')}
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {correctCount} / {review.length} {t('correct')}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {t('score')}: <strong>{result.score}</strong> &nbsp;·&nbsp; {t('passingScore')}: <strong>{quiz?.passing_score}</strong>
          </p>
        </div>

        <h2 className="text-lg font-bold text-slate-800 mb-4">{t('reviewTitle')}</h2>
        <div className="space-y-4 mb-8">
          {review.map((r, idx) => (
            <div key={r.question_id} className={`rounded-xl border p-5 ${r.is_correct ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-start gap-2 mb-3">
                <span className={`shrink-0 text-xs font-mono px-1.5 py-0.5 rounded mt-0.5 ${r.is_correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{idx + 1}</span>
                <span className="font-medium text-slate-900">{lang === 'am' && amQ[`q_${r.question_id}`] ? amQ[`q_${r.question_id}`] : r.question_text}</span>
                <span className="ml-auto shrink-0">{r.is_correct ? '✅' : '❌'}</span>
              </div>
              <div className="space-y-1.5 text-sm pl-6">
                <p className={`flex items-center gap-2 ${r.is_correct ? 'text-emerald-700' : 'text-red-600'}`}>
                  <span className="font-semibold">{t('yourAnswer')}:</span>
                  <span>{lang === 'am' && amQ[`o_${r.selected_option_id}`] ? amQ[`o_${r.selected_option_id}`] : (r.selected_option_text || '—')}</span>
                </p>
                {!r.is_correct && (
                  <p className="flex items-center gap-2 text-emerald-700">
                    <span className="font-semibold">{t('correctAnswer')}:</span>
                    <span>{lang === 'am' && amQ[`o_${r.correct_option_id}`] ? amQ[`o_${r.correct_option_id}`] : (r.correct_option_text || '—')}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {passed ? (
            <button onClick={goBack} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
              {t('goToNextLesson')}
            </button>
          ) : (
            <button onClick={() => { setResult(null); setAnswers({}); setUnanswered([]) }} className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
              {t('retakeQuiz')}
            </button>
          )}
          <button onClick={goBack} className="px-6 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            {t('backToModule')}
          </button>
        </div>
      </div>
    )
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined)
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">{quiz?.title || t('quizTitle')}</h1>
      {quiz?.description && <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>}

      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }} />
        </div>
        <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
          {answeredCount} / {questions.length} {t('answered')}
        </span>
      </div>

      {unanswered.length > 0 && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          ⚠️ {t('pleaseAnswerAll')} {unanswered.length} {t('remainingQuestions')}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {questions.map((q, idx) => {
          const isUnanswered = unanswered.includes(q.id)
          return (
            <div key={q.id} id={`question-${q.id}`}
              className={`bg-white border rounded-xl p-5 transition-colors ${isUnanswered ? 'border-red-400 ring-2 ring-red-200' : answers[q.id] !== undefined ? 'border-emerald-300' : 'border-slate-200'}`}
            >
              <div className="font-medium text-slate-900 flex items-start gap-2">
                <span className={`text-xs font-mono mt-0.5 px-1.5 py-0.5 rounded ${isUnanswered ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                  {idx + 1}
                </span>
                <span>{lang === 'am' && amQ[`q_${q.id}`] ? amQ[`q_${q.id}`] : q.question_text}</span>
              </div>
              {isUnanswered && <p className="mt-1 ml-7 text-xs text-red-500 font-medium">{t('questionRequiresAnswer')}</p>}
              {q.question_image && <img src={q.question_image} alt="question" className="mt-3 rounded max-h-60" />}
              {q.question_video && <video controls className="mt-3 rounded max-h-60"><source src={q.question_video} /></video>}
              <div className="mt-3 space-y-2">
                {(q.options || []).map((o) => (
                  <label key={o.id} className={`flex flex-col gap-2 p-2 rounded cursor-pointer transition-colors ${answers[q.id] === o.id ? 'bg-emerald-50 border border-emerald-300' : 'hover:bg-slate-50 border border-transparent'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name={`q-${q.id}`} value={o.id} checked={answers[q.id] === o.id}
                        onChange={() => { setAnswers({ ...answers, [q.id]: o.id }); setUnanswered((prev) => prev.filter((qid) => qid !== q.id)) }}
                      />
                      <span>{lang === 'am' && amQ[`o_${o.id}`] ? amQ[`o_${o.id}`] : o.option_text}</span>
                    </div>
                    {o.option_image && <img src={o.option_image} alt="option" className="max-h-32 rounded" />}
                    {o.option_video && <video controls className="max-h-40 rounded"><source src={o.option_video} /></video>}
                  </label>
                ))}
              </div>
            </div>
          )
        })}

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={submitting}
            className={`px-5 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-60 ${allAnswered ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-400 cursor-not-allowed'}`}
          >
            {submitting ? t('submitting') : t('submitQuiz')}
          </button>
          {!allAnswered && <span className="text-xs text-slate-400 font-mono">{t('answerAllToSubmit')}</span>}
        </div>
      </form>
    </div>
  )
}
