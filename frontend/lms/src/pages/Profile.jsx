// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/client.js'
import '../styles/profile.css'

export default function Profile() {
  const { user, login, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    avatar: null
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [refreshingUser, setRefreshingUser] = useState(false)

  // Fetch fresh user data from backend
  const fetchFreshUserData = async () => {
    try {
      setRefreshingUser(true)
      const response = await api.get('/users/profile/')
      console.log('Fetched user data:', response.data)
      if (login && response.data) {
        login(response.data)
      }
      return response.data
    } catch (err) {
      console.error('Error fetching fresh user data:', err)
      return null
    } finally {
      setRefreshingUser(false)
    }
  }

  useEffect(() => {
    if (user) {
      console.log('Current user data:', user)
      setForm({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        avatar: null
      })
    }
    fetchCourseProgress()
    fetchFreshUserData()
  }, [user?.id])

  const fetchCourseProgress = async () => {
    try {
      const response = await api.get('/progress/courses/')
      setCourses(response.data)
    } catch (err) {
      console.error('Error fetching course progress:', err)
    } finally {
      setCoursesLoading(false)
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showMessage('Avatar image must be less than 5MB', 'error')
        return
      }
      if (!file.type.startsWith('image/')) {
        showMessage('Please upload an image file', 'error')
        return
      }
      setForm(prev => ({ ...prev, avatar: file }))
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    
    console.log('Submitting form data:', {
      username: form.username,
      first_name: form.first_name,
      last_name: form.last_name,
      has_avatar: !!form.avatar
    })

    setLoading(true)

    try {
      // Use FormData for all requests to handle avatar properly
      const formData = new FormData()
      formData.append('username', form.username)
      formData.append('first_name', form.first_name)
      formData.append('last_name', form.last_name)
      
      if (form.avatar) {
        formData.append('avatar', form.avatar)
      }

      // Send as PATCH request with FormData
      const response = await api.patch('/users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      console.log('Update response:', response.data)

      if (login && response.data) {
        login(response.data)
      }

      setAvatarPreview(null)
      showMessage('Profile updated successfully!', 'success')
      setShowEditModal(false)
      
      // Refresh user data
      await fetchFreshUserData()
      setForm(prev => ({ ...prev, avatar: null }))
      
    } catch (err) {
      console.error('Error updating profile:', err)
      console.error('Error response:', err.response)
      console.error('Error data:', err.response?.data)
      
      if (err.response?.data) {
        const errorData = err.response.data
        if (typeof errorData === 'object') {
          const errorMessages = []
          for (const [key, value] of Object.entries(errorData)) {
            errorMessages.push(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          }
          showMessage(errorMessages.join(' | '), 'error')
        } else if (errorData.detail) {
          showMessage(errorData.detail, 'error')
        } else {
          showMessage('Failed to update profile. Please try again.', 'error')
        }
      } else {
        showMessage('Network error. Please check your connection.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showMessage('New passwords do not match', 'error')
      return
    }

    if (passwordForm.new_password.length < 8) {
      showMessage('Password must be at least 8 characters', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/users/change-password/', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      })

      console.log('Password change response:', response.data)
      showMessage('Password changed successfully!', 'success')
      setShowPasswordModal(false)
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (err) {
      console.error('Error changing password:', err)
      showMessage(err.response?.data?.detail || 'Failed to change password', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    if (user?.first_name && user?.first_name.length > 0) {
      const firstInitial = user.first_name[0]?.toUpperCase() || ''
      const lastInitial = user.last_name?.[0]?.toUpperCase() || ''
      return `${firstInitial}${lastInitial}`.trim() || user?.email?.[0]?.toUpperCase() || 'U'
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  const getFullName = () => {
    const firstName = user?.first_name || ''
    const lastName = user?.last_name || ''
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }
    return user?.username || 'User'
  }

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview
    if (user?.avatar) {
      let avatarUrl = user.avatar
      if (avatarUrl.startsWith('http')) return avatarUrl
      if (avatarUrl.startsWith('/media/')) return `https://ethsl-system.onrender.com${avatarUrl}`
      if (avatarUrl.startsWith('media/')) return `https://ethsl-system.onrender.com/${avatarUrl}`
      if (!avatarUrl.startsWith('/')) return `https://ethsl-system.onrender.com/media/${avatarUrl}`
      return `https://ethsl-system.onrender.com${avatarUrl}`
    }
    return null
  }

  const getProgressPercentage = (course) => {
    if (!course.total_lessons || course.total_lessons === 0) return 0
    return Math.round((course.completed_lessons / course.total_lessons) * 100)
  }

  if (!user || refreshingUser) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>{refreshingUser ? 'Refreshing profile...' : 'Loading profile...'}</p>
      </div>
    )
  }

  return (
    <div className="profile-container">
      {/* Toast Message */}
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
              <img 
                src={getAvatarUrl()} 
                alt="Avatar" 
                className="profile-avatar-img"
                onError={(e) => {
                  console.error('Avatar failed to load:', getAvatarUrl())
                  e.target.style.display = 'none'
                  const parent = e.target.parentElement
                  if (parent) {
                    const initials = getInitials()
                    parent.innerHTML = `<div class="profile-avatar">${initials}</div>`
                  }
                }}
              />
            ) : (
              <div className="profile-avatar">
                {getInitials()}
              </div>
            )}
            <label className="avatar-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              📷
            </label>
          </div>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">
            {getFullName()}
          </h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-username">@{user.username}</p>
          
          <div className="profile-actions">
            <button className="edit-btn" onClick={() => setShowEditModal(true)}>
              ✏️ Edit Profile
            </button>
            <button className="password-btn" onClick={() => setShowPasswordModal(true)}>
              🔒 Change Password
            </button>
            <button className="logout-button" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Learning Streak</div>
          <div className="stat-value">{user.streak_count || 0} days</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Level</div>
          <div className="stat-value">
            {user.level === 'beginner' ? '🌟 Beginner' : 
             user.level === 'intermediate' ? '📚 Intermediate' : '🎯 Advanced'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Role</div>
          <div className="stat-value">{user.role || 'Learner'}</div>
        </div>
      </div>

      {/* Course Progress Section */}
      <div className="course-progress-wrapper">
        <h2 className="section-title">📖 Course Progress</h2>
        
        {coursesLoading ? (
          <div className="loading-spinner" style={{ margin: '2rem auto' }} />
        ) : courses.length > 0 ? (
          <div className="course-list">
            {courses.map((course) => (
              <div key={course.id} className="course-progress-card">
                <div className="course-header">
                  <span className="course-title">{course.title}</span>
                  <span className="course-lesson-count">
                    {course.completed_lessons} / {course.total_lessons} lessons
                  </span>
                </div>
                <div className="course-progress-bar">
                  <div style={{
                    height: '8px',
                    background: 'rgba(0, 102, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${getProgressPercentage(course)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #0066ff, #0044cc)',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No courses started yet. Begin your learning journey!</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  placeholder="Choose a unique username"
                />
              </div>

              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                  placeholder="Your first name"
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Your last name"
                />
              </div>

              <div className="form-group">
                <label>Change Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{
                    padding: '0.5rem',
                    border: '1.5px solid rgba(0, 102, 255, 0.2)',
                    borderRadius: '12px',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                />
                {avatarPreview && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={avatarPreview} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                    <small style={{ color: '#0066ff' }}>New avatar will be saved</small>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}