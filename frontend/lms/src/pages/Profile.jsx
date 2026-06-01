import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAsync from '../utils/useAsync.js'
import { getProfile } from '../api/lms.js'
import ProgressBar from '../components/ProgressBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/client.js'
import '../styles/profile.css'

// Password strength validation — same rules as ResetPassword page
function validatePassword(password) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }
}

function isPasswordValid(checks) {
  return Object.values(checks).every(Boolean)
}

export default function Profile() {
  const { user, logout, refreshUser } = useAuth()
  const nav = useNavigate()
  const { data, loading, error, reload } = useAsync(getProfile, [])
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    bio: '',
    country: '',
    learning_goal: '',
  })
  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState({ username: '', fullName: '' })
  // Country dropdown state
  const [countryQuery, setCountryQuery] = useState('')
  const [showCountryList, setShowCountryList] = useState(false)
  const [countryError, setCountryError] = useState('')
  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [emailChangeLoading, setEmailChangeLoading] = useState(false)
  const [emailChangeMsg, setEmailChangeMsg] = useState({ type: '', text: '' })

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

  const handleEditClick = () => {
    setFormData({
      username: p.username || '',
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      bio: p.bio || '',
      country: p.country || '',
      learning_goal: p.learning_goal || '',
    })
    setCountryQuery(p.country || '')
    setCountryError('')
    setFieldErrors({ username: '', fullName: '' })
    setNewEmail('')
    setEmailChangeMsg({ type: '', text: '' })
    setIsEditing(true)
    setMessage({ type: '', text: '' })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear the relevant field error as the user types
    if (name === 'username') setFieldErrors(f => ({ ...f, username: '' }))
    if (name === 'first_name' || name === 'last_name') setFieldErrors(f => ({ ...f, fullName: '' }))
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  // Validation regexes — LMS user only
  const USERNAME_REGEX = /^[a-zA-Z0-9_.\-]+$/
  const FULL_NAME_REGEX = /^[a-zA-Z'\s]+$/

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 4000)
  }

  // Country helpers
  const COUNTRIES = [
    'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia',
    'Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium',
    'Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei',
    'Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic',
    'Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus',
    'Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador',
    'Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon',
    'Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau',
    'Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
    'Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan',
    'Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
    'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius',
    'Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
    'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea',
    'North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea',
    'Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
    'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino',
    'Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
    'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain',
    'Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania',
    'Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan',
    'Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay',
    'Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'
  ]
  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(countryQuery.toLowerCase())
  )
  const selectCountry = (country) => {
    setFormData(f => ({ ...f, country }))
    setCountryQuery(country)
    setShowCountryList(false)
    setCountryError('')
  }

  // Update profile (no email — email has its own flow)
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    // --- Username validation ---
    const trimmedUsername = formData.username.trim()
    if (trimmedUsername && !USERNAME_REGEX.test(trimmedUsername)) {
      setFieldErrors(f => ({ ...f, username: 'Username can only contain letters, numbers, underscores, hyphens, and dots.' }))
      return
    }

    // --- Full name validation ---
    const fullName = `${formData.first_name} ${formData.last_name}`.trim()
    if (fullName && !FULL_NAME_REGEX.test(fullName)) {
      setFieldErrors(f => ({ ...f, fullName: 'Full name can only contain letters and apostrophes.' }))
      return
    }

    // --- Country validation ---
    if (formData.country && !COUNTRIES.some(c => c.toLowerCase() === formData.country.toLowerCase())) {
      setCountryError('Country not recognized. Please select a valid country from the list.')
      return
    }
    const matchedCountry = COUNTRIES.find(
      c => c.toLowerCase() === formData.country.toLowerCase()
    ) || formData.country

    try {
      await api.patch('/users/profile/', {
        full_name: fullName,
        bio: formData.bio,
        country: matchedCountry,
        learning_goal: formData.learning_goal,
      })
      showMessage('success', 'Profile updated successfully!')
      setIsEditing(false)
      reload()
    } catch (err) {
      const d = err.response?.data
      setMessage({ type: 'error', text: d?.detail || d?.country?.[0] || 'Failed to update profile' })
    }
  }

  // Email change request
  const handleEmailChangeRequest = async (e) => {
    e.preventDefault()
    setEmailChangeMsg({ type: '', text: '' })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!newEmail.trim()) {
      setEmailChangeMsg({ type: 'error', text: 'Please enter a new email address.' })
      return
    }
    if (!emailRegex.test(newEmail.trim())) {
      setEmailChangeMsg({ type: 'error', text: 'Invalid email format.' })
      return
    }

    setEmailChangeLoading(true)
    try {
      const res = await api.post('/users/email-change-request/', { new_email: newEmail.trim() })
      setEmailChangeMsg({ type: 'success', text: res.data?.detail || 'Verification email sent. Please verify your new email address to complete the update.' })
      setNewEmail('')
    } catch (err) {
      const d = err.response?.data
      setEmailChangeMsg({ type: 'error', text: d?.detail || 'Failed to send verification email.' })
    } finally {
      setEmailChangeLoading(false)
    }
  }

  // Change password with full validation
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    const { current_password, new_password, confirm_password } = passwordData

    if (!current_password || !new_password || !confirm_password) {
      setMessage({ type: 'error', text: 'All password fields are required.' })
      return
    }

    const checks = validatePassword(new_password)
    if (!isPasswordValid(checks)) {
      setMessage({ type: 'error', text: 'Password does not meet the requirements.' })
      return
    }

    if (new_password !== confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }

    try {
      const res = await api.post('/users/change-password/', {
        current_password,
        new_password
      })
      setMessage({ type: 'success', text: res.data?.detail || 'Password updated successfully!' })
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      setIsChangingPassword(false)
    } catch (err) {
      const d = err.response?.data
      setMessage({ type: 'error', text: d?.detail || 'Failed to change password.' })
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

    const fd = new FormData()
    fd.append('avatar_upload', file)

    try {
      await api.patch('/users/profile/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAvatarPreview(URL.createObjectURL(file))
      showMessage('success', 'Avatar updated successfully!')
      reload()
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview
    if (p.avatar) return p.avatar
    return null
  }

  const pwChecks = validatePassword(passwordData.new_password)

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
            <button onClick={() => { setIsChangingPassword(true); setMessage({ type: '', text: '' }) }} className="password-btn">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Change Password
            </button>
            <button onClick={() => nav('/forgot-password')} className="forgot-btn">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Forgot Password?
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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={() => setIsEditing(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              {/* Username */}
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={() => {
                    const v = formData.username.trim()
                    if (v && !USERNAME_REGEX.test(v))
                      setFieldErrors(f => ({ ...f, username: 'Username can only contain letters, numbers, underscores, hyphens, and dots.' }))
                  }}
                  placeholder="Username"
                  minLength={3}
                  maxLength={30}
                  style={fieldErrors.username ? { borderColor: '#c62828' } : {}}
                />
                {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    onBlur={() => {
                      const full = `${formData.first_name} ${formData.last_name}`.trim()
                      if (full && !FULL_NAME_REGEX.test(full))
                        setFieldErrors(f => ({ ...f, fullName: 'Full name can only contain letters and apostrophes.' }))
                    }}
                    placeholder="First name"
                    style={fieldErrors.fullName ? { borderColor: '#c62828' } : {}}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    onBlur={() => {
                      const full = `${formData.first_name} ${formData.last_name}`.trim()
                      if (full && !FULL_NAME_REGEX.test(full))
                        setFieldErrors(f => ({ ...f, fullName: 'Full name can only contain letters and apostrophes.' }))
                    }}
                    placeholder="Last name"
                    style={fieldErrors.fullName ? { borderColor: '#c62828' } : {}}
                  />
                </div>
              </div>
              {fieldErrors.fullName && <p className="field-error">{fieldErrors.fullName}</p>}
              <div className="info-note">
                <small>⚠️ Username cannot be changed</small>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} placeholder="Tell us about yourself" style={{ width: '100%', padding: '0.9rem 1.2rem', fontSize: '1rem', border: '1.5px solid rgba(0,102,255,0.2)', borderRadius: '16px', resize: 'vertical', fontFamily: 'Inter, sans-serif' }} />
              </div>
              {/* Country — searchable dropdown */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Country</label>
                <input
                  type="text"
                  value={countryQuery}
                  onChange={e => {
                    setCountryQuery(e.target.value)
                    setFormData(f => ({ ...f, country: e.target.value }))
                    setShowCountryList(true)
                    setCountryError('')
                  }}
                  onFocus={() => setShowCountryList(true)}
                  onBlur={() => setTimeout(() => setShowCountryList(false), 180)}
                  placeholder="Search country..."
                  autoComplete="off"
                />
                {countryError && <p className="field-error">{countryError}</p>}
                {showCountryList && filteredCountries.length > 0 && (
                  <ul className="country-dropdown">
                    {filteredCountries.slice(0, 8).map(c => (
                      <li key={c} onMouseDown={() => selectCountry(c)} className="country-option">
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label>Learning Goal</label>
                <input type="text" name="learning_goal" value={formData.learning_goal} onChange={handleInputChange} placeholder="e.g. speak fluently" />
              </div>

              {/* Email Change Section */}
              <div className="email-change-section">
                <div className="email-change-header">
                  <span>📧 Change Email Address</span>
                </div>
                <p className="email-change-note">
                  Current: <strong>{p.email}</strong>
                </p>
                <p className="email-change-note">
                  Enter a new email below. A verification link will be sent to the new address. Your current email remains active until verified.
                </p>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label>New Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => { setNewEmail(e.target.value); setEmailChangeMsg({ type: '', text: '' }) }}
                    placeholder="Enter new email"
                  />
                </div>
                {emailChangeMsg.text && (
                  <div className={`email-change-msg ${emailChangeMsg.type}`}>
                    {emailChangeMsg.text}
                  </div>
                )}
                <button
                  type="button"
                  className="send-verification-btn"
                  onClick={handleEmailChangeRequest}
                  disabled={emailChangeLoading || !newEmail.trim()}
                >
                  {emailChangeLoading ? 'Sending...' : 'Send Verification Email'}
                </button>
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
                <input type="password" name="current_password" value={passwordData.current_password} onChange={handlePasswordChange} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} required />
              </div>

              {/* Live password requirements */}
              {passwordData.new_password && (
                <ul className="pw-checks">
                  <li className={pwChecks.minLength ? 'check-pass' : 'check-fail'}>
                    {pwChecks.minLength ? '✔' : '✖'} At least 8 characters
                  </li>
                  <li className={pwChecks.hasUpper ? 'check-pass' : 'check-fail'}>
                    {pwChecks.hasUpper ? '✔' : '✖'} At least 1 uppercase letter
                  </li>
                  <li className={pwChecks.hasLower ? 'check-pass' : 'check-fail'}>
                    {pwChecks.hasLower ? '✔' : '✖'} At least 1 lowercase letter
                  </li>
                  <li className={pwChecks.hasNumber ? 'check-pass' : 'check-fail'}>
                    {pwChecks.hasNumber ? '✔' : '✖'} At least 1 number
                  </li>
                  <li className={pwChecks.hasSpecial ? 'check-pass' : 'check-fail'}>
                    {pwChecks.hasSpecial ? '✔' : '✖'} At least 1 special character
                  </li>
                </ul>
              )}

              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} required />
              </div>

              {/* Forgot Password link */}
              <div className="forgot-pw-link">
                <button
                  type="button"
                  className="forgot-pw-btn"
                  onClick={() => { setIsChangingPassword(false); nav('/forgot-password') }}
                >
                  Forgot Password?
                </button>
              </div>

              {message.text && (
                <div className={`modal-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsChangingPassword(false)}>Cancel</button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!isPasswordValid(pwChecks) || passwordData.new_password !== passwordData.confirm_password}
                >
                  Update Password
                </button>
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
