import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/home.css'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <header className="hero__top">
          <div className="hero__brand">ETHSL<span>°</span></div>
          <div className="hero__meta">Learner Platform — Est. 2025</div>
        </header>

        <div className="hero__main">
          <div className="hero__eyebrow">
            <span className="dot" /> Now enrolling
          </div>

          <h1 className="hero__title">
            Learn at your <em>level.</em><br />
            Progress at your <em>pace.</em>
          </h1>

          <div className="hero__bottom">
            <p className="hero__lede">
              A short placement test, courses that unlock as you grow, and a clear record of every lesson and quiz you complete.
            </p>
            <div className="hero__actions">
              {user ? (
                <Link to="/levels" className="btn btn--primary">Continue learning →</Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn--primary">Get started →</Link>
                  <Link to="/login" className="btn btn--link">Login</Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hero__rule" />
      </section>

      {/* FEATURES */}
      <section className="features">
        <aside className="features__aside">
          <div className="features__index">Index — 01</div>
          <h2 className="features__title">A platform that respects your time.</h2>
          <p className="features__note">
            Three principles shape every lesson, every quiz, and every page you'll see.
          </p>
        </aside>

        <div className="features__list">
          {[
            { n: '01', t: 'Smart placement', d: 'A short quiz places you at the right starting level — no guessing, no wasted hours.' },
            { n: '02', t: 'Structured levels', d: 'Levels unlock courses, courses unlock lessons. Always a clear next step.' },
            { n: '03', t: 'Track everything', d: 'Lesson completion, quiz scores, and overall progress in one calm dashboard.' },
          ].map((f) => (
            <article key={f.t} className="feature">
              <div className="feature__num">{f.n}</div>
              <div className="feature__body">
                <h3 className="feature__title">{f.t}</h3>
                <p className="feature__desc">{f.d}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <div className="how__inner">
          <div className="how__head">
            <span className="how__index">Index — 02</span>
            <h2 className="how__title">
              How it <em>works.</em>
            </h2>
          </div>

          <ol className="how__steps">
            {['Create an account', 'Take placement', 'Unlock levels & courses', 'Complete lessons & quizzes'].map((s, i) => (
              <li key={s} className="step">
                <div className="step__num">{String(i + 1).padStart(2, '0')}</div>
                <div className="step__text">{s}</div>
              </li>
            ))}
          </ol>

          <div className="how__cta">
            {!user && (
              <Link to="/register" className="btn btn--cream">Begin your placement →</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
