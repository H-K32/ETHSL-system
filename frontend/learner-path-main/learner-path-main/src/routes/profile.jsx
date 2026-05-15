import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { LoadingSpinner, ErrorState } from "@/components/Loading";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LogOut, Trophy, BookOpen, Target } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <ProfilePage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/profile/stats/");
      setStats(data);
    } catch (err) {
      // fallback to user object if stats endpoint isn't available
      setStats(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  if (loading) return <LoadingSpinner label="Loading profile..." />;

  const completedLessons = stats?.completed_lessons ?? user?.completed_lessons ?? 0;
  const avgScore = stats?.quiz_average ?? stats?.average_score ?? user?.quiz_average ?? 0;
  const currentLevel = stats?.current_level ?? user?.current_level ?? user?.level;
  const courseProgress = stats?.course_progress || stats?.courses || [];
  const initials = (user?.full_name || user?.username || "U")
    .split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} alt={user?.username} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user?.full_name || user?.username}</h1>
            <p className="text-sm text-muted-foreground">@{user?.username} · {user?.email}</p>
            {currentLevel && (
              <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Level: {currentLevel.name || currentLevel}
              </span>
            )}
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={BookOpen} label="Completed lessons" value={completedLessons} />
        <StatCard icon={Trophy} label="Quiz average" value={`${Math.round(avgScore)}%`} />
        <StatCard icon={Target} label="Current level" value={currentLevel?.name || currentLevel || "—"} />
      </div>

      {/* Course Progress */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Course progress</h2>
        {error && !courseProgress.length ? (
          <p className="mt-3 text-sm text-muted-foreground">Stats unavailable: {error}</p>
        ) : courseProgress.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Start a course to see your progress here.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {courseProgress.map((c) => {
              const pct = c.progress ?? 0;
              return (
                <div key={c.id || c.course_id || c.title}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{c.title || c.course_title}</span>
                    <span className="text-muted-foreground">
                      {c.completed_lessons ?? 0}/{c.total_lessons ?? 0}
                    </span>
                  </div>
                  <Progress value={pct} className="mt-1" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
