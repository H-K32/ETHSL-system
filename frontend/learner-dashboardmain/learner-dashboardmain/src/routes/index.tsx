import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  Hand,
  BookOpen,
  Users,
  Sparkles,
  PlayCircle,
  CheckCircle2,
  Star,
  ArrowRight,
  Globe,
  Heart,
  Trophy,
} from "lucide-react";
import heroImage from "@/assets/hero-signing.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SignLearn ET — Learn Ethiopian Sign Language" },
      {
        name: "description",
        content:
          "Interactive Ethiopian Sign Language teacher app with bite-sized video lessons, quizzes, and a vibrant learner community.",
      },
      { property: "og:title", content: "SignLearn ET — Learn Ethiopian Sign Language" },
      {
        property: "og:description",
        content:
          "Master Ethiopian Sign Language through interactive lessons, quizzes and community support.",
      },
      { property: "og:image", content: heroImage },
      { name: "twitter:image", content: heroImage },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Decorative background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div
          className="absolute top-1/3 -right-40 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--gradient-warm)" }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--gradient-cool)" }}
        />
      </div>

      {/* Top nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="h-10 w-10 rounded-2xl flex items-center justify-center text-primary-foreground shadow-[var(--shadow-soft)] group-hover:scale-105 transition-transform"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Hand className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold leading-tight">SignLearn ET</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5 tracking-wide uppercase">
                Ethiopian Sign Language
              </div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how" className="text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Reviews
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 md:px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-3 md:px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 transition-opacity"
              style={{ background: "var(--gradient-primary)" }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" /> New • Built for Ethiopia 🇪🇹
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mt-5 tracking-tight">
            Learn{" "}
            <span
              style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Ethiopian Sign Language
            </span>{" "}
            the friendly way
          </h1>
          <p className="text-muted-foreground mt-5 text-base md:text-lg leading-relaxed max-w-xl">
            Bite-sized video lessons, interactive quizzes, and a supportive community help you
            communicate with the Deaf community in Ethiopia — at your own pace.
          </p>

          <ul className="mt-6 grid sm:grid-cols-2 gap-2.5 text-sm">
            {[
              "100% free to start",
              "Learn at your own pace",
              "Real Ethiopian signs",
              "Friendly community",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2 text-foreground/80">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:translate-y-[-1px] transition-transform"
              style={{ background: "var(--gradient-primary)" }}
            >
              <PlayCircle className="h-4 w-4" /> Start Learning Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border border-border bg-card hover:bg-muted transition-colors"
            >
              I already have an account
            </Link>
          </div>

          <div className="flex items-center gap-4 mt-7 text-xs text-muted-foreground">
            <div className="flex -space-x-2">
              {["bg-primary", "bg-secondary", "bg-accent", "bg-success"].map((c, i) => (
                <div
                  key={i}
                  className={`h-7 w-7 rounded-full border-2 border-background ${c}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                ))}
              </div>
              <span className="font-medium text-foreground">4.9</span>
              <span>from 450+ learners</span>
            </div>
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-[2.5rem] blur-2xl opacity-40"
            style={{ background: "var(--gradient-primary)" }}
          />
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-[var(--shadow-soft)] border border-border/60">
            <img
              src={heroImage}
              alt="Ethiopian people joyfully learning sign language together"
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-5 -left-3 md:-left-6 bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-card)] flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Lessons completed
              </div>
              <div className="text-lg font-bold leading-none mt-0.5">1,200+</div>
            </div>
          </div>
          <div className="absolute -top-5 -right-3 md:-right-6 bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-card)] flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-secondary-foreground"
              style={{ background: "var(--gradient-cool)" }}
            >
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Active learners
              </div>
              <div className="text-lg font-bold leading-none mt-0.5">450+</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 -mt-2 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[
            { label: "Active learners", value: "450+", icon: Users },
            { label: "Video lessons", value: "120+", icon: PlayCircle },
            { label: "Quizzes", value: "60+", icon: GraduationCap },
            { label: "Rated", value: "4.9★", icon: Star },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-card border border-border p-4 md:p-5 text-center shadow-[var(--shadow-card)]"
            >
              <s.icon className="h-5 w-5 mx-auto text-primary mb-1.5" />
              <div className="text-xl md:text-2xl font-bold">{s.value}</div>
              <div className="text-[11px] md:text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            Everything you need to become fluent
          </h2>
          <p className="text-muted-foreground mt-3">
            Designed specifically for learners of Ethiopian Sign Language.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: BookOpen,
              title: "Structured Lessons",
              desc: "Progress through alphabet, numbers, greetings, and conversational signs step by step.",
              gradient: "var(--gradient-primary)",
            },
            {
              icon: GraduationCap,
              title: "Quizzes & Progress",
              desc: "Test what you've learned and watch your progress grow with every passed quiz.",
              gradient: "var(--gradient-warm)",
            },
            {
              icon: Users,
              title: "Friendly Community",
              desc: "Ask questions, share tips, and learn alongside other Ethiopian Sign Language learners.",
              gradient: "var(--gradient-cool)",
            },
            {
              icon: Globe,
              title: "Built for Ethiopia",
              desc: "Authentic Ethiopian signs taught by people from the Deaf community.",
              gradient: "var(--gradient-cool)",
            },
            {
              icon: Heart,
              title: "Inclusive by Design",
              desc: "A respectful, welcoming space for families, friends, teachers and allies.",
              gradient: "var(--gradient-warm)",
            },
            {
              icon: Trophy,
              title: "Track Achievements",
              desc: "Earn milestones as you complete lessons and pass quizzes.",
              gradient: "var(--gradient-primary)",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl bg-card border border-border p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] hover:-translate-y-1 transition-all"
            >
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-primary-foreground mb-4 shadow-[var(--shadow-soft)]"
                style={{ background: f.gradient }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            How it works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">Start signing in 3 easy steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 relative">
          {[
            { step: "1", title: "Create your account", desc: "Sign up free in less than a minute." },
            { step: "2", title: "Pick a course", desc: "Start with the basics or jump to a topic you care about." },
            { step: "3", title: "Practice daily", desc: "Short lessons + quizzes keep your skills growing." },
          ].map((s) => (
            <div
              key={s.step}
              className="relative rounded-2xl p-7 border border-border bg-card shadow-[var(--shadow-card)]"
            >
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-primary-foreground text-xl font-bold shadow-[var(--shadow-soft)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                {s.step}
              </div>
              <h3 className="font-bold text-lg mt-4">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Loved by learners
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">What our community says</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              name: "Sara M.",
              role: "Teacher, Addis Ababa",
              quote:
                "I can finally communicate with my Deaf students. The lessons are short, fun and easy to follow.",
            },
            {
              name: "Daniel T.",
              role: "University Student",
              quote:
                "The quizzes really help me remember the signs. Best app I've used for Ethiopian Sign Language.",
            },
            {
              name: "Hanna G.",
              role: "Parent",
              quote:
                "My daughter and I learn together every evening. The community is so welcoming!",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="rounded-2xl bg-card border border-border p-6 shadow-[var(--shadow-card)]"
            >
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-primary-foreground font-bold"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About / CTA */}
      <section id="about" className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div
          className="relative overflow-hidden rounded-[2rem] p-8 md:p-14 text-center text-primary-foreground shadow-[var(--shadow-soft)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold">About SignLearn ET</h2>
            <p className="mt-4 max-w-2xl mx-auto opacity-95 leading-relaxed">
              SignLearn ET is on a mission to make Ethiopian Sign Language accessible to everyone —
              students, families, teachers and friends of the Deaf community across Ethiopia.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-7">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-primary font-semibold hover:opacity-95 transition-opacity"
              >
                Join the community <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10 mt-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Hand className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground">SignLearn ET</span>
          </div>
          <p>© {new Date().getFullYear()} SignLearn ET — Made with ❤️ in Ethiopia</p>
        </div>
      </footer>
    </div>
  );
}
