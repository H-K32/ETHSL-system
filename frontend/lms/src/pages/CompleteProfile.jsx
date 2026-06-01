import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/client.js'
import '../styles/complete-profile.css'

export default function CompleteProfile() {
  const { refresh } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showMessage, setShowMessage] = useState(false)
  const [placementRequired, setPlacementRequired] = useState(false)

  const [form, setForm] = useState({
    level: 'beginner',
    country: '',
    bio: '',
    learning_goal: '',
    learning_style: '',
    daily_study_time: '',
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
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar must be under 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files allowed')
      return
    }

    setForm(prev => ({ ...prev, avatar: file }))
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSkip = () => {
    // Skip only populates the level (required) and clears optional fields
    handleSubmit(true)
  }

  const handleSubmit = async (isSkipping = false) => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()

      // Level is always required
      formData.append('level', form.level)

      // Optional fields - only add if not skipping or if they have values
      if (!isSkipping) {
        if (form.country) formData.append('country', form.country)
        if (form.bio) formData.append('bio', form.bio)
        if (form.learning_goal) formData.append('learning_goal', form.learning_goal)
        if (form.learning_style) formData.append('learning_style', form.learning_style)
        if (form.daily_study_time) formData.append('daily_study_time', form.daily_study_time)
      }

      if (form.avatar) {
        formData.append('avatar', form.avatar)
      }

      // Use correct endpoint: POST to /users/complete-profile/
      const response = await api.post('/users/complete-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Refresh user profile in auth state after updating profile
      await refresh()

      const needsPlacement = response.data?.placement_required
      setPlacementRequired(needsPlacement)
      setShowMessage(true)

    } catch (err) {
      const data = err?.response?.data

      setError(
        typeof data === 'object'
          ? Object.values(data).flat().join(', ')
          : data?.detail || 'Failed to update profile'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (placementRequired) {
      navigate('/placement', { replace: true, state: { level: form.level } })
    } else {
      navigate('/levels', { replace: true })
    }
  }

  // Show message screen after submission
  if (showMessage) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Profile Complete! 🎉</h1>
        
        {placementRequired ? (
          <div className="mt-6 space-y-4">
            <p className="text-slate-600 text-lg">
              You've selected <span className="font-semibold capitalize">{form.level}</span> level.
            </p>
            <p className="text-slate-600">
              You must take a placement test to continue and find your starting point.
            </p>
            <button
              onClick={handleContinue}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 mt-6"
            >
              Proceed to Placement Test
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-slate-600 text-lg">
              Welcome to the <span className="font-semibold capitalize">{form.level}</span> level!
            </p>
            <p className="text-slate-600">
              You're all set and ready to start learning.
            </p>
            <button
              onClick={handleContinue}
              className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 mt-6"
            >
              Proceed to Learner Dashboard
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="cp-stage">
      <div className="cp-card">

        <h1 className="cp-title">Complete Your Profile</h1>
        <p className="cp-sub">
          Help us personalize your learning experience
        </p>

        {error && <div className="cp-error">{error}</div>}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false) }} className="cp-form">

          {/* AVATAR */}
          <div className="cp-avatar-section">
            <div className="cp-avatar-preview">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" />
              ) : (
                <div className="cp-avatar-placeholder">📷</div>
              )}
            </div>

            <label className="cp-avatar-btn">
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              Choose Avatar
            </label>
          </div>

          {/* LEVEL - REQUIRED */}
          <div className="cp-field cp-field-required">
            <label className="cp-label">
              Learning Level <span className="text-red-500">*</span>
            </label>
            <select 
              name="level" 
              value={form.level} 
              onChange={handleChange}
              className="cp-select"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <p className="cp-field-hint">Required - cannot be skipped</p>
          </div>

          {/* COUNTRY */}
          <div className="cp-field">
            <label className="cp-label">Country</label>
            <input
              name="country"
              placeholder="e.g. Ethiopia"
              value={form.country}
              onChange={handleChange}
              className="cp-input"
            />
          </div>

          {/* BIO */}
          <div className="cp-field">
            <label className="cp-label">Bio</label>
            <textarea
              name="bio"
              placeholder="Tell us about yourself"
              value={form.bio}
              onChange={handleChange}
              className="cp-textarea"
              rows="3"
            />
          </div>

          {/* LEARNING GOAL */}
          <div className="cp-field">
            <label className="cp-label">Learning Goal</label>
            <input
              name="learning_goal"
              placeholder="e.g. speak fluently, improve pronunciation"
              value={form.learning_goal}
              onChange={handleChange}
              className="cp-input"
            />
          </div>

          {/* LEARNING STYLE */}
          <div className="cp-field">
            <label className="cp-label">Preferred Learning Style</label>
            <select
              name="learning_style"
              value={form.learning_style}
              onChange={handleChange}
              className="cp-select"
            >
              <option value="">Select a style</option>
              <option value="visual">Visual (videos, images)</option>
              <option value="audio">Audio (listening)</option>
              <option value="reading">Reading & Writing</option>
              <option value="practice">Practice-based (interaction)</option>
            </select>
          </div>

          {/* DAILY TIME */}
          <div className="cp-field">
            <label className="cp-label">Daily Study Time</label>
            <select
              name="daily_study_time"
              value={form.daily_study_time}
              onChange={handleChange}
              className="cp-select"
            >
              <option value="">Select duration</option>
              <option value="15min">15 minutes</option>
              <option value="30min">30 minutes</option>
              <option value="1hr">1 hour</option>
              <option value="2hr+">2+ hours</option>
            </select>
          </div>

          {/* ACTION BUTTONS */}
          <div className="cp-actions">
            <button 
              type="submit" 
              disabled={loading} 
              className="cp-btn cp-btn-primary"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>

            <button 
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="cp-btn cp-btn-secondary"
            >
              Skip Optional Fields
            </button>
          </div>

        </form>

        <p className="cp-footer-hint">
          Your learning level is required and cannot be skipped.
        </p>
      </div>
    </div>
  )
}