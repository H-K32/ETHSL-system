import { Link } from 'react-router-dom'
import useAsync from '../utils/useAsync'
import { getLevels } from '../api/lms'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import '../styles/levels.css'

// Custom pure SVG icon components (No lucide-react used)
const ArrowLeft = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
)

const Sparkles = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813zM18.251 5.251L18 8l-.251-2.749L15 5l2.749-.251L18 2l.251 2.749L21 5l-2.749.251z" />
  </svg>
)

const BookOpen = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
)

const Clock = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Lock = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
)

const Compass = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0l2.25-6.75L12 12l2.25-6.75L12 12z" />
  </svg>
)

const Award = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.561 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
)

const ChevronRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
)

export default function Levels() {
  const { data, loading, error, reload } = useAsync(getLevels, [])

  if (loading) return <Spinner />
  if (error) return <div className="max-w-5xl mx-auto px-4 py-10"><ErrorState error={error} onRetry={reload} /></div>
  const levels = Array.isArray(data) ? data : []

  // Count unlocked levels for progress metrics
  const unlockedCount = levels.filter(l => l.unlocked).length
  const totalCount = levels.length
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0

  // Curated additional metadata mapped dynamically to levels
  const premiumMetaMap = {
    "lvl-1": {
      roman: "I",
      difficulty: "መሰረታዊ ጸሐፊ",
      time: "የ4 ሰዓታት ጥናት",
      focus: "አገባብ እና ትህትና",
      quote: "ዘይቤ የሰው ልጅ መንፈስ ፊርማ ነው።"
    },
    "lvl-2": {
      roman: "II",
      difficulty: "የላቀ ተናጋሪ",
      time: "የ6 ሰዓታት ጥናት",
      focus: "ግልጽነት እና የስሜት ሁኔታዎች",
      quote: "ብዕር የግዛቶች ገዥ ነው።"
    },
    "lvl-3": {
      roman: "III",
      difficulty: "ዋና አርታዒ",
      time: "የ10 ሰዓታት ዝግጅት",
      focus: "ክላሲካል ስብስብ",
      quote: "ያለ ፍርሃት ጻፍ፣ ያለ ምህረት አርም::"
    }
  }

  return (
    <div className="min-h-screen parchment-grid p-4 sm:p-6 md:p-12 relative overflow-hidden">
      {/* Radiant atmospheric warm background spots */}
      <div className="absolute top-[-5%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-forest-100/40 pointer-events-none filter blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-sienna-100/30 pointer-events-none filter blur-[100px]" />

      <div className="max-w-5xl mx-auto z-10 relative">
        
        {/* Top Header Row with Return Key & Vintage metadata */}
        <header className="flex items-center justify-between border-b border-bone-300 pb-5 mb-8">
          <Link
            to="/dashboard"
            className="group flex items-center space-x-2.5 font-mono text-xs font-black uppercase tracking-wider text-sienna-600 hover:text-sienna-700 transition"
          >
            <ArrowLeft className="w-4 h-4 text-sienna-500 group-hover:-translate-x-1.5 transition-transform" />
            <span>የጸሐፊ ዳሽቦርድ</span>
          </Link>
          
          <div className="flex items-center space-x-2 text-forest-800 font-mono text-[10px] tracking-widest uppercase font-bold">
            <span className="w-1.5 h-1.5 bg-forest-500 rounded-full animate-ping" />
            <span>የስርዓተ-ትምህርት ማትሪክስ V.3</span>
          </div>
        </header>

        {/* Hero Section styled like an elegant old literary prospectus */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-sienna-100 text-sienna-800 rounded-full font-mono text-[10px] tracking-widest uppercase font-black px-4 py-1.5 mb-4 border border-sienna-200/50 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sienna-600" />
            <span>የተዋቀረ መንገድ</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-forest-900 tracking-tight leading-none mb-4">
            የቅልጥፍና ደረጃዎች
          </h1>
        </div>

        {/* Beautiful Compact Score & Progress Overview Card */}
        <div className="bg-bone-50 rounded-2xl border border-bone-300 p-6 mb-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-forest-100/20 rounded-full filter blur-xl pointer-events-none" />
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-forest-900 rounded-xl flex items-center justify-center text-bone-100">
              <Compass className="w-6 h-6 text-sienna-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-forest-900">አካዳሚያዊ እድገት</h3>
              <p className="text-xs font-sans text-forest-600 font-medium">የተከፈቱት ደረጃዎች ንቁ የሆኑ የትምህርት አቅሞችን ይወስናሉ።</p>
            </div>
          </div>
          
          <div className="w-full md:w-80">
            <div className="flex justify-between items-center mb-1.5 text-xs font-mono font-black text-forest-850 tracking-wide">
              <span>የመንገድ መለኪያዎች</span>
              <span>{unlockedCount} / {totalCount} ንቁ ደረጃዎች</span>
            </div>
            <div className="h-2 bg-bone-200 rounded-full overflow-hidden border border-bone-300">
              <div 
                className="h-full bg-sienna-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interactive, Visual Roadmap Pathway Cards Header */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <h2 className="font-serif text-2xl font-black text-forest-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-sienna-500" />
            <span>የስርዓተ-ትምህርት ፍሰት</span>
          </h2>
          <span className="font-mono text-[10px] text-rose-700 font-extrabold tracking-widest uppercase">
            የካርታ ትስስር መስመሮች በርተዋል
          </span>
        </div>

        {/* Levels Grid with premium visual updates */}
        {levels.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="ዝርዝሮች አልተገኙም" hint="ለመጀመር በቅርቡ ይመለሱ።" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 levels-grid">
            {levels.map((l, index) => {
              const locked = !Boolean(l.unlocked)
              const customMeta = premiumMetaMap[l.id] || {
                roman: String(index + 1),
                difficulty: "ጥንታዊ ተማሪ",
                time: "ተለዋዋጭ የጥናት ጊዜ",
                focus: "የአርትዖት ስብስብ",
                quote: "መጻፍ ማለት ማሰብን የሚታይ ማድረግ ነው።"
              }

              const Card = (
                <div 
                  className={`level-card h-full flex flex-col justify-between ${
                    locked 
                      ? 'locked opacity-80 cursor-not-allowed border-dashed' 
                      : 'unlocked shadow-lg bg-white hover:border-sienna-550'
                  }`}
                >
                  {/* Big Stylized Roman Numeral Backdrop */}
                  <div className="roman-watermark">
                    {customMeta.roman}
                  </div>

                  <div>
                    {/* Header bar */}
                    <div className="flex items-center justify-between mb-5 z-10 relative">
                      <span 
                        className={`level-badge px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold flex items-center gap-1.5 ${
                          locked 
                            ? 'locked' 
                            : 'unlocked'
                        }`}
                      >
                        <BookOpen className="w-3 h-3 text-sienna-500" />
                        <span>ምዕራፍ {l.order ?? index + 1}</span>
                      </span>
                      {locked ? (
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-bone-400 bg-bone-200 px-2 py-0.5 rounded flex items-center gap-1 border border-bone-300">
                          <Lock className="w-2.5 h-2.5 text-bone-450" /> የተቆለፈ
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-forest-800 bg-forest-100 px-2 py-0.5 rounded border border-forest-200">
                          ንቁ
                        </span>
                      )}
                    </div>
                    
                    {/* Level Title */}
                    <div className="z-10 relative">
                      <h3 className="level-title mb-2 text-xl md:text-2xl font-serif font-black leading-tight text-forest-950">
                        {l.display_name || l.name}
                      </h3>
                      
                      {/* Difficulty Level Tag */}
                      <div className="flex items-center gap-1.5 mt-1.5 mb-3">
                        <span className="text-[10px] font-mono uppercase tracking-widest font-black text-sienna-600">
                          {customMeta.difficulty}
                        </span>
                        <span className="text-bone-400 text-xs">•</span>
                        <span className="text-[10px] font-mono text-forest-600 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {customMeta.time}
                        </span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    {l.description && (
                      <p className="level-desc leading-relaxed text-sm text-forest-800 font-sans font-medium mb-5 z-10 relative">
                        {l.description}
                      </p>
                    )}
                  </div>

                  {/* Call to action card footer */}
                  <div className="mt-6 pt-4 border-t border-dashed border-bone-300 flex items-center justify-between z-10 relative">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono font-black uppercase text-bone-400 leading-none">
                        የደረጃዎች ኮምፓስ
                      </span>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-forest-800 mt-0.5">
                        {locked ? 'የተቆለፈ ትምህርት' : 'ጉዞውን ጀምር'}
                      </span>
                    </div>
                    <span className="w-9 h-9 rounded-full bg-bone-200 flex items-center justify-center transition-colors duration-200 level-arrow-circle border border-bone-300">
                      <ChevronRight className="w-5 h-5 text-forest-800 transform transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              )
              
              return locked ? (
                <div key={l.id} className="relative select-none cursor-not-allowed group animate-fade-in">
                  {/* Floating informative tooltip overlay on locked levels */}
                  <div className="absolute inset-0 bg-bone-900/5 backdrop-blur-[0.5px] rounded-3xl z-20 pointer-events-none transition-all duration-300 group-hover:bg-bone-900/10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-forest-950 text-bone-100 px-4 py-2 rounded-xl border border-sienna-600 shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 flex items-center gap-2 pointer-events-none whitespace-nowrap">
                    <Lock className="w-3.5 h-3.5 text-sienna-450 animate-bounce" />
                    <span className="font-mono text-[10px] font-extrabold uppercase">የቀደመውን ክፍል ሲያጠናቅቁ ይከፈታል</span>
                  </div>
                  {Card}
                </div>
              ) : (
                <Link key={l.id} to={`/courses/${l.id}`} className="block h-full group">
                  {Card}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
