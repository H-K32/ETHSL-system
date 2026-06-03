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
          <a href="#about">{t('homeAbout')}</a>
          <a href="#why">{t('homeWhyEthsl')}</a>
          <a href="#features">{t('homeFeatures')}</a>
          <a href="#how">{t('homeHowItWorks')}</a>
          <a href="#benefits">{t('homeBenefits')}</a>
          <a href="#faq">{t('homeFaq')}</a>
          <a href="#contact">{t('homeContact')}</a>
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
            {t('homeLangToggle')}
          </button>

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
