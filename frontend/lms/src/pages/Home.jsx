import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/home.css'
export default function Home() {
  const { user } = useAuth()
  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
            ETHSL Learner Platform
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
            Learn at your level.<br className="hidden md:block" /> Progress at your pace.
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-slate-600 text-lg">
            Take a placement test, unlock courses by level, and track every lesson and quiz in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {user ? (
              <Link to="/levels" className="px-5 py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700">
                Continue learning
              </Link>
            ) : (
              <>
                <Link to="/register" className="px-5 py-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700">
                  Get started
                </Link>
                <Link to="/login" className="px-5 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
        {[
          { t: 'Smart placement', d: 'A short quiz places you at the right starting level.' },
          { t: 'Structured levels', d: 'Levels unlock courses, courses unlock lessons.' },
          { t: 'Track everything', d: 'Lesson completion, quiz scores, and overall progress.' },
        ].map((f) => (
          <div key={f.t} className="rounded-xl bg-white border border-slate-200 p-6">
            <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 grid place-items-center font-bold">★</div>
            <h3 className="mt-4 font-semibold text-slate-900">{f.t}</h3>
            <p className="text-sm text-slate-600 mt-1">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
          <ol className="mt-8 grid md:grid-cols-4 gap-6 text-left">
            {['Create an account', 'Take placement', 'Unlock levels & courses', 'Complete lessons & quizzes'].map((s, i) => (
              <li key={s} className="rounded-lg bg-slate-800 p-5">
                <div className="text-brand-500 font-bold">Step {i + 1}</div>
                <div className="mt-1 font-medium">{s}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
