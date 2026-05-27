import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/client.js'
import '../styles/notifications.css'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reports, setReports] = useState([])
  const [activeTab, setActiveTab] = useState('warnings')

  useEffect(() => {
    fetchWarnings()
    fetchReports()
  }, [])

  const fetchWarnings = async () => {
    try {
      const response = await api.get('/users/profile/')
      const userData = response.data
      
      const warningNotifications = []
      
      if (userData.warning_message && userData.warning_message !== "") {
        warningNotifications.push({
          id: 'warning-1',
          type: 'warning',
          title: 'Admin Warning',
          message: userData.warning_message,
          date: new Date().toISOString(),
          is_read: false
        })
      }
      
      setNotifications(warningNotifications)
    } catch (err) {
      console.error('Error fetching warnings:', err)
      setError('Failed to load warnings')
    }
  }

  const fetchReports = async () => {
    try {
      // Since there's no GET endpoint for reports, 
      // we'll check if the user has been reported by checking 
      // if they appear in any reports (this would require backend changes)
      
      // For now, we'll show a message that this feature needs backend implementation
      console.log('Note: To fetch reports, backend endpoint GET /community/reports/ is needed')
      
      // Option 1: If you have admin access, you could fetch all reports
      // and filter on frontend (only works if user is admin)
      if (user?.role === 'admin') {
        try {
          // This would require an admin endpoint - doesn't exist yet
          console.log('Admin role detected but no admin reports endpoint available')
        } catch (err) {
          console.log('No admin reports endpoint')
        }
      }
      
      // For now, set empty array
      setReports([])
    } catch (err) {
      console.error('Error fetching reports:', err)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="notifications-error">
        <p>{error}</p>
        <button onClick={fetchWarnings} className="retry-btn">Try Again</button>
      </div>
    )
  }

  return (
    <div className="notifications-container">
      {/* Header */}
      <div className="notifications-header">
        <div>
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">Stay updated with warnings</p>
        </div>
        <div className="notifications-stats">
          <span className="stats-badge">
            {notifications.filter(n => !n.is_read).length} Unread
          </span>
        </div>
      </div>

      {/* Tabs - Only show warnings tab since reports endpoint doesn't exist */}
      <div className="notifications-tabs">
        <button 
          className={`tab-btn ${activeTab === 'warnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('warnings')}
        >
          <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Warnings
        </button>
      </div>

      {/* Warnings Tab Content - No dismiss button */}
      {activeTab === 'warnings' && (
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>No Warnings</h3>
              <p>You have no warnings. Keep up the good work!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="notification-card warning">
                <div className="notification-icon">
                  <span>⚠️</span>
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-date">{formatDate(notification.date)}</span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-warning">
                    <small>⚠️ This is an official warning from an admin. Please review our community guidelines.</small>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="info-section">
        <div className="info-card">
          <div className="info-icon">📋</div>
          <div className="info-content">
            <h4>Community Guidelines</h4>
            <p>Be respectful, help others, and follow our community rules to maintain a positive learning environment.</p>
          </div>
        </div>
        <div className="info-card">
          <div className="info-icon">🤝</div>
          <div className="info-content">
            <h4>Need Help?</h4>
            <p>If you have questions about a warning, please contact an admin.</p>
          </div>
        </div>
      </div>
    </div>
  )
}