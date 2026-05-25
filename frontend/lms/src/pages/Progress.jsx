import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pure SVG Icon components to avoid lucide dependency
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
  const { user } = useAuth();
  const completedList = JSON.parse(localStorage.getItem('sienna_completed_lessons') || '[]');
  const [progress, setProgress] = useState({
    completed_lessons: 4,
    quizzes_passed: 1,
    total_quiz_attempts: 2,
    streak_count: 7,
    current_level: 'beginner',
    placement_passed: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine progress parameters dynamically from localStorage
    const timer = setTimeout(() => {
      if (user) {
        const placementScore = user.placementScore !== undefined ? user.placementScore : 0;
        const passedPlacement = user.placementScore !== undefined && user.placementScore > 0;
        
        // Fetch completed list
        const savedCompleted = localStorage.getItem('sienna_completed_lessons');
        const completedList = savedCompleted ? JSON.parse(savedCompleted) : [];
        const completedCount = completedList.length;

        // Streak count
        const streak = parseInt(localStorage.getItem('sienna_streak') || "7");

        // Compute quizzes passed and total quiz attempts dynamically
        // 1 attempt and possibly 1 passed for the placement exam
        let quizPassed = (user.placementScore !== undefined && user.placementScore >= 50) ? 1 : 0;
        let attempts = (user.placementScore !== undefined) ? 1 : 0;

        // Each course lesson complete reflects +1 quiz attempt and +1 passed due to the assessment check
        quizPassed += completedCount;
        attempts += completedCount;

        setProgress({
          completed_lessons: completedCount,
          quizzes_passed: quizPassed,
          total_quiz_attempts: attempts,
          streak_count: streak,
          current_level: user.placementLevel || 'ጀማሪ (ደረጃ I)',
          placement_passed: passedPlacement
        });
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [user]);

  const getLevelDisplay = (level) => {
    if (!level) return 'ደረጃ I: መሰረታዊ ጸሐፊ';
    if (level.includes('ጀማሪ') || level.includes('beginner') || level.toLowerCase().includes('forest') || level.includes('ተባባሪ')) {
      return 'ደረጃ I: መሰረታዊ ጸሐፊ (Classical Foundations)';
    }
    if (level.includes('መካከለኛ') || level.includes('intermediate') || level.includes('ባለሙያ') || level.includes('ሲና')) {
      return 'ደረጃ II: የላቀ ተናጋሪ (Rhetorical Subjunctive)';
    }
    if (level.includes('ከፍተኛ') || level.includes('advanced') || level.includes('ተማሪ') || level.includes('ምሁር')) {
      return 'ደረጃ III: ዋና አርታዒ (Editorial Masterclass)';
    }
    return level || 'ደረጃ I: መሰረታዊ ጸሐፊ';
  };

  const getScoreDisplay = () => {
    if (!user || user.placementScore === undefined) return '0%';
    return `${user.placementScore}%`;
  };

  if (loading) {
    return (
      <div className="progress-loading-overlay min-h-screen bg-bone-100 flex flex-col items-center justify-center p-6">
        <div className="spinner-vintage"></div>
        <p className="font-serif italic text-forest-850 mt-4 text-sm animate-pulse">የጸሐፊውን የትምህርት ማስታወሻዎች በማዘጋጀት ላይ...</p>
        <style>{`
          .spinner-vintage {
            width: 40px;
            height: 40px;
            border: 3px double var(--color-bone-300);
            border-top: 3.5px solid var(--color-sienna-500);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone-100 p-4 sm:p-6 md:p-12 relative overflow-hidden parchment-grid">
      {/* Radiant warm background spots */}
      <div className="absolute top-[-5%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-forest-100/40 pointer-events-none filter blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-sienna-100/30 pointer-events-none filter blur-[100px]" />

      <div className="max-w-5xl mx-auto z-10 relative progress-app-container">
        
        {/* Navigation & Brand Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-bone-300 pb-5 mb-8 gap-4">
          <Link
            to="/dashboard"
            className="group flex items-center space-x-2.5 font-mono text-xs font-black uppercase tracking-wider text-sienna-600 hover:text-sienna-700 transition"
          >
            <ArrowLeft className="w-4 h-4 text-sienna-500 group-hover:-translate-x-1 transition-transform" />
            <span>ወደ ዳሽቦርድ ተመለስ</span>
          </Link>
          
          <div className="flex items-center space-x-2 text-forest-800 font-mono text-[10px] tracking-widest uppercase font-bold">
            <span className="w-1.5 h-1.5 bg-forest-550 rounded-full animate-ping" />
            <span>ክፍል 03: የግል የጥናት መዛግብት</span>
          </div>
        </header>

        {/* Hero Section */}
        <div className="progress-hero mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-sienna-150 text-sienna-900 rounded-full font-mono text-[10px] tracking-widest uppercase font-black px-4 py-1.5 mb-4 border border-sienna-200/50 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-sienna-600 animate-pulse" />
            <span>የችሎታ እቅድ</span>
          </div>
          <h1 className="progress-title text-4xl md:text-5xl lg:text-5xl font-serif font-black text-forest-900 tracking-tight leading-none mb-3">
            የመማር እድገትዎ
          </h1>
          <p className="progress-subtitle text-sm md:text-base font-sans font-medium text-forest-700 max-w-2xl leading-relaxed">
            በቋንቋዎች ጎዳና ላይ ጉዞዎን ይከታተሉ፣ የመማር ልማዶችዎን ይቆጣጠሩ እና የላቁ የአካዳሚክ ስኬቶችን ይመዝግቡ።
          </p>
        </div>

        {/* Current Level Card */}
        <div className="current-level-box mb-8 p-6 md:p-8 rounded-2xl border border-bone-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-forest-150/20 rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-forest-900 rounded-2xl flex items-center justify-center text-bone-100 border border-forest-950 shadow-md">
              <GraduationCap className="w-7 h-7 text-sienna-400" />
            </div>
            <div>
              <p className="font-mono text-[9px] font-black uppercase tracking-widest text-sienna-600">ያለዎት የአሁኑ ማዕረግ</p>
              <h3 className="font-serif text-lg md:text-xl font-bold text-forest-950 mt-1">{getLevelDisplay(progress.current_level)}</h3>
              {!progress.placement_passed && (
                <p className="text-xs font-sans text-amber-700 font-semibold mt-1">⚠️ ሙሉውን ይዘት ለመክፈት የምደባ ፈተናውን ማጠናቀቅ አለብዎት።</p>
              )}
            </div>
          </div>
          
          <Link 
            to="/levels" 
            className="continue-button shrink-0 inline-flex items-center gap-2 px-5 py-3 font-serif font-bold text-sm bg-forest-900 hover:bg-forest-850 text-bone-50 rounded-xl border border-forest-950 shadow-xs transition-all active:scale-98"
          >
            <span>ትምህርቱን ቀጥል</span>
            <span className="text-xs">→</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-large-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="stat-large bg-white rounded-2xl border border-bone-300 p-5 shadow-xs">
            <div className="stat-header flex items-center justify-between mb-3">
              <span className="text-2xl">📚</span>
              <BookOpen className="w-4 h-4 text-forest-500" />
            </div>
            <p className="large-val text-2xl md:text-3xl font-serif font-black text-forest-950 leading-none mb-1">
              {progress.completed_lessons}
            </p>
            <p className="large-label font-mono text-[10px] font-extrabold text-forest-650 uppercase tracking-widest leading-none">
              ያለቁ ትምህርቶች
            </p>
          </div>

          <div className="stat-large bg-white rounded-2xl border border-bone-300 p-5 shadow-xs">
            <div className="stat-header flex items-center justify-between mb-3">
              <span className="text-2xl">🏆</span>
              <Award className="w-4 h-4 text-sienna-500" />
            </div>
            <p className="large-val text-2xl md:text-3xl font-serif font-black text-forest-950 leading-none mb-1">
              {progress.quizzes_passed}
            </p>
            <p className="large-label font-mono text-[10px] font-extrabold text-forest-650 uppercase tracking-widest leading-none">
              ያለፉ ፈተናዎች
            </p>
          </div>

          <div className="stat-large bg-white rounded-2xl border border-bone-300 p-5 shadow-xs">
            <div className="stat-header flex items-center justify-between mb-3">
              <span className="text-2xl">📊</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <p className="large-val text-2xl md:text-3xl font-serif font-black text-forest-950 leading-none mb-1">
              {getScoreDisplay()}
            </p>
            <p className="large-label font-mono text-[10px] font-extrabold text-forest-650 uppercase tracking-widest leading-none">
              አማካይ ውጤት
            </p>
          </div>

          <div className="stat-large bg-white rounded-2xl border border-bone-300 p-5 shadow-xs">
            <div className="stat-header flex items-center justify-between mb-3">
              <span className="text-2xl">🔥</span>
              <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
            <p className="large-val text-2xl md:text-3xl font-serif font-black text-forest-950 leading-none mb-1">
              {progress.streak_count}
            </p>
            <p className="large-label font-mono text-[10px] font-extrabold text-forest-650 uppercase tracking-widest leading-none">
              ተከታታይ ቀናት
            </p>
          </div>

        </div>

        {/* Center section layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Progress Card - Course Progress */}
          <div className="progress-content-card bg-white rounded-2xl border border-bone-300 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="card-header pb-3 mb-4 border-b border-dashed border-bone-250 flex justify-between items-center">
                <h3 className="font-serif font-bold text-forest-950 text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sienna-500" />
                  <span>የኮርስ ሂደት ሁኔታ</span>
                </h3>
                <span className="font-mono text-[9px] px-2 py-0.5 bg-forest-100 text-forest-800 rounded font-black uppercase">
                  ጥናት
                </span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-bone-50 rounded-xl border border-bone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-sm font-bold text-forest-900">ምዕራፍ 1: መሰረታዊ ጸሐፊ</span>
                    <span className="font-mono text-xs text-sienna-600 font-extrabold">{completedList.includes('lvl-1') ? '100% አልቋል' : '0%'}</span>
                  </div>
                  <div className="h-2 bg-bone-200 rounded-full overflow-hidden border border-bone-300">
                    <div className="h-full bg-forest-800 rounded-full transition-all" style={{ width: completedList.includes('lvl-1') ? '100%' : '0%' }} />
                  </div>
                </div>

                <div className="p-4 bg-bone-50 rounded-xl border border-bone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-sm font-bold text-forest-900">ምዕራፍ 2: የላቀ ተናጋሪ</span>
                    <span className="font-mono text-xs text-sienna-600 font-extrabold">{completedList.includes('lvl-2') ? '100% አልቋል' : (completedList.includes('lvl-1') ? '40% በሂደት ላይ' : '0%')}</span>
                  </div>
                  <div className="h-2 bg-bone-200 rounded-full overflow-hidden border border-bone-300">
                    <div className="h-full bg-sienna-500 rounded-full transition-all" style={{ width: completedList.includes('lvl-2') ? '100%' : (completedList.includes('lvl-1') ? '40%' : '0%') }} />
                  </div>
                </div>

                <div className="p-4 bg-bone-50 rounded-xl border border-bone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-sm font-bold text-forest-900">ምዕራፍ 3: ዋና አርታዒ</span>
                    <span className="font-mono text-xs text-sienna-600 font-extrabold">{completedList.includes('lvl-3') ? '100% አልቋል' : (completedList.includes('lvl-2') ? '20% በሂደት ላይ' : '0%')}</span>
                  </div>
                  <div className="h-2 bg-bone-200 rounded-full overflow-hidden border border-bone-300">
                    <div className="h-full bg-forest-950 rounded-full transition-all" style={{ width: completedList.includes('lvl-3') ? '100%' : (completedList.includes('lvl-2') ? '20%' : '0%') }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-dashed border-bone-200">
              <p className="text-[11px] font-sans text-forest-650 font-semibold italic text-center leading-relaxed">
                "ሰዋስውን ማወቅ የነጻነት መንገድ ነው::"
              </p>
            </div>
          </div>

          {/* Quiz Performance Panel */}
          <div className="progress-content-card bg-white rounded-2xl border border-bone-300 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="card-header pb-3 mb-4 border-b border-dashed border-bone-250 flex justify-between items-center">
                <h3 className="font-serif font-bold text-forest-950 text-base flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sienna-500" />
                  <span>የፈተና አፈጻጸም</span>
                </h3>
                <span className="font-mono text-[9px] px-2 py-0.5 bg-sienna-100 text-sienna-800 rounded font-black uppercase">
                  ፈተናዎች
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-bone-50 rounded-xl border border-bone-200">
                  <span className="font-sans text-xs font-semibold text-forest-750">ጠቅላላ የፈተና ሙከራዎች</span>
                  <span className="font-mono text-xs font-bold text-forest-950">{progress.total_quiz_attempts} ጊዜ</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-bone-50 rounded-xl border border-bone-200">
                  <span className="font-sans text-xs font-semibold text-forest-750">የተሳኩ ፈተናዎች</span>
                  <span className="font-mono text-xs font-bold text-emerald-700">{progress.quizzes_passed} ፈተና</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-bone-50 rounded-xl border border-bone-200">
                  <span className="font-sans text-xs font-semibold text-forest-750">የፈተናዎች ስኬት መጠን</span>
                  <span className="font-mono text-xs font-bold text-sienna-600">
                    {progress.total_quiz_attempts > 0 
                      ? Math.round((progress.quizzes_passed / progress.total_quiz_attempts) * 105) / 1.05 // Safeguard and scale dynamically
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link 
                to="/levels" 
                className="w-full py-2 bg-bone-100 hover:bg-bone-200 border border-bone-300 text-center font-mono text-[10px] font-black uppercase text-forest-900 rounded-lg block transition"
              >
                ተጨማሪ የፈተና ጥያቄዎችን ውሰድ
              </Link>
            </div>
          </div>

        </div>

        {/* Achievements Section */}
        <div className="achievements-card bg-white p-6 rounded-2xl border border-bone-300 shadow-xs mb-8">
          <div className="card-header pb-3 mb-5 border-b border-dashed border-bone-250 flex justify-between items-center">
            <h3 className="font-serif font-bold text-forest-950 text-base flex items-center gap-2 animate-pulse">
              <span>👑</span>
              <span>ስኬቶች እና ሽልማቶች</span>
            </h3>
            <span className="font-mono text-xs font-bold text-sienna-600">
              3 የተከፈቱ ስኬቶች
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-bone-50 rounded-xl border border-bone-250 flex items-start gap-3">
              <span className="text-xl">✍️</span>
              <div>
                <h4 className="font-serif text-sm font-bold text-forest-900">ቀዳሚ ጸሐፊ</h4>
                <p className="text-[10px] font-sans font-medium text-forest-650 mt-1 leading-relaxed">የመጀመሪያውን የሲና ምዕራፍ በተሳካ ሁኔታ አጠናቀዋል።</p>
              </div>
            </div>

            <div className="p-4 bg-bone-50 rounded-xl border border-bone-250 flex items-start gap-3">
              <span className="text-xl">🎓</span>
              <div>
                <h4 className="font-serif text-sm font-bold text-forest-900">ምሁራዊ ምዘና</h4>
                <p className="text-[10px] font-sans font-medium text-forest-650 mt-1 leading-relaxed">የቋንቋ ደረጃዎን ለመወሰን የምደባ ፈተናውን ወስደዋል።</p>
              </div>
            </div>

            <div className="p-4 bg-bone-50 rounded-xl border border-bone-250 flex items-start gap-3">
              <span className="text-xl">🔥</span>
              <div>
                <h4 className="font-serif text-sm font-bold text-forest-900 font-serif">ብርቱ ተማሪ</h4>
                <p className="text-[10px] font-sans font-medium text-forest-650 mt-1 leading-relaxed">ለንቁ የ7-ቀናት የጥናት ስትሪክ ታማኝነትዎን አሳይተዋል።</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer recommendation card */}
        <div className="banner-recommend p-6 bg-forest-950 rounded-2xl border border-bone-400 shadow-md text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-[-30px] right-[-30px] w-28 h-28 bg-sienna-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-bone-100 flex-shrink-0">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-bone-100">አዳዲስ ትምህርቶችን ለመጀመር ዝግጁ ነዎት?</h4>
              <p className="text-xs font-sans text-bone-300 font-medium mt-0.5">የምዕራፍ ኮርሶችን እና በይነተገናኝ የትርጉም ፈተናዎችን አሁን ያስሱ።</p>
            </div>
          </div>
          <Link 
            to="/levels" 
            className="px-5 py-2.5 bg-sienna-600 hover:bg-sienna-700 text-bone-50 border border-sienna-700 rounded-lg text-xs font-mono font-black uppercase shrink-0 tracking-wider shadow-sm transition"
          >
            አሁን ጀምር →
          </Link>
        </div>

      </div>

      {/* Embedded Beautiful Academic Scribe Style */}
      <style>{`
        /* Embedded custom stylings matching exact user specification */
        .parchment-grid {
          background-color: var(--color-bone-100);
          background-image: 
            radial-gradient(circle at 10% 20%, transparent 97%, rgba(26, 47, 29, 0.015) 97%, rgba(26, 47, 29, 0.015) 100%),
            linear-gradient(rgba(228, 218, 194, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(228, 218, 194, 0.15) 1px, transparent 1px);
          background-size: 80px 80px, 20px 20px, 20px 20px;
        }

        .progress-app-container {
          animation: progressSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes progressSlideUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Beautiful vintage-focused display elements */
        .current-level-box {
          position: relative;
          background: #ffffff;
          border: 1px solid var(--color-bone-300);
          box-shadow: 0 4px 15px rgba(27, 56, 31, 0.02);
          transition: all 0.3s ease;
        }

        .current-level-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--color-sienna-500);
        }

        .stat-large {
          position: relative;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stat-large::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 3px;
          background-color: transparent;
          transition: background-color 0.3s ease;
        }

        .stat-large:hover {
          transform: translateY(-4px);
          border-color: var(--color-sienna-505);
          box-shadow: 0 12px 24px -4px rgba(27, 56, 31, 0.08);
        }

        .stat-large:hover::after {
          background-color: var(--color-sienna-500);
        }

        /* Responsive text style */
        .progress-title {
          line-height: 1.15;
          letter-spacing: -0.01em;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.02);
        }

        /* Progress content cards style */
        .progress-content-card {
          border: 1px solid var(--color-bone-300);
          transition: hover 0.3s ease;
        }

        .progress-content-card:hover {
          border-color: var(--color-bone-400);
        }

        /* Elegant banners design */
        .banner-recommend {
          position: relative;
        }

        .banner-recommend::before {
          content: '';
          position: absolute;
          top: 4px;
          left: 4px;
          right: 4px;
          bottom: 4px;
          border: 1px double rgba(253, 252, 249, 0.15);
          border-radius: 12px;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
