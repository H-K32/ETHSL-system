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

  // Course progress data based on user level
  const getCourseProgress = () => {
    const userLevel = progress.current_level || 'beginner'
    
    if (userLevel === 'beginner') {
      return [
        { name: 'Level 1: Beginner', progress: 65, lessons: 10, completed: 8, score: 78 },
        { name: 'Level 2: Intermediate', progress: 0, lessons: 12, completed: 0, score: 0 },
        { name: 'Level 3: Advanced', progress: 0, lessons: 15, completed: 0, score: 0 },
      ]
    } else if (userLevel === 'intermediate') {
      return [
        { name: 'Level 1: Beginner', progress: 100, lessons: 10, completed: 10, score: 92 },
        { name: 'Level 2: Intermediate', progress: 65, lessons: 12, completed: 8, score: 78 },
        { name: 'Level 3: Advanced', progress: 0, lessons: 15, completed: 0, score: 0 },
      ]
    } else {
      return [
        { name: 'Level 1: Beginner', progress: 100, lessons: 10, completed: 10, score: 92 },
        { name: 'Level 2: Intermediate', progress: 100, lessons: 12, completed: 12, score: 88 },
        { name: 'Level 3: Advanced', progress: 45, lessons: 15, completed: 7, score: 75 },
      ]
    }
  }

  const courseProgress = getCourseProgress()

  const achievements = [
    { 
      name: 'First Blood', 
      description: 'Complete your first lesson', 
      earned: progress.completed_lessons >= 1, 
      icon: '🎯' 
    },
    { 
      name: 'Fast Learner', 
      description: 'Complete 5 lessons', 
      earned: progress.completed_lessons >= 5, 
      icon: '⚡' 
    },
    { 
      name: 'Quiz Starter', 
      description: 'Take your first quiz', 
      earned: progress.total_quiz_attempts >= 1, 
      icon: '📝' 
    },
    { 
      name: 'Quiz Master', 
      description: 'Pass 3 quizzes', 
      earned: progress.quizzes_passed >= 3, 
      icon: '🏆' 
    },
    { 
      name: 'Streak Master', 
      description: 'Maintain a 7-day learning streak', 
      earned: progress.streak_count >= 7, 
      icon: '🔥' 
    },
    { 
      name: 'Level Up!', 
      description: 'Advance to the next level', 
      earned: progress.current_level !== 'beginner', 
      icon: '⭐' 
    },
  ]

  const weeklyActivity = [
    { day: 'Mon', completed: Math.floor(Math.random() * 3), total: 3 },
    { day: 'Tue', completed: Math.floor(Math.random() * 3), total: 3 },
    { day: 'Wed', completed: Math.floor(Math.random() * 3), total: 3 },
    { day: 'Thu', completed: Math.floor(Math.random() * 3), total: 3 },
    { day: 'Fri', completed: Math.floor(Math.random() * 3), total: 3 },
    { day: 'Sat', completed: Math.floor(Math.random() * 2), total: 2 },
    { day: 'Sun', completed: Math.floor(Math.random() * 2), total: 2 },
  ]

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the correct endpoint from your urls.py
      const response = await api.get('/profile/dashboard/')
      
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
      
      // Use user data from auth context as fallback
      if (user) {
        const userLevel = user?.level || 'beginner'
        const userStreak = user?.streak_count || 0
        
        // Estimate progress based on user level
        let completedLessons = 0
        let quizzesPassed = 0
        let totalAttempts = 0
        
        if (userLevel === 'beginner') {
          completedLessons = 8
          quizzesPassed = 2
          totalAttempts = 3
        } else if (userLevel === 'intermediate') {
          completedLessons = 18
          quizzesPassed = 5
          totalAttempts = 7
        } else if (userLevel === 'advanced') {
          completedLessons = 25
          quizzesPassed = 8
          totalAttempts = 12
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

  const totalLessons = courseProgress.reduce((acc, c) => acc + c.completed, 0)
  const avgScore = courseProgress.filter(c => c.score > 0).reduce((acc, c, _, arr) => acc + c.score / arr.length, 0)
  
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

  if (error && !user) {
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
            <p className="stat-card-value">{courseProgress.filter(c => c.progress === 100).length}/{courseProgress.length}</p>
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
            <p className="stat-card-value">{Math.round(avgScore)}%</p>
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
          <div className="course-list">
            {courseProgress.map((course, index) => (
              <div key={index} className="course-item">
                <div className="course-info">
                  <div className="course-name">{course.name}</div>
                  <div className="course-stats">
                    <span>{course.completed}/{course.lessons} lessons</span>
                    <span>Score: {course.score}%</span>
                  </div>
                </div>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <span className="progress-percent">{course.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="progress-card">
          <div className="card-header">
            <h3>Weekly Activity</h3>
            <span className="week-info">This week</span>
          </div>
          <div className="activity-chart">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="chart-bar">
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ height: `${(day.completed / day.total) * 100}%` }}
                  ></div>
                </div>
                <span className="bar-label">{day.day}</span>
                <span className="bar-value">{day.completed}/{day.total}</span>
              </div>
            ))}
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
          <span className="achievements-count">{achievements.filter(a => a.earned).length}/{achievements.length} Unlocked</span>
        </div>
        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <div key={index} className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-info">
                <p className="achievement-name">{achievement.name}</p>
                <p className="achievement-desc">{achievement.description}</p>
              </div>
              {achievement.earned ? (
                <span className="achievement-badge-earned">✓ Earned</span>
              ) : (
                <span className="achievement-badge-locked">🔒 Locked</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="recommendation-card">
        <div className="recommendation-icon">🎯</div>
        <div className="recommendation-content">
          <h4>Ready for the next level?</h4>
          <p>You're making great progress! Based on your performance, keep going to unlock advanced content.</p>
        </div>
        <Link to="/levels" className="recommendation-btn">Continue Learning →</Link>
      </div>
    </div>
  )
}