import { useState, useEffect } from 'react'
import api from '../api/client.js'
import '../styles/notifications.css'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Notifications() {
  const { t } = useLanguage()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reports, setReports] = useState([])
  const [activeTab, setActiveTab] = useState('warnings')

  useEffect(() => {
    fetchNotifications()
    fetchReports()
  }, [])

  const isWarningExpired = (dateString) => {
    const warningDate = new Date(dateString)
    const now = new Date()
    return now - warningDate > 30 * 24 * 60 * 60 * 1000
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/profile/')
      const userData = response.data
      const warningNotifications = []
      if (userData.warning_message) {
        warningNotifications.push({
          id: 1,
          type: 'warning',
          message: userData.warning_message,
          date: userData.warning_date || new Date().toISOString(),
        })
      }
      setNotifications(warningNotifications.filter(n => !isWarningExpired(n.date)))
    } catch (err) {
      setError(t('failedNotifications'))
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await api.get('/community/reports-against-me/')
      setReports(response.data || [])
    } catch {
      setReports([])
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return t('justNow')
    if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`
    if (diffDays < 7) return `${diffDays} ${t('daysAgo')}`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="loading-spinner"></div>
        <p>{t('loadingNotifications')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="notifications-error">
        <p>{error}</p>
        <button onClick={fetchNotifications} className="retry-btn">{t('retry')}</button>
      </div>
    )
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div>
          <h1 className="notifications-title">{t('notifications_title')}</h1>
          <p className="notifications-subtitle">{t('notificationsSubtitle')}</p>
        </div>
      </div>

      <div className="notifications-tabs">
        <button className={`tab-btn ${activeTab === 'warnings' ? 'active' : ''}`} onClick={() => setActiveTab('warnings')}>
          <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {t('warningsTab')}
        </button>
        <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('reportsTab')}
        </button>
      </div>

      {activeTab === 'warnings' && (
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>{t('noWarningsTitle')}</h3>
              <p>{t('noWarningsText')}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="notification-card warning">
                <div className="notification-icon"><span>⚠️</span></div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{t('adminWarning')}</h3>
                    <span className="notification-date">{formatDate(notification.date)}</span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <p className="notification-note">{t('warningDisappears')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="notifications-list">
          {reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛡️</div>
              <h3>{t('noReportsTitle')}</h3>
              <p>{t('noReportsText')}</p>
            </div>
          ) : (
            reports.map((report, index) => (
              <div key={report.id || index} className="notification-card report">
                <div className="notification-icon"><span>📢</span></div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{t('reportFiled')}</h3>
                    {report.created_at && <span className="notification-date">{formatDate(report.created_at)}</span>}
                  </div>
                  <p className="notification-message">
                    <strong>{t('reason')}:</strong> {report.reason}
                  </p>
                  <div className="notification-warning">
                    <small>{t('communityGuidelinesText')}</small>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="info-section">
        <div className="info-card">
          <div className="info-icon">📋</div>
          <div className="info-content">
            <h4>{t('communityGuidelines')}</h4>
            <p>{t('communityGuidelinesText')}</p>
          </div>
        </div>
        <div className="info-card">
          <div className="info-icon">🤝</div>
          <div className="info-content">
            <h4>{t('needHelp')}</h4>
            <p>{t('needHelpText')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
