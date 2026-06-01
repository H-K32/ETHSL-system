import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/dashboard.css'
import useAsync from '../utils/useAsync'
import { getUserDashboard } from '../api/lms'

// Icons (unchanged)
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

// Optional UI placeholders (so it doesn't crash)
const Spinner = () => <div className="p-4">Loading...</div>
const ErrorState = ({ error, onRetry }) => (
  <div className="p-4 text-red-500">
    <p>Error: {error?.message || 'Something went wrong'}</p>
    <button onClick={onRetry}>Retry</button>
  </div>
)

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useAsync(getUserDashboard, [])

  // ✅ FIXED: use backend fields, NOT placementScore
  useEffect(() => {
    if (!user) {
      navigate('/register', { replace: true })
    } else if (user.placement_required) {
      navigate('/placement', { replace: true })
    }
  }, [user, navigate])

  if (loading) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const handleRetake = () => {
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

  // ✅ FIXED: safe fallback values
  const stats = data
    ? [
        {
          label: 'Completed Lessons',
          value: data.completed_lessons ?? 0,
          icon: '📚',
          color: '#8c52ff'
        },
        {
          label: 'Successful Quizzes',
          value: data.quizzes_passed ?? 0,
          icon: '✅',
          color: '#10b981'
        },
        {
          label: 'Avg Quiz Score',
          value: data.quiz_average != null ? `${Math.round(data.quiz_average)}%` : '—',
          icon: '📊',
          color: '#f59e0b'
        },
        {
          label: 'Streak',
          value: data.streak_count ?? user?.streak_count ?? 0,
          icon: '🔥',
          color: '#ef4444'
        }
      ]
    : []

  const recentActivities = data?.recent_activities || []
  const recommendedLevels = data?.recommended_levels || []

 
return (
    <div className="min-h-screen dashboard-parchment p-4 sm:p-6 md:p-12 relative overflow-hidden">
      {/* Atmospheric background spots matching Levels.jsx */}
      <div className="absolute top-[-5%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-forest-100/40 pointer-events-none filter blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-sienna-100/30 pointer-events-none filter blur-[100px]" />

      <div className="max-w-5xl mx-auto z-10 relative">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-bone-300 pb-5 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sienna-50 text-sienna-600 rounded-xl flex items-center justify-center border border-sienna-200">
              <FeatherIcon className="w-5 h-5 text-sienna-500 transform -rotate-12" />
            </div>
            <div>
              <span className="font-serif font-black text-2xl text-forest-900 block">Sienna & Spruce</span>
              <span className="font-mono text-[9px] uppercase text-forest-600 font-extrabold">Scribe Scriptorium</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <Link to="/curriculum" className="flex items-center gap-2 font-black uppercase text-sienna-600">
              <SyllabusIcon className="w-4 h-4" />
              Curriculum Flow
            </Link>
            <span className="text-xs font-bold text-forest-900 bg-white/80 py-1.5 px-3 rounded-lg border border-bone-300">
              Writer: <strong className="text-sienna-600">{user?.username || 'Guest'}</strong>
            </span>
            <button
              onClick={() => { logout(); navigate('/register', { replace: true }) }}
              className="flex items-center gap-2 font-black uppercase text-rose-700"
            >
              <LogoutIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* WELCOME — styled like Levels.jsx hero */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-sienna-100 text-sienna-800 rounded-full font-mono text-[10px] tracking-widest uppercase font-black px-4 py-1.5 mb-4 border border-sienna-200/50 shadow-sm">
            <SparklesIcon className="w-3.5 h-3.5 text-sienna-600" />
            <span>Progress Tracker</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-forest-900 tracking-tight leading-none mb-4">
            Welcome back, <span className="text-sienna-600">{user?.username || 'Student'}</span>!
          </h1>
          <p className="text-sm font-sans text-forest-600 max-w-2xl">
            Continue your learning journey. Keep improving step by step.
          </p>
        </div>

        {/* STATS — styled like Levels.jsx progress card */}
        <div className="bg-bone-50 rounded-2xl border border-bone-300 p-6 mb-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-forest-100/20 rounded-full filter blur-xl pointer-events-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(stats || []).map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-bone-300 p-4">
                <div className="flex justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: stat.color }} />
                </div>
                <p className="text-2xl font-serif font-black text-forest-900">{stat.value ?? 0}</p>
                <p className="text-[10px] font-mono uppercase font-extrabold tracking-wide text-forest-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

          {/* Recent Activity */}
          <div className="bg-bone-50 border border-bone-300 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between border-b border-bone-300 pb-4 mb-5">
              <h3 className="font-serif font-black text-forest-900">Recent Activities</h3>
              <Link to="/levels" className="text-[10px] font-mono font-black uppercase tracking-wider text-sienna-600 hover:text-sienna-700">
                View All →
              </Link>
            </div>
            {recentActivities.length === 0 ? (
              <p className="text-xs font-mono text-forest-600 italic">No recent activity yet. Start learning!</p>
            ) : recentActivities.map((a, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white rounded-xl mb-3 border border-bone-200">
                <div className="w-2 h-2 bg-sienna-500 rounded-full mt-2 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-forest-900">{a.title}</p>
                  <p className="text-[10px] font-mono text-forest-600">{a.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recommended */}
          <div className="bg-bone-50 border border-bone-300 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between border-b border-bone-300 pb-4 mb-5">
              <h3 className="font-serif font-black text-forest-900">Recommended</h3>
              <Link to="/levels" className="text-[10px] font-mono font-black uppercase tracking-wider text-sienna-600 hover:text-sienna-700">
                View All →
              </Link>
            </div>
            {recommendedLevels.length === 0 ? (
              <p className="text-xs font-mono text-forest-600 italic">Complete lessons to get recommendations.</p>
            ) : recommendedLevels.map((l, i) => (
              <div key={i} className="p-4 bg-white rounded-xl mb-4 border border-bone-200">
                <div className="flex justify-between mb-1">
                  <p className="font-serif font-bold text-sm text-forest-900">{l.name}</p>
                  <span className="text-[10px] font-mono font-black text-sienna-600">{l.progress}%</span>
                </div>
                <p className="text-xs font-sans text-forest-600 mb-3">{l.description}</p>
                <div className="h-2 bg-bone-200 rounded-full border border-bone-300">
                  <div className="h-full bg-sienna-500 rounded-full transition-all duration-700" style={{ width: `${l.progress}%` }} />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-bone-50 border border-bone-300 rounded-2xl p-6 shadow-sm">
          <h3 className="font-serif font-black text-forest-900 mb-5 flex items-center gap-2">
            <RefreshIcon className="w-4 h-4 text-sienna-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/levels"
              className="bg-white border border-bone-300 rounded-xl p-4 text-center font-mono font-black text-xs uppercase tracking-wider text-forest-800 hover:border-sienna-500 hover:text-sienna-600 transition-colors"
            >
              📖 Continue Learning
            </Link>
            <Link
              to="/levels"
              className="bg-white border border-bone-300 rounded-xl p-4 text-center font-mono font-black text-xs uppercase tracking-wider text-forest-800 hover:border-sienna-500 hover:text-sienna-600 transition-colors"
            >
              📊 View Progress
            </Link>
            <button
              onClick={handleRetake}
              className="bg-sienna-100 border border-sienna-200 rounded-xl p-4 font-mono font-black text-xs uppercase tracking-wider text-sienna-700 hover:bg-sienna-200 transition-colors"
            >
              🔄 Retake Level
            </button>
          </div>
        </div>

      </div>
    </div>
)}