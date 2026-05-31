import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const { user } = useAuth()
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
          label: 'Total Quizzes',
          value: data.total_quiz_attempts ?? 0,
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

  const recentActivities = [
    { title: 'Level 1 completed', date: '2 hours ago', type: 'lesson' },
    { title: 'Scored 90% on quiz', date: 'Yesterday', type: 'quiz' },
    { title: 'Level 2 started', date: '3 days ago', type: 'course' },
  ]

  const recommendedLevels = [
    { name: 'Level 2: Intermediate', progress: 60, description: 'Keep going! You are performing well.' },
    { name: 'Level 3: Advanced', progress: 20, description: 'Next major level to unlock.' },
  ]

 
return (
  <div className="min-h-screen bg-bone-100 p-4 sm:p-6 md:p-12 relative overflow-hidden parchment-grid">

    {/* Background glow */}
    <div className="absolute top-[-5%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-forest-100/40 pointer-events-none blur-[120px]" />
    <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-sienna-100/30 pointer-events-none blur-[100px]" />

    <div className="max-w-5xl mx-auto z-10 relative dashboard-container">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-bone-300 pb-5 mb-8 gap-4">

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sienna-50 text-sienna-600 rounded-xl flex items-center justify-center border border-sienna-200">
            <FeatherIcon className="w-5 h-5 text-sienna-500 transform -rotate-12" />
          </div>

          <div>
            <span className="font-serif font-black text-2xl text-forest-900 block">
              Sienna & Spruce
            </span>
            <span className="font-mono text-[9px] uppercase text-forest-600 font-extrabold">
              Scribe Scriptorium
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">

          <Link to="/levels" className="flex items-center gap-2 font-black uppercase text-sienna-600">
            <SyllabusIcon className="w-4 h-4" />
            Curriculum Flow
          </Link>

          <span className="text-xs font-bold text-forest-900 bg-white/80 py-1.5 px-3 rounded-lg border">
            Writer: <strong className="text-sienna-600">{user?.username || 'Guest'}</strong>
          </span>

          <button
            onClick={() => {
              logout()
              navigate('/register', { replace: true })
            }}
            className="flex items-center gap-2 font-black uppercase text-rose-700"
          >
            <LogoutIcon className="w-4 h-4" />
            Logout
          </button>

        </div>
      </header>

      {/* WELCOME */}
      <div className="mb-10 text-center md:text-left bg-[#faf8f4] border rounded-2xl p-8">

        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-[#cb53331a] text-[#b54323] border">
          <SparklesIcon className="w-3 h-3" />
          Progress Tracker
        </div>

        <h1 className="text-4xl font-serif font-black mb-3 text-[#0f2a16]">
          Welcome back, <span style={{ color: '#b54323' }}>
            {user?.username || 'Student'}
          </span>!
        </h1>

        <p className="text-sm text-[#3a5a3e] max-w-2xl">
          Continue your learning journey. Keep improving step by step.
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        {(stats || []).map((stat, i) => (
          <div key={i} className="bg-white border rounded-2xl p-5">
            <div className="flex justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: stat.color }} />
            </div>

            <p className="text-2xl font-bold">{stat.value ?? 0}</p>
            <p className="text-xs uppercase font-bold text-gray-600">
              {stat.label}
            </p>
          </div>
        ))}

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

        {/* Recent Activity */}
        <div className="bg-white border rounded-2xl p-6">

          <div className="flex justify-between border-b pb-4 mb-5">
            <h3 className="font-serif font-bold">Recent Activities</h3>
            <Link to="/levels" className="text-xs font-bold text-sienna-600">
              View All →
            </Link>
          </div>

          {(recentActivities || []).map((a, i) => (
            <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl mb-3">
              <div className="w-2 h-2 bg-sienna-500 rounded-full mt-2" />
              <div>
                <p className="text-xs font-bold">{a.title}</p>
                <p className="text-[10px] text-gray-500">{a.date}</p>
              </div>
            </div>
          ))}

        </div>

        {/* Recommended */}
        <div className="bg-white border rounded-2xl p-6">

          <div className="flex justify-between border-b pb-4 mb-5">
            <h3 className="font-serif font-bold">Recommended</h3>
            <Link to="/levels" className="text-xs font-bold text-sienna-600">
              View All →
            </Link>
          </div>

          {(recommendedLevels || []).map((l, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl mb-4">

              <div className="flex justify-between mb-1">
                <p className="font-bold text-sm">{l.name}</p>
                <span className="text-xs text-sienna-600">{l.progress}%</span>
              </div>

              <p className="text-xs mb-3">{l.description}</p>

              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-black rounded-full"
                  style={{ width: `${l.progress}%` }}
                />
              </div>

            </div>
          ))}

        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-gray-50 border rounded-2xl p-6">

        <h3 className="font-serif font-bold mb-4">Quick Actions</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <Link to="/levels" className="bg-white border rounded-xl p-4 text-center font-bold">
            📖 Continue Learning
          </Link>

          <Link to="/levels" className="bg-white border rounded-xl p-4 text-center font-bold">
            📊 View Progress
          </Link>

          <button
            onClick={handleRetake}
            className="bg-sienna-100 border border-sienna-200 rounded-xl p-4 font-bold"
          >
            🔄 Retake Level
          </button>

        </div>

      </div>

    </div>
  </div>
)}