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
  const [done, setDone] = useState(null) // { placementRequired, level }

  const [form, setForm] = useState({
    level: 'beginner',
    country: '',
    bio: '',
    learning_goal: '',
    learning_style: '',
    daily_study_time: '',
    avatar: null,
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
    if (file.size > 5 * 1024 * 1024) return setError('Avatar must be under 5MB')
    if (!file.type.startsWith('image/')) return setError('Only image files allowed')
    setForm(prev => ({ ...prev, avatar: file }))
    setAvatarPreview(URL.createObjectURL(file))
  }

  const submit = async (skipOptional = false) => {
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('level', form.level)
      if (!skipOptional) {
        if (form.country) fd.append('country', form.country)
        if (form.bio) fd.append('bio', form.bio)
        if (form.learning_goal) fd.append('learning_goal', form.learning_goal)
        if (form.learning_style) fd.append('learning_style', form.learning_style)
        if (form.daily_study_time) fd.append('daily_study_time', form.daily_study_time)
      }
      if (form.avatar) fd.append('avatar', form.avatar)

      const res = await api.post('/users/complete-profile/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await refresh()
      setDone({ placementRequired: res.data?.placement_required, level: form.level })
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
    if (done?.placementRequired) {
      navigate('/placement', { replace: true, state: { level: done.level } })
    } else {
      navigate('/levels', { replace: true })
    }
  }

  if (done) {
    return (
      <div className="cp-stage">
        <div className="cp-card cp-card--success">
          <div className="cp-success-icon">🎉</div>
          <h1 className="cp-title">Profile Complete!</h1>
          <p className="cp-sub">
            You've selected the{' '}
            <strong className="cp-level-badge">{done.level}</strong> level.
          </p>
          <p className="cp-sub cp-sub--muted">
            {done.placementRequired
              ? 'Take a short placement test to confirm your starting point.'
              : "You're all set and ready to start learning."}
          </p>
          <button onClick={handleContinue} className="cp-btn cp-btn--primary cp-btn--full">
            {done.placementRequired ? 'Start Placement Test' : 'Go to Dashboard'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cp-stage">
      <div className="cp-card">

        <div className="cp-header">
          <div className="cp-tag">
            <span className="cp-dot" />
            <span>setup</span>
          </div>
          <h1 className="cp-title">Complete Your Profile</h1>
          <p className="cp-sub">Personalize your learning experience</p>
        </div>

        {error && <div className="cp-error">{error}</div>}

        <form onSubmit={(e) => { e.preventDefault(); submit(false) }}>

          {/* AVATAR */}
          <div className="cp-avatar-row">
            <div className="cp-avatar-ring">
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="cp-avatar-img" />
                : <span className="cp-avatar-icon">👤</span>}
            </div>
            <label className="cp-avatar-btn">
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              {avatarPreview ? 'Change photo' : 'Upload photo'}
            </label>
          </div>

          {/* LEVEL — required */}
          <div className="cp-section-label">Learning Level <span className="cp-required">*</span></div>
          <div className="cp-level-grid">
            {['beginner', 'intermediate', 'advanced'].map(lvl => (
              <label key={lvl} className={`cp-level-card ${form.level === lvl ? 'cp-level-card--active' : ''}`}>
                <input
                  type="radio"
                  name="level"
                  value={lvl}
                  checked={form.level === lvl}
                  onChange={handleChange}
                  hidden
                />
                <span className="cp-level-icon">
                  {lvl === 'beginner' ? '🌱' : lvl === 'intermediate' ? '🌿' : '🌳'}
                </span>
                <span className="cp-level-name">{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</span>
              </label>
            ))}
          </div>

          {/* TWO-COLUMN OPTIONAL FIELDS */}
          <div className="cp-section-label cp-section-label--optional">Optional</div>
          <div className="cp-grid-2">

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

            <div className="cp-field">
              <label className="cp-label">Learning Goal</label>
              <input
                name="learning_goal"
                placeholder="e.g. speak fluently"
                value={form.learning_goal}
                onChange={handleChange}
                className="cp-input"
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">Learning Style</label>
              <select name="learning_style" value={form.learning_style} onChange={handleChange} className="cp-select">
                <option value="">Select a style</option>
                <option value="visual">Visual (videos, images)</option>
                <option value="audio">Audio (listening)</option>
                <option value="reading">Reading & Writing</option>
                <option value="practice">Practice-based</option>
              </select>
            </div>

            <div className="cp-field">
              <label className="cp-label">Daily Study Time</label>
              <select name="daily_study_time" value={form.daily_study_time} onChange={handleChange} className="cp-select">
                <option value="">Select duration</option>
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="1hr">1 hour</option>
                <option value="2hr+">2+ hours</option>
              </select>
            </div>

          </div>

          <div className="cp-field">
            <label className="cp-label">Bio</label>
            <textarea
              name="bio"
              placeholder="Tell us a little about yourself…"
              value={form.bio}
              onChange={handleChange}
              className="cp-textarea"
              rows="3"
            />
          </div>

          {/* ACTIONS */}
          <div className="cp-actions">
            <button type="submit" disabled={loading} className="cp-btn cp-btn--primary">
              {loading ? 'Saving…' : 'Complete Profile'}
            </button>
            <button type="button" onClick={() => submit(true)} disabled={loading} className="cp-btn cp-btn--ghost">
              Skip
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
