import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/home.css'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home">

      {/* NAVIGATION */}
      <header className="navbar">
        <div className="hero__brand">
          ETHSL<span>°</span>
        </div>

        <nav className="navLinks">
          <a href="#about">About</a>
          <a href="#why">Why ETHSL</a>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#benefits">Benefits</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="navActions">
          {user ? (
            <Link to="/levels" className="btn primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="navLogin">
                Login
              </Link>

              <Link to="/register" className="btn primary">
                Register
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
            Learn Ethiopian Sign Language visually
          </div>

          <h1 className="hero__title">
            Learn Ethiopian Sign Language
            <br />
            <em>the modern way.</em>
          </h1>

          <p className="hero__subtitle">
            A structured, visual learning platform that helps learners
            master Ethiopian Sign Language through engaging lessons,
            assessments, and guided progression from beginner to
            advanced levels.
          </p>

          <div className="hero__actions">
            {user ? (
              <Link to="/levels" className="btn primary">
                Continue Learning →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn primary">
                  Get Started →
                </Link>

                <Link to="/login" className="btn ghost">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section split">
        <div>
          <h2>What is ETHSL?</h2>

          <p>
            ETHSL (Ethiopian Sign Language Tutor) is an innovative
            learning platform designed to make Ethiopian Sign Language
            education accessible, engaging, and effective for everyone.
            Through structured lessons, visual demonstrations, and
            guided learning pathways, users can build communication
            skills at their own pace.
          </p>
        </div>

        <div className="card">
          <h3>Built for Everyone</h3>

          <p>
            Students, teachers, parents, professionals, and anyone
            interested in inclusive communication can benefit from
            learning Ethiopian Sign Language through ETHSL.
          </p>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section id="why" className="section">
        <h2 className="center">
          Why Choose ETHSL?
        </h2>

        <div className="grid3">
          <div className="featureCard">
            <h3>🎥 Visual Learning</h3>

            <p>
              Learn signs through clear visual demonstrations that
              make learning intuitive and memorable.
            </p>
          </div>

          <div className="featureCard">
            <h3>📚 Structured Levels</h3>

            <p>
              Progress through carefully designed levels that help
              build confidence and mastery over time.
            </p>
          </div>

          <div className="featureCard">
            <h3>📈 Progress Tracking</h3>

            <p>
              Monitor lesson completion, quiz results, and learning
              achievements throughout your journey.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section dark">
        <h2 className="center">
          Platform Features
        </h2>

        <div className="grid2">
          <div className="featureWide">
            🎥 Video-Based Lessons
          </div>

          <div className="featureWide">
            🧠 Interactive Assessments
          </div>

          <div className="featureWide">
            📊 Progress Tracking
          </div>

          <div className="featureWide">
            🔓 Level Unlock System
          </div>

          <div className="featureWide">
            🔍 Lesson Discovery
          </div>

          <div className="featureWide">
            🌍 Accessible Learning
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section">
        <h2 className="center">
          How It Works
        </h2>

        <div className="steps">

          <div className="step">
            <span>01</span>
            <p>Create an Account</p>
          </div>

          <div className="step">
            <span>02</span>
            <p>Take Placement Assessment</p>
          </div>

          <div className="step">
            <span>03</span>
            <p>Start Learning Lessons</p>
          </div>

          <div className="step">
            <span>04</span>
            <p>Track Progress & Improve</p>
          </div>

        </div>
      </section>

      {/* BENEFITS */}
      <section
        id="benefits"
        className="section split reverse"
      >
        <div className="card">
          <h3>Inclusive Communication</h3>

          <p>
            Ethiopian Sign Language helps bridge communication gaps
            and promotes accessibility for individuals with hearing
            impairments and the wider community.
          </p>
        </div>

        <div>
          <h2>
            Why Learn Ethiopian Sign Language?
          </h2>

          <p>
            Learning sign language strengthens communication,
            promotes inclusion, supports equal opportunities,
            and helps create a society where everyone can
            participate and connect effectively.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <h2 className="center">
          Frequently Asked Questions
        </h2>

        <div className="faq">

          <div>
            <h4>Do I need prior experience?</h4>

            <p>
              No. ETHSL is designed for beginners and learners
              of all skill levels.
            </p>
          </div>

          <div>
            <h4>Is the platform free?</h4>

            <p>
              Yes. Learners can access educational resources
              and begin learning without cost.
            </p>
          </div>

          <div>
            <h4>Can I learn on mobile devices?</h4>

            <p>
              Absolutely. ETHSL works on desktops, tablets,
              and smartphones.
            </p>
          </div>

        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section contact">

        <h2>Contact Us</h2>

        <p>
          Have questions, suggestions, or feedback?
          We'd love to hear from you.
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