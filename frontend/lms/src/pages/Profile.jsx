import { useState } from 'react'
import useAsync from '../utils/useAsync.js'
import { getProfile } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/client.js'
import '../styles/profile.css'

export default function Profile() {
  const { user, logout, refreshUser } = useAuth()
  const { data, loading, error, reload } = useAsync(getProfile, [])
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [avatarPreview, setAvatarPreview] = useState(null)

  if (loading) return (
    <div className="profile-loading">
      <div className="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>
  )
  
  if (error) return (
    <div className="profile-container">
      <div className="profile-error">
        <p>{error?.message || 'Failed to load profile'}</p>
        <button onClick={reload} className="retry-btn">Try Again</button>
      </div>
    </div>
  )

  const p = data || user || {}
  const stats = p.stats || {
    completed_lessons: p.completed_lessons || 0,
    quiz_average: p.quiz_average || null,
    current_level: p.current_level?.name || p.level?.name || 'Beginner',
  }
  const courses = p.course_progress || p.courses || []

  // Handle edit form - NOTE: username is NOT included (read-only in backend)
  const handleEditClick = () => {
    setFormData({
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      email: p.email || ''
    })
    setIsEditing(true)
    setMessage({ type: '', text: '' })
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  // Update profile - using full_name from backend
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    
    try {
      // Backend expects full_name field
      const fullName = `${formData.first_name} ${formData.last_name}`.trim()
      
      const updateData = {
        email: formData.email,
        full_name: fullName
      }
      
      const response = await api.patch('/users/profile/', updateData)
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
      await refreshUser()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      console.error('Update error:', err)
      
      let errorText = 'Failed to update profile'
      if (err.response?.data?.email) {
        errorText = err.response.data.email[0]
      } else if (err.response?.data?.detail) {
        errorText = err.response.data.detail
      }
      
      setMessage({ type: 'error', text: errorText })
    }
  }

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    
    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }
    
    setMessage({ type: '', text: '' })
    
    try {
      await api.post('/users/change-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      setIsChangingPassword(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to change password' 
      })
    }
  }

  // Upload avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' })
      return
    }
    
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' })
      return
    }
    
    setIsUploading(true)
    setMessage({ type: '', text: '' })
    
    const formData = new FormData()
    formData.append('avatar_upload', file)
    
    try {
      const response = await api.patch('/users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setAvatarPreview(URL.createObjectURL(file))
      setMessage({ type: 'success', text: 'Avatar updated successfully!' })
      await refreshUser()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to upload avatar' 
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview
    if (p.avatar) return p.avatar
    return null
  }

  return (
    <div className="profile-container">
      {/* Message Toast */}
      {message.text && (
        <div className={`message-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="avatar-section">
          <div className="profile-avatar-wrapper">
            {getAvatarUrl() ? (
              <img src={getAvatarUrl()} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar">
                {(p.full_name || p.username || 'U').slice(0, 1).toUpperCase()}
              </div>
            )}
            <label className="avatar-upload-label">
              <span>{isUploading ? '⏳' : '📷'}</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
        
        <div className="profile-info">
          <h1 className="profile-name">{p.full_name || p.username}</h1>
          <p className="profile-email">{p.email}</p>
          <p className="profile-username">@{p.username}</p>
          <div className="profile-actions">
            <button onClick={handleEditClick} className="edit-btn">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
            <button onClick={() => setIsChangingPassword(true)} className="password-btn">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Change Password
            </button>
            <button onClick={logout} className="logout-button">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Completed Lessons</div>
          <div className="stat-value">{stats.completed_lessons ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Quiz Average</div>
          <div className="stat-value">
            {stats.quiz_average != null ? `${Math.round(stats.quiz_average)}%` : '—'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Level</div>
          <div className="stat-value">{stats.current_level || '—'}</div>
        </div>
      </div>

      {/* Edit Profile Modal - NO username field */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={() => setIsEditing(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="First name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="info-note">
                <small>⚠️ Username cannot be changed</small>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="modal-overlay" onClick={() => setIsChangingPassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="modal-close" onClick={() => setIsChangingPassword(false)}>×</button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsChangingPassword(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Progress Section */}
      <div className="section-title">Course Progress</div>
      {courses.length === 0 ? (
        <div className="empty-state">
          <p>No course progress yet. Start learning to see your progress!</p>
        </div>
      ) : (
        <div className="course-list">
          {courses.map((c) => (
            <div key={c.id || c.course?.id} className="course-progress-card">
              <div className="course-header">
                <span className="course-title">{c.title || c.course?.title}</span>
                <span className="course-lesson-count">
                  {c.completed_lessons ?? 0}/{c.total_lessons ?? '?'} lessons
                </span>
              </div>
              <div className="course-progress-bar">
                <ProgressBar value={c.progress ?? 0} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}