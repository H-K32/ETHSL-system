import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import useAsync from '../utils/useAsync.js'
import { getLesson, completeLesson, askTutor, translateContent } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import '../styles/LessonDetail.css'

function VideoPlayer({ url }) {
  if (!url) return null

  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
  )
  if (ytMatch?.[1]) {
    return (
      <div className="lesson-media">
        <iframe
          className="lesson-iframe"
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          allowFullScreen
          title="lesson video"
        />
      </div>
    )
  }

  // Native video (Cloudinary)
  return (
    <div className="lesson-media">
      <video
        controls
        className="lesson-video"
        preload="metadata"
      >
        <source src={url} type="video/mp4" />
        Your browser does not support this video.
      </video>
    </div>
  )
}

export default function LessonDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const location = useLocation()
  const courseId = location.state?.courseId

  const { data: lesson, loading, error, reload } = useAsync(
    () => getLesson(id),
    [id]
  )

  const { lang, t } = useLanguage()
  const [amTitle, setAmTitle] = useState(null)
  const [amDesc, setAmDesc] = useState(null)
  const [translationError, setTranslationError] = useState(null)

  useEffect(() => {
    if (lang !== 'am' || !lesson?.id) return
    
    // Translate title
    if (!amTitle) {
      console.log('[LessonDetail] Translating title for lesson', lesson.id)
      translateContent('lesson', lesson.id, 'title')
        .then(r => { 
          console.log('[LessonDetail] Title translation SUCCESS:', r.translated); 
          setAmTitle(r.translated) 
        })
        .catch(e => { 
          console.error('[LessonDetail] Title translation FAILED:', e); 
          setTranslationError(`Title translation failed: ${e.message}`);
        })
    }
    
    // Translate description
    if (!amDesc) {
      console.log('[LessonDetail] Translating description for lesson', lesson.id)
      translateContent('lesson', lesson.id, 'description')
        .then(r => { 
          console.log('[LessonDetail] Desc translation SUCCESS:', r.translated); 
          setAmDesc(r.translated) 
        })
        .catch(e => { 
          console.error('[LessonDetail] Desc translation FAILED:', e);
          setTranslationError(`Description translation failed: ${e.message}`);
        })
    }
  }, [lang, lesson?.id])

  const [completing, setCompleting] = useState(false)
  const [done, setDone] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (chatOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatOpen])

  const sendMessage = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || thinking) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])
    setThinking(true)
    try {
      const data = await askTutor(lesson?.id, text)
      setMessages((m) => [...m, { role: 'ai', text: data.reply }])
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Sorry, I could not reach the AI tutor right now.' }])
    } finally {
      setThinking(false)
    }
  }

  if (loading) return <Spinner />

  if (error)
    return (
      <div className="lesson-detail-page">
        <div className="lesson-detail-shell">
          <ErrorState error={error} onRetry={reload} />
        </div>
      </div>
    )

  const videoUrl = lesson?.video
  const completed = done || lesson?.completed === true
  const quizId = lesson?.quiz?.id || lesson?.quiz_id

  const onComplete = async () => {
    setCompleting(true)
    try {
      await completeLesson(id)
      setDone(true)
      reload()
    } catch (e) {
      alert(e?.response?.data?.detail || 'Could not mark as complete')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="lesson-detail-page">
      <div className="lesson-detail-shell">
        <Link
          to={courseId ? `/lessons/${courseId}` : '/levels'}
          state={{ levelId: location.state?.levelId }}
          className="lesson-back"
        >
          {t('backToModule')}
        </Link>

        <span className="lesson-detail-eyebrow">{t('lesson')}</span>

        <h1 className="lesson-detail-title">{lang === 'am' && amTitle ? amTitle : lesson?.title}</h1>

        <VideoPlayer url={videoUrl} />

        {lesson?.description && (
          <div className="lesson-body">{lang === 'am' && amDesc ? amDesc : lesson.description}</div>
        )}

        <div className="lesson-actions">
          <button
            disabled={completing || completed}
            onClick={onComplete}
            className={`lesson-btn ${completed ? 'lesson-btn-success' : 'lesson-btn-primary'}`}
          >
            {completed ? `✓ ${t('completed')}` : completing ? t('saving') : t('markComplete')}
          </button>

          {quizId && (
            <button
              onClick={() => nav(`/quiz/${quizId}`, { state: { courseId, levelId: location.state?.levelId } })}
              className="lesson-btn lesson-btn-ghost"
            >
              {t('takeQuiz')}
            </button>
          )}
        </div>
      </div>

      {/* AI Tutor Chat */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50 }}>
        {chatOpen && (
          <div style={{ width: '22rem', height: '28rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2f5be0', borderRadius: '1rem 1rem 0 0' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>🤖 AI Tutor</span>
              <button onClick={() => setChatOpen(false)} style={{ color: 'white', background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {messages.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem' }}>{t('askMeAnything')}</p>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '0.5rem 0.75rem', borderRadius: '0.75rem', fontSize: '0.82rem', lineHeight: 1.5, background: m.role === 'user' ? '#2f5be0' : '#f1f5f9', color: m.role === 'user' ? 'white' : '#1e293b' }}>
                  {m.text}
                </div>
              ))}
              {thinking && (
                <div style={{ alignSelf: 'flex-start', padding: '0.5rem 0.75rem', borderRadius: '0.75rem', background: '#f1f5f9', fontSize: '0.82rem', color: '#64748b' }}>{t('thinking')}</div>
              )}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} style={{ padding: '0.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('askQuestion')}
                style={{ flex: 1, padding: '0.45rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none' }}
              />
              <button type="submit" disabled={thinking || !input.trim()} style={{ background: '#2f5be0', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.45rem 0.75rem', cursor: 'pointer', fontSize: '0.82rem', opacity: thinking || !input.trim() ? 0.5 : 1 }}>{t('send')}</button>
            </form>
          </div>
        )}
        <button
          onClick={() => setChatOpen((o) => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#2f5be0', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.65rem 1.1rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(47,91,224,0.4)' }}
        >
          🤖 {chatOpen ? t('closeTutor') : t('askAiTutor')}
        </button>
      </div>
    </div>
  )
}
