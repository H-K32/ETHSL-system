// src/pages/CompleteProfile.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api/client.js'  // Make sure this path is correct
import '../styles/complete-profile.css'

export default function CompleteProfile() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    full_name: '',
    level: 'beginner',
    avatar: null
  })
  const [avatarPreview, setAvatarPreview] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Avatar image must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }
      setForm(prev => ({ ...prev, avatar: file }))
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.full_name) {
      setError('Please enter your full name')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        setError('No authentication token found. Please login again.')
        setLoading(false)
        return
      }

      // Create FormData for avatar upload
      const formData = new FormData()
      
      // Split full_name into first_name and last_name for your backend
      const nameParts = form.full_name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || ''
      
      formData.append('first_name', firstName)
      formData.append('last_name', lastName)
      formData.append('level', form.level)
      
      if (form.avatar) {
        formData.append('avatar', form.avatar)
      }

      console.log('Sending to backend:', {
        url: '/users/profile/',
        first_name: firstName,
        last_name: lastName,
        level: form.level,
        has_avatar: !!form.avatar
      })

      // CORRECT: Use '/users/profile/' not '/api/users/profile/'
      // The baseURL already includes '/api'
      const response = await api.patch('/users/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      console.log('Profile update response:', response.data)

      // Update user context with new data
      if (login && response.data) {
        login(response.data)
      }

      // Redirect based on level
      if (form.level === 'beginner') {
        navigate('/login', { replace: true })
      } else {
        navigate('/placement', { replace: true })
      }
    } catch (err) {
      console.error('Error details:', err)
      console.error('Response data:', err.response?.data)
      console.error('Response status:', err.response?.status)
      console.error('Request URL:', err.config?.url)
      
      if (err.response?.data) {
        const errorData = err.response.data
        if (typeof errorData === 'object') {
          const messages = Object.values(errorData).flat().join(', ')
          setError(messages || 'Failed to update profile. Please try again.')
        } else {
          setError(errorData.detail || errorData.message || 'Failed to update profile. Please try again.')
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.')
      } else {
        setError(`Error: ${err.message || 'An unexpected error occurred'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cp-stage">
      <div className="cp-blob cp-blob--a"></div>
      <div className="cp-blob cp-blob--b"></div>
      <div className="cp-blob cp-blob--c"></div>
      <div className="cp-grid"></div>

      <div className="cp-card">
        <div className="cp-tag">
          <span className="cp-dot"></span>
          <span>Complete Profile</span>
        </div>

        <h1 className="cp-title">
          Tell us<br />
          <span className="cp-period">about yourself</span>
        </h1>
        <p className="cp-sub">Help us personalize your learning experience</p>

        {error && <div className="cp-error">{error}</div>}

        <form onSubmit={onSubmit} className="cp-form">
          {/* Avatar Upload */}
          <div className="cp-avatar-section">
            <div className="cp-avatar-preview">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" />
              ) : (
                <div className="cp-avatar-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </div>
            <label className="cp-avatar-btn">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              Choose Avatar
            </label>
          </div>

          {/* Full Name */}
          <div className="cp-field">
            <input
              type="text"
              id="full_name"
              name="full_name"
              className="cp-input"
              value={form.full_name}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="full_name">Full Name</label>
          </div>

          {/* Level */}
          <div className="cp-field">
            <select
              id="level"
              name="level"
              className="cp-select"
              value={form.level}
              onChange={handleChange}
              required
            >
              <option value="beginner">Beginner (ጀማሪ)</option>
              <option value="intermediate">Intermediate (መካከለኛ)</option>
              <option value="advanced">Advanced (ከፍተኛ)</option>
            </select>
            <label htmlFor="level">Your Level</label>
          </div>

          <button type="submit" disabled={loading} className="cp-btn">
            {loading ? 'Saving...' : 'Continue'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>

        <p className="cp-foot">
          You can update this later in your <span className="cp-highlight">profile settings</span>
        </p>
      </div>
    </div>
  )
}