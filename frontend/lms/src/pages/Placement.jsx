import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getPlacementQuiz, submitPlacement, translateContent } from '../api/lms.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'

function VideoPlayer({ url }) {
  if (!url) return null
  const ytMatch = url.match(
    /(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
  )
  if (ytMatch?.[1]) {
    return (
      <div className="mt-3 w-full aspect-video">
        <iframe
          className="w-full h-full rounded"
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          allowFullScreen
          title="question video"
        />
      </div>
    )
  }
  return (
    <div className="mt-3">
      <video controls className="rounded max-h-60 w-full" preload="metadata">
        <source src={url} type="video/mp4" />
      </video>
    </div>
  )
}

export default function Placement() {
  const { state } = useLocation()
  const { refresh } = useAuth()
  const { lang, t } = useLanguage()
  const desiredLevel = state?.level || 'intermediate'

  const { data: quiz, loading, error, reload } = useAsync(() => getPlacementQuiz(desiredLevel), [desiredLevel])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [amQ, setAmQ] = useState({})
  const nav = useNavigate()

  const questions = quiz?.questions || []

  // Fetch Amharic translations for questions and options when lang is 'am'
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

  if (loading) return <Spinner />
  if (error) return <div className="max-w-3xl mx-auto px-4 py-10"><ErrorState error={error} onRetry={reload} /></div>

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const answersArray = Object.entries(answers).map(([questionId, optionId]) => ({
        question: Number(questionId),
        selected_option: Number(optionId)
      }))
      const r = await submitPlacement(quiz.id, answersArray, desiredLevel)
      await refresh()
      setResult(r)
    } catch (e) {
      alert(e?.response?.data?.detail || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    const passed = result.passed
    const assignedLevel = result.assigned_level_display || result.assigned_level
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">{passed ? '✅' : '⚠️'}</div>
        <h1 className="text-2xl font-bold text-slate-900">
          {passed ? t('placementPassed') : t('placementComplete')}
        </h1>
        <p className="mt-4 text-slate-600 text-lg">
          {passed
            ? `${t('placementPassedMsg')} ${assignedLevel} ${t('placementPassedMsg2')}`
            : t('placementFailedMsg')
          }
        </p>
        <p className="mt-2 text-slate-500">
          {t('placementScore')}: <span className="font-semibold">{result.score}</span>
        </p>
        <button
          className="mt-8 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          onClick={() => nav('/levels', { replace: true })}
        >
          {t('placementContinue')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">{t('placementTitle')}</h1>
      <p className="text-sm text-slate-500 mt-1">{t('placementSubtitle')}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>{t('placementNoQuestions')}</p>
            <button
              type="button"
              onClick={() => nav('/levels', { replace: true })}
              className="mt-4 px-5 py-2 rounded-lg bg-slate-200 text-slate-900 hover:bg-slate-300"
            >
              {t('placementSkip')}
            </button>
          </div>
        ) : (
          <>
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="font-semibold text-slate-900 mb-4">
                  {idx + 1}. {lang === 'am' && amQ[`q_${q.id}`] ? amQ[`q_${q.id}`] : q.question_text}
                </div>

                {q.question_image && (
                  <img src={q.question_image} alt="question" className="mt-3 rounded max-h-60" />
                )}
                <VideoPlayer url={q.question_video} />

                <div className="space-y-3 mt-3">
                  {(q.options || []).map((o) => (
                    <label
                      key={o.id}
                      className={`flex flex-col gap-2 p-3 rounded-lg cursor-pointer transition border ${
                        answers[q.id] === o.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'hover:bg-slate-50 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={o.id}
                          checked={answers[q.id] === o.id}
                          onChange={() => setAnswers({ ...answers, [q.id]: o.id })}
                          className="w-4 h-4"
                        />
                        <span className="text-slate-700">
                          {lang === 'am' && amQ[`o_${o.id}`] ? amQ[`o_${o.id}`] : o.option_text}
                        </span>
                      </div>
                      {o.option_image && (
                        <img src={o.option_image} alt="option" className="max-h-32 rounded" />
                      )}
                      {o.option_video && (
                        <video controls className="max-h-40 rounded w-full">
                          <source src={o.option_video} />
                        </video>
                      )}
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
              {submitting ? t('placementSubmitting') : t('placementSubmit')}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
