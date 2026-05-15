import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, BookOpen, Target, Flame } from "lucide-react";

import { api, getStoredUser } from "@/lib/api";
import CourseCard from "@/components/CourseCard";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(getStoredUser() || null);
  const [progress, setProgress] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const courseRes = await api.get("/courses/learner/courses/");
      const userRes = await api.get("/users/profile/");
      const progressRes = await api.get("/progress/profile/dashboard/");

      setCourses(courseRes.data);
      setUser(userRes.data);
      setProgress(progressRes.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const isCourseUnlocked = (index: number) => {
    if (index === 0) return true;
    return (courses[index - 1]?.progress ?? 0) >= 100;
  };

  const stats = [
    {
      label: "Enrolled Courses",
      value: courses.length,
      icon: BookOpen,
      bg: "var(--gradient-primary)",
    },
    {
      label: "Lessons Completed",
      value: progress?.completed_lessons ?? 0,
      icon: Target,
      bg: "var(--gradient-cool)",
    },
    {
      label: "Quizzes Passed",
      value: progress?.quizzes_passed ?? 0,
      icon: Trophy,
      bg: "var(--gradient-warm)",
    },
    {
      label: "Quiz Attempts",
      value: progress?.total_quiz_attempts ?? 0,
      icon: Flame,
      bg: "var(--gradient-warm)",
    },
  ];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Hi, {user?.full_name?.split(" ")[0] || user?.username || "User"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Pick up where you left off — you're doing great!
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;

          return (
            <div
              key={s.label}
              className="rounded-2xl bg-card border border-border p-5 shadow-[var(--shadow-card)]"
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-primary-foreground mb-3"
                style={{ background: s.bg }}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="text-2xl font-bold">
                {loading ? "..." : s.value}
              </div>

              <div className="text-xs text-muted-foreground mt-0.5">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTINUE LEARNING */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Continue Learning</h2>

          <Link to="/courses" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {loading
            ? Array(3).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-muted animate-pulse"
                />
              ))
            : courses.slice(0, 3).map((c, index) => {
                const unlocked = isCourseUnlocked(index);

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (!unlocked) {
                        alert("🚫 Finish previous course first");
                        return;
                      }
                      window.location.href = `/courses/${c.id}`;
                    }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition ${
                      unlocked
                        ? "bg-card hover:shadow-[var(--shadow-soft)] cursor-pointer"
                        : "bg-muted opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className="h-14 w-14 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: c.color }}
                    >
                      {c.thumbnail}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {c.title}
                      </div>

                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${c.progress}%`,
                            background: "var(--gradient-primary)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </section>

      {/* COURSES GRID */}
      <section>
        <h2 className="text-xl font-bold mb-4">Your Courses</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array(6).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-muted animate-pulse"
                />
              ))
            : courses.map((c) => {
                const unlocked = true; // optional: replace with real logic

                return (
                  <CourseCard
                    key={c.id}
                    course={c}
                    locked={!unlocked}
                    onLockedClick={() =>
                      alert("🚫 Course is locked")
                    }
                    onClick={() => {
                      if (unlocked) {
                        window.location.href = `/courses/${c.id}`;
                      }
                    }}
                  />
                );
              })}
        </div>
      </section>

    </div>
  );
}

export default DashboardPage;