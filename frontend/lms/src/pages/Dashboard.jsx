import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/dashboard.css'

// Custom pure SVG icon components (Replacing all lucide-react icons)
const FeatherIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-1.5-1.5M12 21h-3M18 10.5a6 6 0 00-12 0v3.31a6 6 0 00.354 2.028L8.25 21l3.5-.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const SyllabusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
)

const LogoutIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
)

const SparklesIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813zM18.251 5.251L18 8l-.251-2.749L15 5l2.749-.251L18 2l.251 2.749L21 5l-2.749.251z" />
  </svg>
)

const RefreshIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
)

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/register', { replace: true })
    } else if (user.placementScore === undefined) {
      navigate('/placement', { replace: true })
    }
  }, [user, navigate])

  if (!user || user.placementScore === undefined) return null

  const handleRetake = () => {
    // Clear placement info
    const saved = localStorage.getItem('sienna_placement_user')
    if (saved) {
      const parsed = JSON.parse(saved)
      delete parsed.placementScore
      delete parsed.placementLevel
      delete parsed.completedAt
      localStorage.setItem('sienna_placement_user', JSON.stringify(parsed))
    }
    window.location.href = '#/placement'
  }

  // Purely translated Amharic Stats matching user structure
  const stats = [
    { label: 'የተመዘገቡት ኮርሶች', value: '3', icon: '📚', color: '#8c52ff' },
    { label: 'ያለቁ ትምህርቶች', value: '12', icon: '✅', color: '#10b981' },
    { label: 'የፈተና ውጤት', value: `${user.placementScore}%`, icon: '📊', color: '#f59e0b' },
    { label: 'ተከታታይ ቀናት (ስትሪክ)', value: '7', icon: '🔥', color: '#ef4444' },
  ]

  // Purely translated Recent Activities
  const recentActivities = [
    { title: 'ምዕራፍ 1 ተጠናቋል', date: 'ከ2 ሰዓት በፊት', type: 'lesson' },
    { title: 'በፈተናው 90% ተመዝግቧል', date: 'ትናንት', type: 'quiz' },
    { title: 'ምዕራፍ 2 ተጀምሯል', date: 'ከ3 ቀን በፊት', type: 'course' },
  ]

  // Purely translated Recommended Levels
  const recommendedLevels = [
    { name: 'ምዕራፍ 2: መካከለኛ', progress: 60, description: 'ይቀጥሉ! በጥሩ ሁኔታ እያከናወኑ ነው።' },
    { name: 'ምዕራፍ 3: የላቀ', progress: 20, description: 'ለመክፈት ቀጣዩ ዋና ምዕራፍ።' },
  ]

  return (
    <div className="min-h-screen bg-bone-100 p-4 sm:p-6 md:p-12 relative overflow-hidden parchment-grid">
      {/* Radiant atmospheric background glow to match application guidelines */}
      <div className="absolute top-[-5%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-forest-100/40 pointer-events-none filter blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-sienna-100/30 pointer-events-none filter blur-[100px]" />

      <div className="max-w-5xl mx-auto z-10 relative dashboard-container">
        
        {/* Vintage Top Navigation Header with pure SVGs */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-bone-300 pb-5 mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sienna-50 text-sienna-600 rounded-xl flex items-center justify-center border border-sienna-200">
              <FeatherIcon className="w-5 h-5 text-sienna-500 transform -rotate-12" />
            </div>
            <div>
              <span className="font-serif font-black tracking-tight text-2xl text-forest-900 block leading-none">
                የሴና እና የስፕሩስ
              </span>
              <span className="font-mono text-[9px] tracking-widest uppercase text-forest-600 font-extrabold block mt-0.5">
                የጸሐፍት ማደሪያ (Scribe Scriptorium)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <Link
              to="/levels"
              className="group flex items-center space-x-2 font-black uppercase text-sienna-600 hover:text-sienna-700 transition"
            >
              <SyllabusIcon className="w-4 h-4 text-sienna-500 transition-transform group-hover:scale-110" />
              <span>የስርዓተ-ትምህርት ፍሰት</span>
            </Link>
            
            <span className="font-sans text-xs font-bold text-forest-900 bg-white/80 backdrop-blur-sm py-1.5 px-3 rounded-lg border border-bone-300">
              ጸሐፊ: <strong className="font-black text-sienna-600">{user.username}</strong>
            </span>

            <button
              onClick={() => {
                logout()
                navigate('/register')
              }}
              className="group flex items-center space-x-2 font-black uppercase text-rose-700 hover:text-rose-800 transition"
            >
              <LogoutIcon className="w-4 h-4 text-rose-600 transition-transform group-hover:translate-x-0.5" />
              <span>ውጣ</span>
            </button>
          </div>
        </header>

        {/* Elegant Welcome Hero Section - FIXED WITH INLINE STYLES FOR VISIBILITY */}
        <div className="welcome-section mb-10 text-center md:text-left" style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #d4e2f7 100%)' }}>
          <div className="welcome-text">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 mb-3.5" style={{ background: 'rgba(10, 74, 138, 0.1)', color: '#0a4a8a', border: '1px solid rgba(10, 74, 138, 0.2)' }}>
              <SparklesIcon className="w-3 h-3" style={{ color: '#0a4a8a' }} />
              <span style={{ color: '#0a4a8a' }}>የእድገት መከታተያ</span>
            </div>
            <h1 className="welcome-title text-4xl md:text-5xl font-serif font-black tracking-tight leading-none mb-3" style={{ color: '#062041' }}>
              እንኳን በደህና ተመለሱ፣ <span className="gradient-name" style={{ color: '#0a4a8a' }}>{user.username || 'ተማሪ'}!</span>
            </h1>
            <p className="welcome-subtitle text-sm sm:text-base max-w-2xl leading-relaxed" style={{ color: '#0a1c2f', opacity: '0.85' }}>
              የመማር ጉዞዎን ይቀጥሉ። በጥሩ ሁኔታ እያደጉ እና እጅግ ጠቃሚ የሆኑ ስኬቶችን እያስመዘገቡ ነው!
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card bg-white rounded-2xl border border-bone-300 p-5 shadow-sm transition-all hover:scale-[1.01]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: stat.color }}
                />
              </div>
              <div className="stat-info">
                <p className="stat-value text-2xl font-serif font-black text-forest-950 mb-0.5">{stat.value}</p>
                <p className="stat-label text-xs font-mono font-bold text-forest-650 tracking-wide uppercase leading-tight">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* Recent Activity Card */}
          <div className="dashboard-card bg-white rounded-2xl border border-bone-300 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="card-header flex items-center justify-between border-b border-bone-200 pb-4 mb-5">
                <h3 className="font-serif text-lg font-black text-forest-900">የቅርብ ጊዜ እንቅስቃሴዎች</h3>
                <Link to="/levels" className="view-all font-mono text-xs font-bold text-sienna-600 hover:text-sienna-700 transition">
                  ሁሉንም እይ →
                </Link>
              </div>
              <div className="activity-list space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item flex items-start gap-3 p-3 bg-bone-100 rounded-xl border border-bone-200">
                    <div className="activity-dot w-2 h-2 rounded-full bg-sienna-500 mt-1.5 flex-shrink-0" />
                    <div className="activity-content">
                      <p className="activity-title text-xs font-bold font-sans text-forest-900">{activity.title}</p>
                      <p className="activity-date text-[10px] font-mono text-forest-600 mt-0.5">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-dashed border-bone-200">
              <div className="flex items-center gap-1.5 text-xs text-forest-600 font-semibold font-sans">
                <span className="w-1.5 h-1.5 bg-forest-600 rounded-full animate-pulse" />
                <span>እንቅስቃሴዎች በቅጽበት ይዘመናሉ</span>
              </div>
            </div>
          </div>

          {/* Recommended Levels Card */}
          <div className="dashboard-card bg-white rounded-2xl border border-bone-300 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="card-header flex items-center justify-between border-b border-bone-200 pb-4 mb-5">
                <h3 className="font-serif text-lg font-black text-forest-900">ለእርስዎ የሚመከር</h3>
                <Link to="/levels" className="view-all font-mono text-xs font-bold text-sienna-600 hover:text-sienna-700 transition">
                  ሁሉንም እይ →
                </Link>
              </div>
              <div className="recommended-list space-y-4">
                {recommendedLevels.map((level, index) => (
                  <div key={index} className="recommended-item p-4 bg-bone-50 rounded-xl border border-bone-200">
                    <div className="recommended-info">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="recommended-title text-sm font-serif font-bold text-forest-900">{level.name}</p>
                        <span className="progress-text font-mono text-xs font-bold text-sienna-600">{level.progress}% አልቋል</span>
                      </div>
                      <p className="recommended-desc text-xs font-sans text-forest-700 mb-3">{level.description}</p>
                      <div className="progress-bar w-full h-2 bg-bone-200 rounded-full overflow-hidden border border-bone-300">
                        <div 
                          className="progress-fill h-full bg-forest-800 rounded-full transition-all duration-500" 
                          style={{ width: `${level.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-bone-200 font-mono text-[10px] text-forest-600">
              ስርዓቱ ከፍተኛ እድገት ሊያስመዘግቡባቸው የሚችሉባቸውን ክፍሎች በየቀኑ ይመርጣል።
            </div>
          </div>

        </div>

        {/* Quick Actions Panel */}
        <div className="quick-actions p-6 bg-bone-50 rounded-2xl border border-bone-300 shadow-sm mb-8">
          <h3 className="quick-title font-serif text-lg font-black text-forest-900 mb-4 flex items-center gap-2">
            <span>⚙️</span>
            <span>ፈጣን ተግባራት</span>
          </h3>
          <div className="actions-grid grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/levels" className="action-btn flex items-center justify-center gap-2.5 p-4 bg-white hover:bg-bone-100 border border-bone-300 rounded-xl font-mono text-xs font-black uppercase text-forest-900 shadow-xs transition-all active:scale-95">
              <span className="text-base text-sienna-500">📖</span>
              <span>ትምህርቱን ቀጥል</span>
            </Link>
            
            <Link to="/levels" className="action-btn flex items-center justify-center gap-2.5 p-4 bg-white hover:bg-bone-100 border border-bone-300 rounded-xl font-mono text-xs font-black uppercase text-forest-900 shadow-xs transition-all active:scale-95">
              <span className="text-base text-sienna-500">📈</span>
              <span>እድገትን ተመልከት</span>
            </Link>
            
            <button 
              onClick={handleRetake}
              className="action-btn flex items-center justify-center gap-2.5 p-4 bg-sienna-50 hover:bg-sienna-100 border border-sienna-200 rounded-xl font-mono text-xs font-black uppercase text-sienna-800 shadow-xs transition-all active:scale-95"
            >
              <RefreshIcon className="w-4 h-4 text-sienna-500" />
              <span>ደረጃን እንደገና መዝን</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}