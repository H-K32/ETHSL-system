import { Link } from 'react-router-dom';
import useAsync from '../utils/useAsync';
import { getUserDashboard } from '../api/lms';
import Spinner from '../components/Spinner';

const ArrowLeft = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
const Sparkles = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813zM18.251 5.251L18 8l-.251-2.749L15 5l2.749-.251L18 2l.251 2.749L21 5l-2.749.251z" />
  </svg>
);
const GraduationCap = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);
const BookOpen = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);
const Award = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-1.5m0 0a3 3 0 11-6 0v-4.5h3a3 3 0 013 3M12 4.5V3M12 21v-4.5" />
  </svg>
);
const TrendingUp = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const Flame = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const Activity = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const Compass = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0L8.25 15.75M12 3v3.75" />
  </svg>
);

export default function Progress() {
  const { data, loading } = useAsync(getUserDashboard, []);

  if (loading) return <Spinner />;

  const d = data || {};
  const completed_lessons   = d.completed_lessons   ?? 0;
  const quizzes_passed      = d.quizzes_passed      ?? 0;
  const total_quiz_attempts = d.total_quiz_attempts ?? 0;
  const streak_count        = d.streak_count        ?? 0;
  const current_level       = d.current_level       ?? '—';
  const successRate = total_quiz_attempts > 0
    ? Math.round((quizzes_passed / total_quiz_attempts) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-bone-100 p-4 sm:p-6 md:p-12 relative overflow-hidden parchment-grid">
      <div className="absolute top-[-5%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-forest-100/40 pointer-events-none filter blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-sienna-100/30 pointer-events-none filter blur-[100px]" />

      <div className="max-w-5xl mx-auto z-10 relative progress-app-container">

        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-bone-300 pb-5 mb-8 gap-4">
          <Link to="/dashboard" className="group flex items-center space-x-2.5 font-mono text-xs font-black uppercase tracking-wider text-sienna-600 hover:text-sienna-700 transition">
            <ArrowLeft className="w-4 h-4 text-sienna-500 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Dashboard</span>
          </Link>
          <div className="flex items-center space-x-2 text-forest-800 font-mono text-[10px] tracking-widest uppercase font-bold">
            <span className="w-1.5 h-1.5 bg-forest-550 rounded-full animate-ping" />
            <span>Chapter 03: Personal Study Records</span>
          </div>
        </header>

        <div className="progress-hero mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-sienna-150 text-sienna-900 rounded-full font-mono text-[10px] tracking-widest uppercase font-black px-4 py-1.5 mb-4 border border-sienna-200/50 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-sienna-600 animate-pulse" />
            <span>Skill Plan</span>
          </div>
          <h1 className="progress-title text-4xl md:text-5xl font-serif font-black text-forest-900 tracking-tight leading-none mb-3">
            Your Learning Progress
          </h1>
          <p className="text-sm md:text-base font-sans font-medium text-forest-700 max-w-2xl leading-relaxed">
            Track your journey, monitor your habits, and record your achievements.
          </p>
        </div>

        {/* Current Level */}
        <div className="current-level-box mb-8 p-6 md:p-8 rounded-2xl border border-bone-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-white">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-forest-900 rounded-2xl flex items-center justify-center border border-forest-950 shadow-md">
              <GraduationCap className="w-7 h-7 text-sienna-400" />
            </div>
            <div>
              <p className="font-mono text-[9px] font-black uppercase tracking-widest text-sienna-600">Your Current Level</p>
              <h3 className="font-serif text-lg md:text-xl font-bold text-forest-950 mt-1">{current_level}</h3>
            </div>
          </div>
          <Link to="/levels" className="shrink-0 inline-flex items-center gap-2 px-5 py-3 font-serif font-bold text-sm bg-forest-900 hover:bg-forest-850 text-bone-50 rounded-xl border border-forest-950 shadow-xs transition-all">
            <span>Continue Learning</span>
            <span className="text-xs">→</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-large-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-large bg-white rounded-2xl border border-bone-300 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3"><span className="text-2xl">📚</span><BookOpen className="w-4 h-4 text-forest-500" /></div>
            <p className="text-2xl md:text-3xl font-serif font-black text-forest-950 leading-none mb-1">{completed_lessons}</p>
            <p className="font-mono text-[10px] font-extrabold text-forest-650 uppercase tracking-widest">Completed Lessons</p>
          </div>
          <div className="stat-large bg-white rounded-2xl border border-bone-300 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3"><span className="text-2xl">🏆</span><Award className="w-4 h-4 text-sienna-500" /></div>
            <p className="text-2xl md:text-3xl font-serif font-black text-forest-950 leading-none mb-1">{quizzes_passed}</p>
            <p className="font-mono text-[10px] font-extrabold text-forest-650 uppercase tracking-widest">Passed Quizzes</p>
          </div>
          <div className="stat-large bg-white rounded-2xl border border-bone-300 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3"><span className="text-2xl">📊</span><TrendingUp className="w-4 h-4 text-blue-500" /></div>
            <p className="text-2xl md:text-3xl font-serif font-black text-forest-950 leading-none mb-1">{successRate}%</p>
            <p className="font-mono text-[10px] font-extrabold text-forest-650 uppercase tracking-widest">Success Rate</p>
          </div>
          <div className="stat-large bg-white rounded-2xl border border-bone-300 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3"><span className="text-2xl">🔥</span><Flame className="w-4 h-4 text-red-500 animate-pulse" /></div>
            <p className="text-2xl md:text-3xl font-serif font-black text-forest-950 leading-none mb-1">{streak_count}</p>
            <p className="font-mono text-[10px] font-extrabold text-forest-650 uppercase tracking-widest">Streak Days</p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="progress-content-card bg-white rounded-2xl border border-bone-300 p-6 shadow-xs">
            <div className="pb-3 mb-4 border-b border-dashed border-bone-250 flex justify-between items-center">
              <h3 className="font-serif font-bold text-forest-950 text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-sienna-500" />
                <span>Quiz Performance</span>
              </h3>
              <span className="font-mono text-[9px] px-2 py-0.5 bg-sienna-100 text-sienna-800 rounded font-black uppercase">Exams</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-bone-50 rounded-xl border border-bone-200">
                <span className="font-sans text-xs font-semibold text-forest-750">Total Quiz Attempts</span>
                <span className="font-mono text-xs font-bold text-forest-950">{total_quiz_attempts} times</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-bone-50 rounded-xl border border-bone-200">
                <span className="font-sans text-xs font-semibold text-forest-750">Passed Quizzes</span>
                <span className="font-mono text-xs font-bold text-emerald-700">{quizzes_passed} quizzes</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-bone-50 rounded-xl border border-bone-200">
                <span className="font-sans text-xs font-semibold text-forest-750">Quiz Success Rate</span>
                <span className="font-mono text-xs font-bold text-sienna-600">{successRate}%</span>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/levels" className="w-full py-2 bg-bone-100 hover:bg-bone-200 border border-bone-300 text-center font-mono text-[10px] font-black uppercase text-forest-900 rounded-lg block transition">
                Take More Quizzes
              </Link>
            </div>
          </div>

          <div className="progress-content-card bg-white rounded-2xl border border-bone-300 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-3 mb-4 border-b border-dashed border-bone-250 flex justify-between items-center">
                <h3 className="font-serif font-bold text-forest-950 text-base flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sienna-500" />
                  <span>Learning Summary</span>
                </h3>
                <span className="font-mono text-[9px] px-2 py-0.5 bg-forest-100 text-forest-800 rounded font-black uppercase">Overview</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-bone-50 rounded-xl border border-bone-200">
                  <span className="font-sans text-xs font-semibold text-forest-750">Current Level</span>
                  <span className="font-mono text-xs font-bold text-forest-950">{current_level}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-bone-50 rounded-xl border border-bone-200">
                  <span className="font-sans text-xs font-semibold text-forest-750">Lessons Completed</span>
                  <span className="font-mono text-xs font-bold text-emerald-700">{completed_lessons}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-bone-50 rounded-xl border border-bone-200">
                  <span className="font-sans text-xs font-semibold text-forest-750">Study Streak</span>
                  <span className="font-mono text-xs font-bold text-sienna-600">{streak_count} days 🔥</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-dashed border-bone-200">
              <p className="text-[11px] font-sans text-forest-650 font-semibold italic text-center">
                "Knowing grammar is the path to freedom."
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="banner-recommend p-6 bg-forest-950 rounded-2xl border border-bone-400 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-28 h-28 bg-sienna-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-bone-100">Ready to start new lessons?</h4>
              <p className="text-xs font-sans text-bone-300 font-medium mt-0.5">Explore chapter courses and interactive tests now.</p>
            </div>
          </div>
          <Link to="/levels" className="px-5 py-2.5 bg-sienna-600 hover:bg-sienna-700 text-bone-50 border border-sienna-700 rounded-lg text-xs font-mono font-black uppercase shrink-0 tracking-wider shadow-sm transition">
            Start Now →
          </Link>
        </div>

      </div>

      <style>{`
        .parchment-grid {
          background-color: var(--color-bone-100);
          background-image:
            linear-gradient(rgba(228,218,194,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(228,218,194,0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .progress-app-container { animation: progressSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes progressSlideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .current-level-box { position: relative; }
        .current-level-box::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; background-color:var(--color-sienna-500); }
        .stat-large { position:relative; transition:all 0.35s cubic-bezier(0.16,1,0.3,1); }
        .stat-large:hover { transform:translateY(-4px); box-shadow:0 12px 24px -4px rgba(27,56,31,0.08); }
        .banner-recommend::before { content:''; position:absolute; top:4px; left:4px; right:4px; bottom:4px; border:1px double rgba(253,252,249,0.15); border-radius:12px; pointer-events:none; }
      `}</style>
    </div>
  );
}
