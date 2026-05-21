import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'
import '../styles/dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()

  const stats = [
    { label: 'Courses Enrolled', value: '3', icon: '📚', color: '#4f46e5' },
    { label: 'Lessons Completed', value: '12', icon: '✅', color: '#10b981' },
    { label: 'Quiz Score', value: '85%', icon: '📊', color: '#f59e0b' },
    { label: 'Current Streak', value: '7', icon: '🔥', color: '#ef4444' },
  ]

  const recentActivities = [
    { title: 'Completed Level 1', date: '2 hours ago', type: 'lesson' },
    { title: 'Scored 90% on Quiz', date: 'Yesterday', type: 'quiz' },
    { title: 'Started Level 2', date: '3 days ago', type: 'course' },
  ]

  const recommendedLevels = [
    { name: 'Level 2: Intermediate', progress: 60, description: 'Keep going! You\'re doing great.' },
    { name: 'Level 3: Advanced', progress: 20, description: 'Next milestone to unlock.' },
  ]

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-text">
          <h1 className="welcome-title">
            Welcome back, <span className="gradient-name">{user?.username || 'Learner'}!</span>
          </h1>
          <p className="welcome-subtitle">Continue your learning journey. You're making great progress!</p>
        </div>
        <div className="welcome-emoji">🌟</div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}15` }}>
              <span>{stat.icon}</span>
            </div>
            <div className="stat-info">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <Link to="/progress" className="view-all">View All →</Link>
          </div>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p className="activity-title">{activity.title}</p>
                  <p className="activity-date">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Levels */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recommended for You</h3>
            <Link to="/levels" className="view-all">View All →</Link>
          </div>
          <div className="recommended-list">
            {recommendedLevels.map((level, index) => (
              <div key={index} className="recommended-item">
                <div className="recommended-info">
                  <p className="recommended-title">{level.name}</p>
                  <p className="recommended-desc">{level.description}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${level.progress}%` }}></div>
                  </div>
                  <p className="progress-text">{level.progress}% Complete</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="quick-title">Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/levels" className="action-btn">
            <span>📖</span>
            <span>Continue Learning</span>
          </Link>
          <Link to="/progress" className="action-btn">
            <span>📈</span>
            <span>View Progress</span>
          </Link>
          <Link to="/community" className="action-btn">
            <span>💬</span>
            <span>Join Discussion</span>
          </Link>
        </div>
      </div>
    </div>
  )
}