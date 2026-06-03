import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import '../styles/home.css'

export default function Home() {
  const { user } = useAuth()
  const { t, lang, toggleLanguage } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)
  const dropRef = useRef(null)

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setLangOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectLang = (selected) => {
    setLangOpen(false)
    if (selected !== lang) toggleLanguage()
  }

  return (
    <div className="home">

      {/* NAVIGATION */}
      <header className="navbar">
        <div className="hero__brand">
          ETHSL<span>°</span>
        </div>

        <nav className="navLinks">
          <a href="#about">{t('homeAbout')}</a>
          <a href="#why">{t('homeWhyEthsl')}</a>
          <a href="#features">{t('homeFeatures')}</a>
          <a href="#how">{t('homeHowItWorks')}</a>
          <a href="#benefits">{t('homeBenefits')}</a>
          <a href="#faq">{t('homeFaq')}</a>
          <a href="#contact">{t('homeContact')}</a>
        </nav>

        <div className="navActions">
          <div className="lang-switcher" ref={dropRef}>
            <button className="lang-btn" onClick={() => setLangOpen(o => !o)} aria-label="Select language">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>{lang === 'am' ? 'አማ' : 'EN'}</span>
              <svg className={`lang-chevron${langOpen ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                <button className={`lang-option${lang === 'en' ? ' active' : ''}`} onClick={() => selectLang('en')}>
                  <span>🇬🇧</span> English
                </button>
                <button className={`lang-option${lang === 'am' ? ' active' : ''}`} onClick={() => selectLang('am')}>
                  <span>🇪🇹</span> አማርኛ
                </button>
              </div>
            )}
          </div>

          {user ? (
            <Link to="/levels" className="btn primary">
              {t('dashboard')}
            </Link>
          ) : (
            <>
              <Link to="/login" className="navLogin">
                {t('homeLogin')}
              </Link>
              <Link to="/register" className="btn primary">
                {t('homeRegister')}
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
            {t('learnEsl')}
          </div>

          <h1 className="hero__title">
            {t('homeHeroTitle')}
            <br />
            <em>{t('homeHeroEm')}</em>
          </h1>

          <p className="hero__subtitle">{t('homeHeroSubtitle')}</p>

          <div className="hero__actions">
            {user ? (
              <Link to="/levels" className="btn primary">
                {t('continueL')}
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn primary">
                  {t('homeGetStarted')}
                </Link>
                <Link to="/login" className="btn ghost">
                  {t('homeSignIn')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section split">
        <div>
          <h2>{t('homeWhatIsEthsl')}</h2>
          <p>{t('homeAboutDesc')}</p>
        </div>

        <div className="card">
          <h3>{t('homeBuiltForAll')}</h3>
          <p>{t('homeBuiltForAllDesc')}</p>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section id="why" className="section">
        <h2 className="center">{t('homeWhyChoose')}</h2>

        <div className="grid3">
          <div className="featureCard">
            <h3>🎥 {t('homeVisualLearning')}</h3>
            <p>{t('homeVisualDesc')}</p>
          </div>

          <div className="featureCard">
            <h3>📚 {t('homeStructuredLevels')}</h3>
            <p>{t('homeStructuredDesc')}</p>
          </div>

          <div className="featureCard">
            <h3>📈 {t('homeProgressTracking')}</h3>
            <p>{t('homeProgressDesc')}</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section dark">
        <h2 className="center">{t('homePlatformFeatures')}</h2>

        <div className="grid2">
          <div className="featureWide">🎥 {t('homeVideoLessons')}</div>
          <div className="featureWide">🧠 {t('homeInteractiveAssessments')}</div>
          <div className="featureWide">📊 {t('homeProgressTracking')}</div>
          <div className="featureWide">🔓 {t('homeLevelUnlock')}</div>
          <div className="featureWide">🔍 {t('homeLessonDiscovery')}</div>
          <div className="featureWide">🌍 {t('homeAccessibleLearning')}</div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section">
        <h2 className="center">{t('homeHowTitle')}</h2>

        <div className="steps">
          <div className="step"><span>01</span><p>{t('homeStep1')}</p></div>
          <div className="step"><span>02</span><p>{t('homeStep2')}</p></div>
          <div className="step"><span>03</span><p>{t('homeStep3')}</p></div>
          <div className="step"><span>04</span><p>{t('homeStep4')}</p></div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="section split reverse">
        <div className="card">
          <h3>{t('homeInclusiveComm')}</h3>
          <p>{t('homeInclusiveDesc')}</p>
        </div>

        <div>
          <h2>{t('homeWhyLearn')}</h2>
          <p>{t('homeWhyLearnDesc')}</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <h2 className="center">{t('homeFaqTitle')}</h2>

        <div className="faq">
          <div>
            <h4>{t('homeFaq1Q')}</h4>
            <p>{t('homeFaq1A')}</p>
          </div>
          <div>
            <h4>{t('homeFaq2Q')}</h4>
            <p>{t('homeFaq2A')}</p>
          </div>
          <div>
            <h4>{t('homeFaq3Q')}</h4>
            <p>{t('homeFaq3A')}</p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section contact">
        <h2>{t('homeContactTitle')}</h2>
        <p>{t('homeContactDesc')}</p>
        <p>{t('homeContactDesc2')}</p>
        <a href="mailto:support@ethsl.edu.et" className="btn primary">
          support@ethsl.edu.et
        </a>
      </section>

    </div>
  )
}
