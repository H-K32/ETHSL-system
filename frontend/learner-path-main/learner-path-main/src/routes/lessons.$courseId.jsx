import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { LoadingSpinner, ErrorState } from "@/components/Loading";
import { api, getErrorMessage } from "@/lib/api";
import { PlayCircle, Lock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/lessons/$courseId")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <LessonsPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function LessonsPage() {
  const { courseId } = Route.useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/courses/${courseId}/lessons/`);
      setLessons(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [courseId]);

  if (loading) return <LoadingSpinner label="Loading lessons..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => window.history.back()} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
        <h1 className="mt-2 text-3xl font-bold">Lessons</h1>
      </div>

      {lessons.length === 0 ? (
        <p className="text-muted-foreground">No lessons in this course yet.</p>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const locked = lesson.is_locked || lesson.locked;
            const completed = lesson.is_completed || lesson.completed;
            const Inner = (
              <div className={`flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition ${
                locked ? "opacity-60" : "hover:border-primary"
              }`}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  {completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : locked ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <PlayCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Lesson {lesson.order ?? idx + 1}</p>
                  <h3 className="truncate font-medium">{lesson.title}</h3>
                </div>
                {completed && (
                  <span className="hidden sm:inline rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Completed</span>
                )}
              </div>
            );
            return locked ? (
              <div key={lesson.id}>{Inner}</div>
            ) : (
              <Link key={lesson.id} to="/lesson/$id" params={{ id: String(lesson.id) }}>
                {Inner}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
