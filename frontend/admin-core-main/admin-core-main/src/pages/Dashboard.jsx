import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import "../styles/dashboard.css";

/* ── Icons ─────────────────────────────────────────────────── */
const Ic = {
  Users:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Layers:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Book:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Video:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  Quiz:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Award:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  Activity: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  UserPlus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  Bars:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Check:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Target:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Alert:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Refresh:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

/* ── Sparkline ─────────────────────────────────────────────── */
function Sparkline({ values, color }) {
  if (!values || values.length < 2) return null;
  const W = 72; const H = 28;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) =>
    `${(i / (values.length - 1)) * W},${H - (v / max) * H}`
  ).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="db-sparkline">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Vertical bar chart ────────────────────────────────────── */
function BarChart({ data, valueKey, labelKey, color }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="db-vchart">
      {data.map((d, i) => (
        <div key={i} className="db-vchart-col">
          <div className="db-vchart-track">
            <div className="db-vchart-bar"
              style={{ height: `${(d[valueKey] / max) * 100}%`, background: color }}
              title={`${d[labelKey]}: ${d[valueKey]}`}
            />
          </div>
          <span className="db-vchart-lbl">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Dual bar chart ────────────────────────────────────────── */
function DualBarChart({ data }) {
  const max = Math.max(...data.map(d => Math.max(d.attempts, d.passed)), 1);
  return (
    <div className="db-vchart">
      {data.map((d, i) => (
        <div key={i} className="db-vchart-col">
          <div className="db-vchart-track">
            <div className="db-vchart-dual">
              <div className="db-vchart-bar" style={{ height: `${(d.attempts / max) * 100}%`, background: "#c7d2fe" }} title={`Attempts: ${d.attempts}`} />
              <div className="db-vchart-bar" style={{ height: `${(d.passed / max) * 100}%`, background: "#4f46e5" }} title={`Passed: ${d.passed}`} />
            </div>
          </div>
          <span className="db-vchart-lbl">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Donut chart ───────────────────────────────────────────── */
const LEVEL_META = {
  beginner:     { color: "#4f46e5", label: "Beginner" },
  intermediate: { color: "#06b6d4", label: "Intermediate" },
  advanced:     { color: "#f59e0b", label: "Advanced" },
};

function DonutChart({ data }) {
  const entries = Object.entries(data);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const r = 36; const circ = 2 * Math.PI * r;
  let off = 0;
  const segs = entries.map(([key, val]) => {
    const pct = val / total;
    const seg = { key, val, pct, off, ...LEVEL_META[key] };
    off += pct;
    return seg;
  });
  return (
    <div className="db-donut">
      <svg viewBox="0 0 100 100" className="db-donut-svg">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        {segs.map(s => (
          <circle key={s.key} cx="50" cy="50" r={r} fill="none"
            stroke={s.color} strokeWidth="14"
            strokeDasharray={`${s.pct * circ} ${circ}`}
            strokeDashoffset={-(s.off * circ)}
            transform="rotate(-90 50 50)"
          />
        ))}
        <text x="50" y="46" textAnchor="middle" className="db-donut-num">{total}</text>
        <text x="50" y="56" textAnchor="middle" className="db-donut-sub">total</text>
      </svg>
      <ul className="db-donut-legend">
        {segs.map(s => (
          <li key={s.key}>
            <span className="db-dot" style={{ background: s.color }} />
            <span className="db-dot-label">{s.label}</span>
            <strong>{s.val}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── KPI card ──────────────────────────────────────────────── */
function KpiCard({ label, value, Icon, color, spark, onClick }) {
  return (
    <div
      className={`db-kpi${onClick ? ' db-kpi--clickable' : ''}`}
      style={{ "--c": color }}
      onClick={onClick}
    >
      <div className="db-kpi-top">
        <div className="db-kpi-icon"><Icon /></div>
        {spark && <Sparkline values={spark} color={color} />}
      </div>
      <div className="db-kpi-val">{value ?? "—"}</div>
      <div className="db-kpi-label">{label}</div>
    </div>
  );
}

/* ── Avatar ────────────────────────────────────────────────── */
function Av({ name, cls }) {
  return <div className={`db-av ${cls}`}>{(name || "?")[0].toUpperCase()}</div>;
}

/* ── Empty ─────────────────────────────────────────────────── */
function Empty({ text }) {
  return <p className="db-empty">{text}</p>;
}

/* ── Skeleton ──────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="db-skel">
      <div className="db-skel-row">
        {[...Array(6)].map((_, i) => <div key={i} className="db-skel-kpi" />)}
      </div>
      <div className="db-skel-row">
        {[...Array(3)].map((_, i) => <div key={i} className="db-skel-chart" />)}
      </div>
      <div className="db-skel-bottom">
        <div className="db-skel-feed" />
        <div className="db-skel-side" />
      </div>
    </div>
  );
}

/* ── TABS ──────────────────────────────────────────────────── */
const TABS = [
  { id: "registrations", label: "New Users" },
  { id: "completions",   label: "Completions" },
  { id: "attempts",      label: "Quiz Attempts" },
];

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tab, setTab]         = useState("registrations");
  const navigate              = useNavigate();

  const load = () => {
    setLoading(true);
    setError(null);
    API.get("/courses/statistics/")
      .then(r => setStats(r.data))
      .catch(e => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="db-wrap"><Skeleton /></div>;

  if (error) return (
    <div className="db-wrap">
      <div className="db-error">
        <div className="db-error-icon"><Ic.Alert /></div>
        <h3>Could not load dashboard</h3>
        <p>{error}</p>
        <button onClick={load}><Ic.Refresh /> Retry</button>
      </div>
    </div>
  );

  const s              = stats;
  const levelDist      = s.level_distribution  || {};
  const userGrowth     = s.user_growth          || [];
  const quizTrend      = s.quiz_trend           || [];
  const popularCourses = s.popular_courses      || [];
  const recentUsers    = s.recent_users         || [];
  const recentAttempts = s.recent_quiz_attempts || [];
  const recentComplete = s.recent_completions   || [];
  const placement      = s.placement_stats      || {};
  const growthVals     = userGrowth.map(d => d.count);
  const maxCourse      = popularCourses[0]?.completions || 1;

  return (
    <div className="db-wrap">

      {/* ── page title ── */}
      <div className="db-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>ETHSL Admin — platform overview</p>
        </div>
        <div className="db-live">
          <span className="db-live-dot" />
          All systems operational
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="db-kpi-grid">
        <KpiCard label="Total Learners"      value={s.total_learners}                    Icon={Ic.Users}    color="#4f46e5" spark={growthVals} />
        <KpiCard label="Active (30 days)"    value={s.active_users}                      Icon={Ic.Activity} color="#06b6d4" />
        <KpiCard label="New Registrations"   value={s.new_registrations}                 Icon={Ic.UserPlus} color="#10b981" />
        <KpiCard label="Certificates Issued" value={s.total_certificates}                Icon={Ic.Award}    color="#f59e0b" />
        <KpiCard label="Quiz Attempts"       value={s.quiz_attempts}                     Icon={Ic.Quiz}     color="#8b5cf6" />
        <KpiCard label="Completion Rate"     value={`${s.completion_rate ?? 0}%`}        Icon={Ic.Check}    color="#ec4899" />
        <KpiCard label="Reported Users"      value={s.reported_users_count ?? 0}         Icon={Ic.Alert}    color="#ef4444" onClick={() => navigate('/reported-users')} />
      </div>

      {/* ── secondary strip ── */}
      <div className="db-strip">
        {[
          { label: "Levels",         value: s.total_levels,                    Icon: Ic.Layers, color: "#4f46e5" },
          { label: "Courses",        value: s.total_courses,                   Icon: Ic.Book,   color: "#06b6d4" },
          { label: "Lessons",        value: s.total_lessons,                   Icon: Ic.Video,  color: "#10b981" },
          { label: "Quizzes",        value: s.total_quizzes,                   Icon: Ic.Quiz,   color: "#f59e0b" },
          { label: "Avg Quiz Score", value: `${s.avg_quiz_score ?? 0} pts`,    Icon: Ic.Bars,   color: "#8b5cf6" },
          { label: "Placement Pass", value: `${placement.pass_rate ?? 0}%`,    Icon: Ic.Target, color: "#ec4899" },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="db-strip-item">
            <div className="db-strip-icon" style={{ color }}><Icon /></div>
            <div>
              <div className="db-strip-val">{value}</div>
              <div className="db-strip-lbl">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── charts ── */}
      <div className="db-charts">

        <div className="db-chart-card">
          <div className="db-chart-head">
            <div>
              <h3>User Growth</h3>
              <p>New registrations — last 7 days</p>
            </div>
            <span className="db-badge">{growthVals.reduce((a, b) => a + b, 0)} this week</span>
          </div>
          <BarChart data={userGrowth} valueKey="count" labelKey="day" color="#4f46e5" />
        </div>

        <div className="db-chart-card">
          <div className="db-chart-head">
            <div>
              <h3>Quiz Performance</h3>
              <p>Attempts vs passed — last 7 days</p>
            </div>
            <div className="db-legend">
              <span><i style={{ background: "#c7d2fe" }} />Attempts</span>
              <span><i style={{ background: "#4f46e5" }} />Passed</span>
            </div>
          </div>
          <DualBarChart data={quizTrend} />
        </div>

        <div className="db-chart-card">
          <div className="db-chart-head">
            <div>
              <h3>Learner Distribution</h3>
              <p>By proficiency level</p>
            </div>
          </div>
          <DonutChart data={levelDist} />
        </div>

      </div>

      {/* ── bottom row ── */}
      <div className="db-bottom">

        {/* activity feed */}
        <div className="db-feed">
          <div className="db-feed-head">
            <h3>Recent Activity</h3>
            <div className="db-tabs">
              {TABS.map(t => (
                <button key={t.id}
                  className={`db-tab${tab === t.id ? " active" : ""}`}
                  onClick={() => setTab(t.id)}
                >{t.label}</button>
              ))}
            </div>
          </div>

          <div className="db-feed-list">
            {tab === "registrations" && (
              recentUsers.length === 0 ? <Empty text="No recent registrations" /> :
              recentUsers.map((u, i) => (
                <div key={i} className="db-feed-row">
                  <Av name={u.username} cls="av-indigo" />
                  <div className="db-feed-info">
                    <strong>{u.username}</strong>
                    <span>{u.email}</span>
                  </div>
                  <div className="db-feed-meta">
                    <span className={`db-lvl db-lvl-${u.level}`}>{u.level}</span>
                    <time>{u.date_joined}</time>
                  </div>
                </div>
              ))
            )}
            {tab === "completions" && (
              recentComplete.length === 0 ? <Empty text="No recent completions" /> :
              recentComplete.map((c, i) => (
                <div key={i} className="db-feed-row">
                  <Av name={c.user} cls="av-teal" />
                  <div className="db-feed-info">
                    <strong>{c.user}</strong>
                    <span>{c.lesson}</span>
                  </div>
                  <time>{c.date}</time>
                </div>
              ))
            )}
            {tab === "attempts" && (
              recentAttempts.length === 0 ? <Empty text="No recent quiz attempts" /> :
              recentAttempts.map((a, i) => (
                <div key={i} className="db-feed-row">
                  <Av name={a.user} cls={a.passed ? "av-teal" : "av-red"} />
                  <div className="db-feed-info">
                    <strong>{a.user}</strong>
                    <span>{a.quiz}</span>
                  </div>
                  <div className="db-feed-meta">
                    <span className={`db-result ${a.passed ? "pass" : "fail"}`}>
                      {a.passed ? "Passed" : "Failed"} · {a.score}pts
                    </span>
                    <time>{a.date}</time>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* right panels */}
        <div className="db-right">

          <div className="db-panel">
            <div className="db-panel-head">
              <h3>Top Courses</h3>
              <span>by completions</span>
            </div>
            {popularCourses.length === 0 ? <Empty text="No data yet" /> :
              popularCourses.map((c, i) => (
                <div key={i} className="db-course-row">
                  <span className="db-course-rank">{i + 1}</span>
                  <div className="db-course-body">
                    <div className="db-course-title">{c.title}</div>
                    <div className="db-course-track">
                      <div className="db-course-fill" style={{ width: `${(c.completions / maxCourse) * 100}%` }} />
                    </div>
                  </div>
                  <span className="db-course-count">{c.completions}</span>
                </div>
              ))
            }
          </div>

          <div className="db-panel db-placement">
            <div className="db-panel-head">
              <h3>Placement Test</h3>
              <span>overall stats</span>
            </div>
            <div className="db-pl-row">
              <div className="db-pl-stat">
                <div className="db-pl-num">{placement.total ?? 0}</div>
                <div className="db-pl-lbl">Attempts</div>
              </div>
              <div className="db-pl-divider" />
              <div className="db-pl-stat">
                <div className="db-pl-num teal">{placement.passed ?? 0}</div>
                <div className="db-pl-lbl">Passed</div>
              </div>
              <div className="db-pl-divider" />
              <div className="db-pl-stat">
                <div className="db-pl-num purple">{placement.pass_rate ?? 0}%</div>
                <div className="db-pl-lbl">Pass Rate</div>
              </div>
            </div>
            <div className="db-pl-track">
              <div className="db-pl-fill" style={{ width: `${placement.pass_rate ?? 0}%` }} />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
