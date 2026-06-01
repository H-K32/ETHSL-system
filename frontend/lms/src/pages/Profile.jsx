import { useState } from 'react'
import useAsync from '../utils/useAsync.js'
import { getProfile } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/client.js'
import '../styles/profile.css'

// ISO 3166-1 country list (common subset — covers all real countries)
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

const LEARNING_STYLE_LABELS = {
  visual: 'Visual (videos, images)',
  audio: 'Audio (listening)',
  reading: 'Reading & Writing',
  practice: 'Practice-based',
}

const STUDY_TIME_LABELS = {
  '15min': '15 minutes / day',
  '30min': '30 minutes / day',
  '1hr': '1 hour / day',
  '2hr+': '2+ hours / day',
}

export default function Profile() {
  const { user, logout, refreshUser } = useAuth()
  const { data, loading, error, reload } = useAsync(getProfile, [])
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    country: '',
    learning_goal: '',
  })
  const [countryQuery, setCountryQuery] = useState('')
  const [showCountryList, setShowCountryList] = useState(false)
  const [countryError, setCountryError] = useState('')
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

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 4000)
  }

  const handleEditClick = () => {
    setFormData({
      username: p.username || '',
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      email: p.email || '',
      bio: p.bio || '',
      country: p.country || '',
      learning_goal: p.learning_goal || '',
    })
    setCountryQuery(p.country || '')
    setCountryError('')
    setIsEditing(true)
    setMessage({ type: '', text: '' })
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  // Country dropdown helpers
  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(countryQuery.toLowerCase())
  )

  const selectCountry = (country) => {
    setFormData(f => ({ ...f, country }))
    setCountryQuery(country)
    setShowCountryList(false)
    setCountryError('')
  }

  const validateCountry = () => {
    if (!formData.country) return true // optional field
    const valid = COUNTRIES.some(c => c.toLowerCase() === formData.country.toLowerCase())
    if (!valid) {
      setCountryError('Country not recognized. Please select a valid country from the list.')
      return false
    }
    setCountryError('')
    return true
  }

  // Update profile — includes username, backend returns 400 with {username: [...]} if taken
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (!validateCountry()) return

    // Normalize country casing to match list
    const matchedCountry = COUNTRIES.find(
      c => c.toLowerCase() === formData.country.toLowerCase()
    ) || formData.country

    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim()
      await api.patch('/users/profile/', {
        username: formData.username,
        email: formData.email,
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
      if (d?.username) {
        showMessage('error', 'Username already exists. Please choose a different username.')
      } else {
        showMessage('error', d?.email?.[0] || d?.detail || 'Failed to update profile')
      }
    }
  }

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      showMessage('error', 'New passwords do not match')
      return
    }
    if (passwordData.new_password.length < 8) {
      showMessage('error', 'Password must be at least 8 characters')
      return
    }
    setMessage({ type: '', text: '' })
    try {
      await api.post('/users/change-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      showMessage('success', 'Password changed successfully!')
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      setIsChangingPassword(false)
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Failed to change password')
    }
  }

  // Upload avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showMessage('error', 'Image must be less than 5MB'); return }
    if (!file.type.startsWith('image/')) { showMessage('error', 'Please upload an image file'); return }
    setIsUploading(true)
    setMessage({ type: '', text: '' })
    const fd = new FormData()
    fd.append('avatar_upload', file)
    try {
      await api.patch('/users/profile/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
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
              <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
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

      {/* About / Profile Details Section */}
      {(p.bio || p.country || p.learning_goal || p.learning_style || p.daily_study_time || p.level) && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="section-title">About</div>
          <div className="profile-details-grid">
            {p.bio && (
              <div className="profile-detail-card profile-detail-card--full">
                <span className="profile-detail-label">Bio</span>
                <p className="profile-detail-value">{p.bio}</p>
              </div>
            )}
            {p.country && (
              <div className="profile-detail-card">
                <span className="profile-detail-label">Country</span>
                <p className="profile-detail-value">{p.country}</p>
              </div>
            )}
            {p.learning_goal && (
              <div className="profile-detail-card">
                <span className="profile-detail-label">Learning Goal</span>
                <p className="profile-detail-value">{p.learning_goal}</p>
              </div>
            )}
            {p.learning_style && (
              <div className="profile-detail-card">
                <span className="profile-detail-label">Learning Style</span>
                <p className="profile-detail-value">{LEARNING_STYLE_LABELS[p.learning_style] || p.learning_style}</p>
              </div>
            )}
            {p.daily_study_time && (
              <div className="profile-detail-card">
                <span className="profile-detail-label">Daily Study Time</span>
                <p className="profile-detail-value">{STUDY_TIME_LABELS[p.daily_study_time] || p.daily_study_time}</p>
              </div>
            )}
            {p.level && (
              <div className="profile-detail-card">
                <span className="profile-detail-label">Learning Level</span>
                <p className="profile-detail-value" style={{ textTransform: 'capitalize' }}>{p.level}</p>
              </div>
            )}
          </div>
        </div>
      )}

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
                  placeholder="Username"
                  minLength={3}
                  maxLength={30}
                  pattern="^[a-zA-Z0-9_]+$"
                  title="Letters, numbers and underscores only"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="First name" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Last name" />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
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
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} required />
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
