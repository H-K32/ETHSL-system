import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/client.js'
import '../styles/progress.css'

export default function Progress() {
  const { user } = useAuth()
  const [progress, setProgress] = useState({
    completed_lessons: 0,
    quizzes_passed: 0,
    total_quiz_attempts: 0,
    streak_count: 0,
    current_level: 'beginner',
    placement_passed: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // ✅ CORRECT ENDPOINT - matches your URL structure
      // Main urls.py: path('api/progress/', include('progress.urls'))
      // Progress urls.py: path("profile/dashboard/", UserProgressDashboardView.as_view())
      // Full URL: /api/progress/profile/dashboard/
      const response = await api.get('/progress/profile/dashboard/')
      
      // Get user level info from the authenticated user
      const userLevel = user?.level || 'beginner'
      const userStreak = user?.streak_count || 0
      const placementPassed = user?.placement_passed || false
      
      setProgress({
        completed_lessons: response.data.completed_lessons || 0,
        quizzes_passed: response.data.quizzes_passed || 0,
        total_quiz_attempts: response.data.total_quiz_attempts || 0,
        streak_count: userStreak,
        current_level: userLevel,
        placement_passed: placementPassed
      })
      
    } catch (err) {
      console.error('Error fetching progress:', err)
      
      // Fallback to user data from auth context
      if (user) {
        const userLevel = user?.level || 'beginner'
        const userStreak = user?.streak_count || 0
        
        let completedLessons = 0
        let quizzesPassed = 0
        let totalAttempts = 0
        
        if (userLevel === 'beginner') {
          completedLessons = 0
          quizzesPassed = 0
          totalAttempts = 0
        } else if (userLevel === 'intermediate') {
          completedLessons = 0
          quizzesPassed = 0
          totalAttempts = 0
        } else if (userLevel === 'advanced') {
          completedLessons = 0
          quizzesPassed = 0
          totalAttempts = 0
        }
        
        setProgress({
          completed_lessons: completedLessons,
          quizzes_passed: quizzesPassed,
          total_quiz_attempts: totalAttempts,
          streak_count: userStreak,
          current_level: userLevel,
          placement_passed: user?.placement_passed || false
        })
        setError(null)
      } else {
        setError('Unable to load progress data. Please make sure you are logged in.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getLevelDisplay = (level) => {
    const levels = {
      'beginner': 'Beginner (ጀማሪ)',
      'intermediate': 'Intermediate (መካከለኛ)',
      'advanced': 'Advanced (ከፍተኛ)'
    }
    return levels[level] || 'Beginner'
  }

  if (loading) {
    return (
      <div className="progress-loading">
        <div className="loading-spinner"></div>
        <p>Loading your progress...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="progress-error">
        <p>{error}</p>
        <button onClick={fetchProgress} className="retry-btn">Try Again</button>
      </div>
    )
  }

  return (
    <div className="progress-container">
      {/* Header */}
      <div className="progress-header">
        <div>
          <h1 className="progress-title">Your Learning Progress</h1>
          <p className="progress-subtitle">Track your journey and celebrate your achievements</p>
        </div>
        <div className="header-stats">
          <div className="mini-stat">
            <span className="mini-stat-value">{progress.completed_lessons}</span>
            <span className="mini-stat-label">Lessons Done</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-value">{progress.quizzes_passed}/{progress.total_quiz_attempts}</span>
            <span className="mini-stat-label">Quizzes Passed</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-value">{progress.streak_count}</span>
            <span className="mini-stat-label">Day Streak</span>
          </div>
        </div>
      </div>

      {/* Current Level Card */}
      <div className="current-level-card">
        <div className="level-icon">📊</div>
        <div className="level-info">
          <h3>Current Level</h3>
          <p className="level-name">{getLevelDisplay(progress.current_level)}</p>
          {!progress.placement_passed && progress.current_level !== 'beginner' && (
            <p className="level-warning">⚠️ Placement test required to unlock full content</p>
          )}
        </div>
        <Link to="/levels" className="level-action-btn">
          Continue Learning →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="progress-stats-grid">
        <div className="stat-card-large">
          <div className="stat-card-icon">📚</div>
          <div className="stat-card-info">
            <p className="stat-card-value">0/0</p>
            <p className="stat-card-label">Courses Completed</p>
          </div>
        </div>
        <div className="stat-card-large">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-info">
            <p className="stat-card-value">{progress.completed_lessons}</p>
            <p className="stat-card-label">Lessons Completed</p>
          </div>
        </div>
        <div className="stat-card-large">
          <div className="stat-card-icon">⭐</div>
          <div className="stat-card-info">
            <p className="stat-card-value">0%</p>
            <p className="stat-card-label">Average Score</p>
          </div>
        </div>
        <div className="stat-card-large">
          <div className="stat-card-icon">🏆</div>
          <div className="stat-card-info">
            <p className="stat-card-value">{progress.quizzes_passed}</p>
            <p className="stat-card-label">Quizzes Passed</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="progress-main-grid">
        {/* Course Progress */}
        <div className="progress-card">
          <div className="card-header">
            <h3>Course Progress</h3>
            <Link to="/levels" className="view-all">Continue Learning →</Link>
          </div>
          <div className="empty-state">
            <p>No courses started yet.</p>
            <Link to="/levels" className="start-learning-btn">Start Learning</Link>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="progress-card">
          <div className="card-header">
            <h3>Weekly Activity</h3>
            <span className="week-info">This week</span>
          </div>
          <div className="empty-state">
            <p>No activity this week.</p>
          </div>
        </div>
      </div>

      {/* Quiz Performance */}
      <div className="progress-card">
        <div className="card-header">
          <h3>Quiz Performance</h3>
          <Link to="/levels" className="view-all">Take More Quizzes →</Link>
        </div>
        <div className="quiz-stats">
          <div className="quiz-stat-item">
            <span className="quiz-stat-label">Total Attempts</span>
            <span className="quiz-stat-value">{progress.total_quiz_attempts}</span>
          </div>
          <div className="quiz-stat-item">
            <span className="quiz-stat-label">Passed</span>
            <span className="quiz-stat-value">{progress.quizzes_passed}</span>
          </div>
          <div className="quiz-stat-item">
            <span className="quiz-stat-label">Success Rate</span>
            <span className="quiz-stat-value">
              {progress.total_quiz_attempts > 0 
                ? Math.round((progress.quizzes_passed / progress.total_quiz_attempts) * 100)
                : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="achievements-section">
        <div className="card-header">
          <h3>Achievements</h3>
          <span className="achievements-count">0/0 Unlocked</span>
        </div>
        <div className="empty-state">
          <p>Complete lessons and quizzes to earn achievements!</p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="recommendation-card">
        <div className="recommendation-icon">🎯</div>
        <div className="recommendation-content">
          <h4>Ready to start learning?</h4>
          <p>Begin your learning journey by exploring our course levels!</p>
        </div>
        <Link to="/levels" className="recommendation-btn">Start Learning →</Link>
      </div>
    </div>
  )
}