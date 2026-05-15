import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Trophy, Target, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ETHSL — Learn at your own level" },
      { name: "description", content: "An adaptive learning platform that places you at the right level and guides you through structured courses, lessons, and quizzes." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>ETHSL</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to="/register"><Button size="sm">Sign up</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-secondary-foreground">
          <Target className="h-3.5 w-3.5" /> Adaptive learning, properly leveled
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Learn at the level <span className="text-primary">that fits you</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Take a quick placement test, unlock your level, and progress through structured courses,
          video lessons, and quizzes — all in one place.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/register">
            <Button size="lg" className="gap-2">Get started <ArrowRight className="h-4 w-4" /></Button>
          </Link>
          <Link to="/login"><Button size="lg" variant="outline">I already have an account</Button></Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Target, title: "1. Placement Test", desc: "Answer a short quiz so we can place you at the right level." },
              { icon: BookOpen, title: "2. Learn", desc: "Unlock courses & lessons with high-quality video and notes." },
              { icon: Trophy, title: "3. Progress", desc: "Pass quizzes to advance and track your progress over time." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Built for serious learners</h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          {[
            "Personalized starting level via placement quiz",
            "Structured levels → courses → lessons",
            "Video lessons with completion tracking",
            "Quizzes with passing thresholds",
            "Progress dashboard in your profile",
            "Works on any device",
          ].map((t) => (
            <div key={t} className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <span className="text-sm">{t}</span>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/register"><Button size="lg">Create free account</Button></Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ETHSL Learning Platform
      </footer>
    </div>
  );
}
