import useAsync from '../utils/useAsync.js'
import { getCurriculum } from '../api/lms.js'
import Spinner from '../components/Spinner.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import '../styles/curriculum.css'

/* ── icons ─────────────────────────────────────────────────── */
const ILock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)
const ICheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)
const ITrophy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H3V4h3m12 5h3V4h-3M6 9a6 6 0 0012 0M12 15v4m-4 2h8"/>
  </svg>
)
const IBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
)
const IQuiz = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
    <circle cx="12" cy="17" r=".5" fill="currentColor"/>
  </svg>
)

/* ── helpers ────────────────────────────────────────────────── */
function st(item) {
  if (item.completed) return 'done'
  if (item.unlocked)  return 'open'
  return 'lock'
}

// offset for lesson labels only; nodes stay vertically aligned
const ZZ = [28, -28]

export default function Curriculum() {
  const { data, loading, error, reload } = useAsync(getCurriculum, [])

  if (loading) return <Spinner />
  if (error)   return <ErrorState error={error} onRetry={reload} />

  const levels = Array.isArray(data) ? data : []
  const totalL = levels.reduce((a, l) => a + l.courses.reduce((b, c) => b + c.lessons.length, 0), 0)
  const doneL  = levels.reduce((a, l) => a + l.courses.reduce((b, c) => b + c.lessons.filter(ls => ls.completed).length, 0), 0)
  const pct    = totalL > 0 ? Math.round((doneL / totalL) * 100) : 0

  return (
    <div className="rp-page">

      {/* ── header ── */}
      <div className="rp-header">
        <div>
          <span className="rp-eyebrow">🗺️ Learning Roadmap</span>
          <h1 className="rp-title">Your Full Learning Path</h1>
          <p className="rp-sub">Every level, course, and lesson — your complete journey from start to certificate.</p>
        </div>
        <div className="rp-progress-box">
          <div className="rp-progress-row">
            <span>Overall Progress</span>
            <strong>{pct}%</strong>
          </div>
          <div className="rp-progress-track">
            <div className="rp-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="rp-progress-sub">{doneL} / {totalL} lessons completed</div>
        </div>
      </div>

      {levels.length === 0
        ? <EmptyState title="No curriculum available" hint="Check back soon." />
        : (
          <div className="rp-road">

            {levels.map((level, li) => {
              const lSt      = st(level)
              const isLast   = li === levels.length - 1
              const lvlTotal = level.courses.reduce((a, c) => a + c.lessons.length, 0)
              const lvlDone  = level.courses.reduce((a, c) => a + c.lessons.filter(l => l.completed).length, 0)
              const lvlPct   = lvlTotal > 0 ? Math.round((lvlDone / lvlTotal) * 100) : 0
              const certEarned = lvlPct === 100

              // flatten lessons with course info
              const allLessons = level.courses.flatMap((c, ci) =>
                c.lessons.map((l, lsi) => ({
                  ...l,
                  courseTitle: c.title,
                  courseState: st(c),
                  globalIdx: level.courses.slice(0, ci).reduce((a, x) => a + x.lessons.length, 0) + lsi,
                }))
              )

              return (
                <div key={level.id} className="rp-level-block">

                  {/* ── vertical connector from previous level ── */}
                  {li > 0 && (
                    <div className={`rp-vline rp-vline--${lSt === 'lock' ? 'lock' : 'open'}`} />
                  )}

                  {/* ══ LEVEL NODE ══ */}
                  <div className="rp-level-row">
                    <div className={`rp-level-node rp-level-node--${lSt}`}>
                      <span className="rp-level-icon">
                        {lSt === 'done' ? <ICheck /> : lSt === 'lock' ? <ILock /> : <IStar />}
                      </span>
                      <span className="rp-level-num">{level.order ?? li + 1}</span>
                      {lSt === 'open' && <span className="rp-pulse" />}
                    </div>

                    <div className={`rp-level-card rp-level-card--${lSt}`}>
                      <div className="rp-level-card-top">
                        <div>
                          <div className="rp-level-card-label">Level {level.order ?? li + 1}</div>
                          <div className="rp-level-card-name">{level.display_name || level.name}</div>
                        </div>
                        <div className="rp-level-card-badges">
                          {lSt === 'lock'    && <span className="rp-badge rp-badge--lock">🔒 Locked</span>}
                          {lSt === 'open'    && <span className="rp-badge rp-badge--open">▶ In Progress</span>}
                          {lSt === 'done'    && <span className="rp-badge rp-badge--done">✓ Completed</span>}
                          {level.has_quiz    && <span className="rp-badge rp-badge--quiz">📝 Quiz</span>}
                        </div>
                      </div>
                      {lSt !== 'lock' && (
                        <div className="rp-level-card-prog">
                          <div className="rp-bar"><div className="rp-bar-fill" style={{ width: `${lvlPct}%` }} /></div>
                          <span>{lvlPct}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ══ COURSES + LESSONS ══ */}
                  <div className="rp-indent">

                    {/* left branch line from level node down */}
                    <div className={`rp-branch-line rp-branch-line--${lSt === 'lock' ? 'lock' : 'open'}`} />

                    <div className="rp-courses">
                      {level.courses.map((course, ci) => {
                        const cSt    = st(course)
                        const cTotal = course.lessons.length
                        const cDone  = course.lessons.filter(l => l.completed).length
                        const cPct   = cTotal > 0 ? Math.round((cDone / cTotal) * 100) : 0
                        const isLastC = ci === level.courses.length - 1

                        return (
                          <div key={course.id} className="rp-course-block">

                            {/* ── COURSE ROW ── */}
                            <div className="rp-course-row">
                              <div className={`rp-course-dot rp-course-dot--${cSt}`}>
                                {cSt === 'done' ? <ICheck /> : cSt === 'lock' ? <ILock /> : <IBook />}
                              </div>
                              <div className={`rp-course-card rp-course-card--${cSt}`}>
                                <div className="rp-course-card-top">
                                  <div>
                                    <div className="rp-course-label">Course</div>
                                    <div className="rp-course-name">{course.title}</div>
                                    {course.description && (
                                      <div className="rp-course-desc">{course.description}</div>
                                    )}
                                  </div>
                                  <div className="rp-course-badges">
                                    {cSt === 'lock' && <span className="rp-badge rp-badge--lock">🔒</span>}
                                    {cSt === 'open' && <span className="rp-badge rp-badge--open">▶</span>}
                                    {cSt === 'done' && <span className="rp-badge rp-badge--done">✓</span>}
                                    {course.has_quiz && <span className="rp-badge rp-badge--quiz"><IQuiz /></span>}
                                  </div>
                                </div>
                                {cSt !== 'lock' && (
                                  <div className="rp-course-prog">
                                    <div className="rp-bar rp-bar--sm">
                                      <div className="rp-bar-fill" style={{ width: `${cPct}%` }} />
                                    </div>
                                    <span>{cDone}/{cTotal}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ── LESSONS (zigzag nodes) ── */}
                            <div className="rp-lessons-wrap">
                              {/* spine */}
                              <div className={`rp-lesson-spine rp-lesson-spine--${cSt === 'lock' ? 'lock' : 'open'}`} />

                              {course.lessons.map((lesson, lsi) => {
                                const lsSt  = lesson.completed ? 'done' : lesson.unlocked ? 'open' : 'lock'
                                const xOff  = ZZ[lsi % ZZ.length]
                                const isLastLesson = lsi === course.lessons.length - 1

                                return (
                                  <div key={lesson.id} className="rp-ls-step">

                                    {/* lesson circle */}
                                    <div className={`rp-ls-node rp-ls-node--${lsSt}`}>
                                      {lsSt === 'open' && <span className="rp-ls-glow" />}
                                    </div>

                                    {/* label */}
                                    <div
                                      className={`rp-ls-label rp-ls-label--${xOff >= 0 ? 'r' : 'l'}`}
                                      style={{ '--x': `${xOff}px` }}
                                    >
                                      <div className="rp-ls-label-head">
                                        <span className={`rp-ls-status rp-ls-status--${lsSt}`}>
                                          {lesson.completed
                                            ? <ICheck />
                                            : lesson.unlocked
                                            ? <span>{lsi + 1}</span>
                                            : <ILock />}
                                        </span>
                                        <div className="rp-ls-title">{lesson.title}</div>
                                      </div>
                                      <div className="rp-ls-tags">
                                        {lesson.completed  && <span className="rp-badge rp-badge--done">Done</span>}
                                        {!lesson.completed && lesson.unlocked  && <span className="rp-badge rp-badge--open">Ready</span>}
                                        {!lesson.unlocked  && <span className="rp-badge rp-badge--lock">Locked</span>}
                                        {lesson.has_quiz   && <span className="rp-badge rp-badge--quiz">Quiz</span>}
                                      </div>
                                    </div>

                                    {/* vertical line to next lesson */}
                                    {!isLastLesson && (
                                      <div
                                        className={`rp-ls-vline rp-ls-vline--${course.lessons[lsi + 1]?.unlocked ? 'open' : 'lock'}`}
                                        style={{ '--x': `${xOff}px` }}
                                      />
                                    )}
                                  </div>
                                )
                              })}
                            </div>

                            {/* connector to next course */}
                            {!isLastC && (
                              <div className={`rp-course-connector rp-course-connector--${level.courses[ci + 1] ? st(level.courses[ci + 1]) === 'lock' ? 'lock' : 'open' : 'lock'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>

                  </div>

                  {/* ── line from branch down to certificate ── */}
                  <div className={`rp-vline rp-vline--${certEarned ? 'open' : 'lock'}`} style={{ height: 28 }} />

                  {/* ══ CERTIFICATE NODE ══ */}
                  <div className="rp-cert-row-wrap">
                    <div className={`rp-cert-node rp-cert-node--${certEarned ? 'earned' : 'lock'}`}>
                      <ITrophy />
                      {certEarned && <span className="rp-cert-shine" />}
                    </div>
                    <div className={`rp-cert-card rp-cert-card--${certEarned ? 'earned' : 'lock'}`}>
                      <div className="rp-cert-title">
                        {certEarned ? '🎉 Certificate Unlocked!' : '🏆 Level Certificate'}
                      </div>
                      <div className="rp-cert-sub">
                        {certEarned
                          ? `${level.display_name || level.name} — Completed`
                          : `Complete all lessons to unlock · ${lvlPct}% done`}
                      </div>
                      {certEarned && (
                        <a href="/certificates" className="rp-cert-btn">View Certificate →</a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* ── FINISH TROPHY ── */}
            <div className="rp-vline rp-vline--open" style={{ height: 40 }} />
            <div className="rp-finish">
              <div className={`rp-finish-node ${pct === 100 ? 'rp-finish-node--done' : ''}`}>
                <ITrophy />
                {pct === 100 && <span className="rp-pulse" />}
              </div>
              <div className="rp-finish-label">
                {pct === 100 ? '🏆 Journey Complete!' : 'Finish Line'}
              </div>
            </div>

          </div>
        )
      }
    </div>
  )
}
