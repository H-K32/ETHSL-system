import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/dashboard.css'
import useAsync from '../utils/useAsync'
import { getUserDashboard } from '../api/lms'

// Icons (unchanged)
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
    } else if (user.placement_required && !user.placement_passed) {
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
          label: 'Failed Quizzes',
          value: data.quizzes_failed ?? 0,
          icon: '❌',
          color: '#ef4444'
        },
        {
          label: 'Avg Quiz Score',
          value: data.quiz_average != null ? `${Math.round(data.quiz_average)}%` : '—',
          icon: '📊',
          color: '#f59e0b'
        },
        {
          label: 'Streak',
          value: `${data.streak_count ?? 0} day${(data.streak_count ?? 0) === 1 ? '' : 's'}`,
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
      <div className="absolute top-[-5%] left-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none filter blur-[120px]" style={{ background: 'rgba(10,74,138,0.06)' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full pointer-events-none filter blur-[100px]" style={{ background: 'rgba(30,108,181,0.05)' }} />

      <div className="max-w-5xl mx-auto z-10 relative">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b pb-5 mb-8" style={{ borderColor: 'var(--mist-2)' }}>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <Link to="/curriculum" className="flex items-center gap-2 font-black uppercase" style={{ color: 'var(--deep-blue)' }}>
              <SyllabusIcon className="w-4 h-4" />
              Curriculum Flow
            </Link>
            <span className="text-xs font-bold py-1.5 px-3 rounded-lg border" style={{ color: 'var(--navy-deep)', background: 'white', borderColor: 'var(--mist-2)' }}>
              Learner: <strong style={{ color: 'var(--deep-blue)' }}>{user?.username || 'Guest'}</strong>
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

        {/* WELCOME */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full font-mono text-[10px] tracking-widest uppercase font-black px-4 py-1.5 mb-4 border shadow-sm" style={{ background: 'var(--mist)', color: 'var(--deep-blue)', borderColor: 'var(--mist-2)' }}>
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Progress Tracker</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight leading-none mb-4" style={{ color: 'var(--navy-deep)' }}>
            Welcome back, <span style={{ color: 'var(--deep-blue)' }}>
              {(user?.first_name && user?.last_name)
                ? `${user.first_name} ${user.last_name}`
                : user?.first_name || user?.username || 'Student'}
            </span>!
          </h1>
          <p className="text-sm font-sans max-w-2xl" style={{ color: 'var(--ink)', opacity: 0.75 }}>
            Continue your learning journey. Keep improving step by step.
          </p>
        </div>

        {/* STATS */}
        <div className="rounded-2xl border p-6 mb-10 shadow-sm relative overflow-hidden" style={{ background: 'white', borderColor: 'var(--mist-2)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full filter blur-xl pointer-events-none" style={{ background: 'rgba(10,74,138,0.04)' }} />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(stats || []).map((stat, i) => (
              <div key={i} className="rounded-xl border p-4" style={{ background: 'var(--mist)', borderColor: 'var(--mist-2)' }}>
                <div className="flex justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: stat.color }} />
                </div>
                <p className="text-2xl font-serif font-black" style={{ color: 'var(--navy-deep)' }}>{stat.value ?? 0}</p>
                <p className="text-[10px] font-mono uppercase font-extrabold tracking-wide mt-1" style={{ color: 'var(--deep-blue)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

          {/* Recent Activity */}
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: 'white', borderColor: 'var(--mist-2)' }}>
            <div className="flex justify-between border-b pb-4 mb-5" style={{ borderColor: 'var(--mist-2)' }}>
              <h3 className="font-serif font-black" style={{ color: 'var(--navy-deep)' }}>Recent Activities</h3>
              <Link to="/levels" className="text-[10px] font-mono font-black uppercase tracking-wider" style={{ color: 'var(--deep-blue)' }}>
                View All →
              </Link>
            </div>
            {recentActivities.length === 0 ? (
              <p className="text-xs font-mono italic" style={{ color: 'var(--ink)', opacity: 0.5 }}>No recent activity yet. Start learning!</p>
            ) : recentActivities.map((a, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl mb-3 border" style={{ background: 'var(--mist)', borderColor: 'var(--mist-2)' }}>
                <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: 'var(--aqua-bright)' }} />
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--navy-deep)' }}>{a.title}</p>
                  <p className="text-[10px] font-mono" style={{ color: 'var(--ink)', opacity: 0.6 }}>{a.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recommended */}
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: 'white', borderColor: 'var(--mist-2)' }}>
            <div className="flex justify-between border-b pb-4 mb-5" style={{ borderColor: 'var(--mist-2)' }}>
              <h3 className="font-serif font-black" style={{ color: 'var(--navy-deep)' }}>Recommended</h3>
              <Link to="/levels" className="text-[10px] font-mono font-black uppercase tracking-wider" style={{ color: 'var(--deep-blue)' }}>
                View All →
              </Link>
            </div>
            {recommendedLevels.length === 0 ? (
              <p className="text-xs font-mono italic" style={{ color: 'var(--ink)', opacity: 0.5 }}>Complete lessons to get recommendations.</p>
            ) : recommendedLevels.map((l, i) => (
              <div key={i} className="p-4 rounded-xl mb-4 border" style={{ background: 'var(--mist)', borderColor: 'var(--mist-2)' }}>
                <div className="flex justify-between mb-1">
                  <p className="font-serif font-bold text-sm" style={{ color: 'var(--navy-deep)' }}>{l.name}</p>
                  <span className="text-[10px] font-mono font-black" style={{ color: 'var(--deep-blue)' }}>{l.progress}%</span>
                </div>
                <p className="text-xs font-sans mb-3" style={{ color: 'var(--ink)', opacity: 0.7 }}>{l.description}</p>
                <div className="h-2 rounded-full" style={{ background: 'var(--mist-2)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${l.progress}%`, background: 'var(--aqua-bright)' }} />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-2xl border p-6 shadow-sm" style={{ background: 'white', borderColor: 'var(--mist-2)' }}>
          <h3 className="font-serif font-black mb-5 flex items-center gap-2" style={{ color: 'var(--navy-deep)' }}>
            <RefreshIcon className="w-4 h-4" style={{ color: 'var(--aqua-bright)' }} />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/levels"
              className="rounded-xl p-4 text-center font-mono font-black text-xs uppercase tracking-wider border transition-colors"
              style={{ background: 'var(--mist)', borderColor: 'var(--mist-2)', color: 'var(--navy-deep)' }}
            >
              📖 Continue Learning
            </Link>
            <Link
              to="/levels"
              className="rounded-xl p-4 text-center font-mono font-black text-xs uppercase tracking-wider border transition-colors"
              style={{ background: 'var(--mist)', borderColor: 'var(--mist-2)', color: 'var(--navy-deep)' }}
            >
              📊 View Progress
            </Link>
            <button
              onClick={handleRetake}
              className="rounded-xl p-4 font-mono font-black text-xs uppercase tracking-wider border transition-colors"
              style={{ background: 'var(--mist-2)', borderColor: 'var(--aqua-bright)', color: 'var(--deep-blue)' }}
            >
              🔄 Retake Level
            </button>
          </div>
        </div>

      </div>
    </div>
)}