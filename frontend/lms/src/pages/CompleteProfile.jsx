// src/pages/CompleteProfile.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/client.js'
import '../styles/complete-profile.css'

export default function CompleteProfile() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    level: 'beginner',
    country: '',
    timezone: '',
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

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()

      formData.append('level', form.level)
      formData.append('country', form.country)
      formData.append('timezone', form.timezone)
      formData.append('bio', form.bio)
      formData.append('learning_goal', form.learning_goal)
      formData.append('learning_style', form.learning_style)
      formData.append('daily_study_time', form.daily_study_time)

      if (form.avatar) {
        formData.append('avatar', form.avatar)
      }

      const response = await api.patch('/users/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data) {
        login(response.data)
      }

      // KEEP YOUR FLOW
      navigate('/placement', { replace: true })

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

  return (
    <div className="cp-stage">
      <div className="cp-card">

        <h1 className="cp-title">Complete Your Profile</h1>
        <p className="cp-sub">
          Help us personalize your learning experience
        </p>

        {error && <div className="cp-error">{error}</div>}

        <form onSubmit={onSubmit} className="cp-form">

          {/* AVATAR */}
          <div className="cp-avatar-section">
            <div className="cp-avatar-preview">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" />
              ) : (
                <div className="cp-avatar-placeholder">Upload</div>
              )}
            </div>

            <label className="cp-avatar-btn">
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              Choose Avatar
            </label>
          </div>

          {/* LEVEL */}
          <div className="cp-field">
            <select name="level" value={form.level} onChange={handleChange}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* COUNTRY */}
          <div className="cp-field">
            <input
              name="country"
              placeholder="Country (e.g. Ethiopia)"
              value={form.country}
              onChange={handleChange}
            />
          </div>

          {/* TIMEZONE */}
          <div className="cp-field">
            <input
              name="timezone"
              placeholder="Timezone (e.g. GMT+3)"
              value={form.timezone}
              onChange={handleChange}
            />
          </div>

          {/* BIO */}
          <div className="cp-field">
            <textarea
              name="bio"
              placeholder="Tell us about yourself"
              value={form.bio}
              onChange={handleChange}
            />
          </div>

          {/* LEARNING GOAL */}
          <div className="cp-field">
            <input
              name="learning_goal"
              placeholder="Your goal (e.g. speak fluently)"
              value={form.learning_goal}
              onChange={handleChange}
            />
          </div>

          {/* LEARNING STYLE */}
          <div className="cp-field">
            <select
              name="learning_style"
              value={form.learning_style}
              onChange={handleChange}
            >
              <option value="">Learning style</option>
              <option value="visual">Visual</option>
              <option value="audio">Audio</option>
              <option value="reading">Reading</option>
              <option value="practice">Practice-based</option>
            </select>
          </div>

          {/* DAILY TIME */}
          <div className="cp-field">
            <select
              name="daily_study_time"
              value={form.daily_study_time}
              onChange={handleChange}
            >
              <option value="">Daily study time</option>
              <option value="15min">15 min</option>
              <option value="30min">30 min</option>
              <option value="1hr">1 hour</option>
              <option value="2hr+">2+ hours</option>
            </select>
          </div>

          {/* SUBMIT */}
          <button type="submit" disabled={loading} className="cp-btn">
            {loading ? 'Saving...' : 'Continue'}
          </button>

        </form>
      </div>
    </div>
  )
}