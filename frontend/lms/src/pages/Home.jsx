import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import '../styles/home.css'

export default function Home() {
  const { user } = useAuth()
  const { t, toggleLanguage, lang } = useLanguage()

  return (
    <div className="home">

      {/* NAVIGATION */}
      <header className="navbar">
        <div className="hero__brand">
          ETHSL<span>°</span>
        </div>

        <nav className="navLinks">
          <a href="#about">{lang === 'am' ? 'ስለ' : 'About'}</a>
          <a href="#why">{lang === 'am' ? 'ለምን ETHSL' : 'Why ETHSL'}</a>
          <a href="#features">{lang === 'am' ? 'ባህሪዎች' : 'Features'}</a>
          <a href="#how">{lang === 'am' ? 'እንዴት ይሠራል' : 'How It Works'}</a>
          <a href="#benefits">{lang === 'am' ? 'ጥቅሞች' : 'Benefits'}</a>
          <a href="#faq">{lang === 'am' ? 'ፍ.ጎ.ሙ' : 'FAQ'}</a>
          <a href="#contact">{lang === 'am' ? 'ያናግሩን' : 'Contact'}</a>
        </nav>

        <div className="navActions">
          <button 
            onClick={toggleLanguage}
            className="language-toggle"
            style={{
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              marginRight: '16px'
            }}
          >
            {lang === 'en' ? 'አማርኛ' : 'English'}
          </button>
          
          {user ? (
            <Link to="/levels" className="btn primary">
              {t('dashboard')}
            </Link>
          ) : (
            <>
              <Link to="/login" className="navLogin">
                {lang === 'am' ? 'ይግቡ' : 'Login'}
              </Link>

              <Link to="/register" className="btn primary">
                {lang === 'am' ? 'ይመዝገቡ' : 'Register'}
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="hero">
        <div className="hero__content">
          <div className="hero__badge">
            <span className="dot" />
            {lang === 'am' ? 'የኢትዮጵያ የምልክት ቋንቋ ነቢርነት ይማሩ' : 'Learn Ethiopian Sign Language visually'}
          </div>

          <h1 className="hero__title">
            {lang === 'am' ? 'የኢትዮጵያ የምልክት ቋንቋ ይማሩ' : 'Learn Ethiopian Sign Language'}
            <br />
            <em>{lang === 'am' ? 'ዘመናዊ መንገድ።' : 'the modern way.'}</em>
          </h1>

          <p className="hero__subtitle">
            {lang === 'am' 
              ? 'መዋቅርያዊ, ገላጭ የመማር ዋንጫ በማመልከቻ ትምህርቶች, ግምገማዎች, እና ስር ደረጃ ከጀማሪ ወደ ጎበጣ ደረጃ የኢትዮጵያ የምልክት ቋንቋ ለማስተማር የተነደፈ።'
              : 'A structured, visual learning platform that helps learners master Ethiopian Sign Language through engaging lessons, assessments, and guided progression from beginner to advanced levels.'
            }
          </p>

          <div className="hero__actions">
            {user ? (
              <Link to="/levels" className="btn primary">
                {t('continueL')}
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn primary">
                  {lang === 'am' ? 'ይጀምሩ →' : 'Get Started →'}
                </Link>

                <Link to="/login" className="btn ghost">
                  {lang === 'am' ? 'ይግቡ' : 'Sign In'}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section split">
        <div>
          <h2>{lang === 'am' ? 'ETHSL ምንድነው?' : 'What is ETHSL?'}</h2>

          <p>
            {lang === 'am'
              ? 'ETHSL (Ethiopian Sign Language Tutor) የኢትዮጵያ የምልክት ቋንቋ ትምህርትን ለሁሉም ሰው ተደራሽ፣ አስገራሚ እና ውጤታማ ለማድረግ የተነደፈ ፈጠራ ዋንጫ ነው። በመዋቅርያዊ ትምህርቶች፣ ምስላዊ ሞገሶች, እና ደረጃ የተጠቆመ የመማር መንገዶች, ተጠቃሚዎች ራሳቸው ሳቢያ ሓሳባቸውን ወይም ሆነ በእርሳየም መስሪያ ችሎታዎች ሊገብዩ ይችላሉ።'
              : 'ETHSL (Ethiopian Sign Language Tutor) is an innovative learning platform designed to make Ethiopian Sign Language education accessible, engaging, and effective for everyone. Through structured lessons, visual demonstrations, and guided learning pathways, users can build communication skills at their own pace.'
            }
          </p>
        </div>

        <div className="card">
          <h3>{lang === 'am' ? 'ለሁሉም ይህ የተገነባ' : 'Built for Everyone'}</h3>

          <p>
            {lang === 'am'
              ? 'ተማሪዎች፣ አስተማሪዎች፣ ወላጆች, ሙያተኞች, እና በሚያገናኙት ግንኙነት ላይ ፍላጎት ያላቸው ማንም ሰው ETHSL በኩል የኢትዮጵያ የምልክት ቋንቋ ከመማር ሊጠቀም ይችላሉ።'
              : 'Students, teachers, parents, professionals, and anyone interested in inclusive communication can benefit from learning Ethiopian Sign Language through ETHSL.'
            }
          </p>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section id="why" className="section">
        <h2 className="center">
          {lang === 'am' ? 'ለምን ETHSL ይምረጡ?' : 'Why Choose ETHSL?'}
        </h2>

        <div className="grid3">
          <div className="featureCard">
            <h3>🎥 {lang === 'am' ? 'ንቢር ማመልከቻ' : 'Visual Learning'}</h3>

            <p>
              {lang === 'am'
                ? 'ምልክቶችን በግልጽ ምስላዊ ሞገሶች በኩል ይማሩ ይህም ማመልከቻ ምስላዊ ከዎ ብራት ይሠራ።'
                : 'Learn signs through clear visual demonstrations that make learning intuitive and memorable.'
              }
            </p>
          </div>

          <div className="featureCard">
            <h3>📚 {lang === 'am' ? 'መዋቅርያዊ ደረጃዎች' : 'Structured Levels'}</h3>

            <p>
              {lang === 'am'
                ? 'በጥንቃቄ የተነደፈ ደረጃዎች በኩል ወሰንከሮ ብራታና ሙያትን መገንባት ይችላሉ።'
                : 'Progress through carefully designed levels that help build confidence and mastery over time.'
              }
            </p>
          </div>

          <div className="featureCard">
            <h3>📈 {lang === 'am' ? 'እድገት ክትትል' : 'Progress Tracking'}</h3>

            <p>
              {lang === 'am'
                ? 'ትምህርት ማጠናቀቂያ, የፈተና ውጤቶች, እና የመማር ስኬቶች ሙሉ ጉዞዎ ክትትል ተደርገ ይሠራ።'
                : 'Monitor lesson completion, quiz results, and learning achievements throughout your journey.'
              }
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section dark">
        <h2 className="center">
          {lang === 'am' ? 'ዋንጫ ባህሪዎች' : 'Platform Features'}
        </h2>

        <div className="grid2">
          <div className="featureWide">
            🎥 {lang === 'am' ? 'ቪዴዮ ላይ ተሠራ ትምህርቶች' : 'Video-Based Lessons'}
          </div>

          <div className="featureWide">
            🧠 {lang === 'am' ? 'ተስተ ግምገማዎች' : 'Interactive Assessments'}
          </div>

          <div className="featureWide">
            📊 {lang === 'am' ? 'እድገት ክትትል' : 'Progress Tracking'}
          </div>

          <div className="featureWide">
            🔓 {lang === 'am' ? 'ደረጃ ክፈት ስርዓት' : 'Level Unlock System'}
          </div>

          <div className="featureWide">
            🔍 {lang === 'am' ? 'ትምህርት ግኝታ' : 'Lesson Discovery'}
          </div>

          <div className="featureWide">
            🌍 {lang === 'am' ? 'ተደራሽ ማመልከቻ' : 'Accessible Learning'}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section">
        <h2 className="center">
          {lang === 'am' ? 'እንዴት ይሠራል' : 'How It Works'}
        </h2>

        <div className="steps">

          <div className="step">
            <span>01</span>
            <p>{lang === 'am' ? 'ሂሳብ ፍጠር' : 'Create an Account'}</p>
          </div>

          <div className="step">
            <span>02</span>
            <p>{lang === 'am' ? 'ደረጃ ግምገማ ውሰድ' : 'Take Placement Assessment'}</p>
          </div>

          <div className="step">
            <span>03</span>
            <p>{lang === 'am' ? 'ትምህርቶች መማር ይጀምር' : 'Start Learning Lessons'}</p>
          </div>

          <div className="step">
            <span>04</span>
            <p>{lang === 'am' ? 'እድገት ክትትል እና ማሻሻል' : 'Track Progress & Improve'}</p>
          </div>

        </div>
      </section>

      {/* BENEFITS */}
      <section
        id="benefits"
        className="section split reverse"
      >
        <div className="card">
          <h3>{lang === 'am' ? 'ሚያገናኙ ግንኙነት' : 'Inclusive Communication'}</h3>

          <p>
            {lang === 'am'
              ? 'የኢትዮጵያ የምልክት ቋንቋ ግንኙነት ክፍተቶች ለመዝጋት ይረዳ ይህም ለሰምተኛ ተጠቃሚ ሰዎች እና ማህበረሰብ ውስጥ ተደራሽነት ሊያስጠነግድ ይችላል።'
              : 'Ethiopian Sign Language helps bridge communication gaps and promotes accessibility for individuals with hearing impairments and the wider community.'
            }
          </p>
        </div>

        <div>
          <h2>
            {lang === 'am' ? 'የኢትዮጵያ የምልክት ቋንቋ ለምን ይማሩ?' : 'Why Learn Ethiopian Sign Language?'}
          </h2>

          <p>
            {lang === 'am'
              ? 'የምልክት ቋንቋ ማወቅ ግንኙነት ይጠነካራ ይህም ሚያገናኙነት ሲሠራ ፍትሐዊ ዕድሎች ሲደገሙ እና ማህበረሰብ ውስጥ ተሳታፊነት እና ግንኙነት ብቅበቱ አስኪያዊ ሰላም።'
              : 'Learning sign language strengthens communication, promotes inclusion, supports equal opportunities, and helps create a society where everyone can participate and connect effectively.'
            }
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <h2 className="center">
          {lang === 'am' ? 'በተደጋጋሚ የሚነሱ ጥያቄዎች' : 'Frequently Asked Questions'}
        </h2>

        <div className="faq">

          <div>
            <h4>{lang === 'am' ? 'ቀዳሚ ልምምድ ያስፈልገ?' : 'Do I need prior experience?'}</h4>

            <p>
              {lang === 'am'
                ? 'አይ። ETHSL ለጀማሪዎች እና ሁሉም ደረጃ ተማሪዎች ሊታወቅ ይገባ።'
                : 'No. ETHSL is designed for beginners and learners of all skill levels.'
              }
            </p>
          </div>

          <div>
            <h4>{lang === 'am' ? 'ዋንጫ ነፃ ነው?' : 'Is the platform free?'}</h4>

            <p>
              {lang === 'am'
                ? 'አዎ። ተማሪዎች ትምህርታዊ መሳሪያዎች ከወጭ ያለ ሊደርሱ ይችላሉ።'
                : 'Yes. Learners can access educational resources and begin learning without cost.'
              }
            </p>
          </div>

          <div>
            <h4>{lang === 'am' ? 'በሞባይል መሳሪያ ሊማሩ ይችላሉ?' : 'Can I learn on mobile devices?'}</h4>

            <p>
              {lang === 'am'
                ? 'ስሌት። ETHSL በገንዘቦች, ታብሌቶች, እና ስማርትፎኖች ላይ ይሠራ።'
                : 'Absolutely. ETHSL works on desktops, tablets, and smartphones.'
              }
            </p>
          </div>

        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section contact">

        <h2>{lang === 'am' ? 'ያናግሩን' : 'Contact Us'}</h2>

        <p>
          {lang === 'am'
            ? 'ጥያቄዎች, ሃሳቦች, ወይም አስተያየት አለደርሳ?'
            : 'Have questions, suggestions, or feedback?'
          }
        </p>

        <p>
          {lang === 'am'
            ? 'ከእናንተ ድምጸ እና ማግኘት ይፈልጋሉ።'
            : "We'd love to hear from you."
          }
        </p>

        <a
          href="mailto:support@ethsl.edu.et"
          className="btn primary"
        >
          support@ethsl.edu.et
        </a>

      </section>

    </div>
  )
}