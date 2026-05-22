import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getQuiz, submitQuiz } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
//import '../styles/quiz.css'

export default function Quiz() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: quiz, loading, error, reload } = useAsync(() => getQuiz(id), [id])
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  if (loading) return <Spinner />
  if (error) return <div className="quiz-container"><ErrorState error={error} onRetry={reload} /></div>

  const questions = quiz?.questions || []
  const passingScore = quiz?.passing_score || 70

  const onSubmit = async (e) => {
    e.preventDefault()
    
    // Check if all questions are answered
    if (Object.keys(answers).length !== questions.length) {
      alert(`Please answer all ${questions.length} questions before submitting.`)
      return
    }
    
    setSubmitting(true)
    try {
      const payload = Object.entries(answers).map(([qId, optId]) => ({ 
        question: Number(qId), 
        selected_option: Number(optId) 
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
    const passed = result.passed ?? (result.score >= passingScore)
    
    return (
      <div className="quiz-result-container">
        <div className="result-card">
          <div className={`result-icon ${passed ? 'passed' : 'failed'}`}>
            {passed ? '🎉' : '📚'}
          </div>
          <h1 className="result-title">
            {passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
          </h1>
          
          <div className="result-score">
            <div className="score-label">Your Score</div>
            <div className="score-value">{result.score ?? 0}%</div>
            <div className="score-max">Passing Score: {passingScore}%</div>
          </div>
          
          {passed ? (
            <div className="result-message success">
              <p>🎉 Congratulations! You've passed the quiz.</p>
              <p>The next lesson is now unlocked!</p>
            </div>
          ) : (
            <div className="result-message error">
              <p>⚠️ You didn't reach the passing score.</p>
              <p>Review the lesson material and try again.</p>
            </div>
          )}
          
          <div className="result-actions">
            {!passed && (
              <button 
                onClick={() => { setResult(null); setAnswers({}) }} 
                className="retake-btn"
              >
                Retake Quiz
              </button>
            )}
            <button onClick={() => nav('/levels')} className="continue-btn">
              Back to Levels →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1 className="quiz-title">{quiz?.title || 'Quiz'}</h1>
        {quiz?.description && <p className="quiz-description">{quiz.description}</p>}
        <div className="quiz-info">
          <span className="quiz-questions">📝 {questions.length} Questions</span>
          <span className="quiz-passing">🎯 Passing Score: {passingScore}%</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="quiz-form">
        {questions.map((q, idx) => (
          <div key={q.id} className="question-card">
            <div className="question-header">
              <span className="question-number">Question {idx + 1}</span>
              <span className="question-points">{q.points || 1} point{q.points !== 1 ? 's' : ''}</span>
            </div>
            <div className="question-text">{q.question_text || q.text}</div>
            <div className="options-list">
              {(q.options || []).map((o) => (
                <label 
                  key={o.id} 
                  className={`option-label ${answers[q.id] === o.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={o.id}
                    checked={answers[q.id] === o.id}
                    onChange={() => setAnswers({ ...answers, [q.id]: o.id })}
                    className="option-radio"
                  />
                  <span className="option-text">{o.option_text || o.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        
        <div className="quiz-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => nav(-1)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={submitting || Object.keys(answers).length !== questions.length}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz →'}
          </button>
        </div>
        
        {Object.keys(answers).length !== questions.length && (
          <p className="warning-message">
            ⚠️ You've answered {Object.keys(answers).length} out of {questions.length} questions
          </p>
        )}
      </form>
    </div>
  )
}