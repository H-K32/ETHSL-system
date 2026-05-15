import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { LoadingSpinner, ErrorState } from "@/components/Loading";
import { api, getErrorMessage } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/courses/$levelId")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <CoursesPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function CoursesPage() {
  const { levelId } = Route.useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/levels/${levelId}/courses/`);
      setCourses(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [levelId]);

  if (loading) return <LoadingSpinner label="Loading courses..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/levels" className="text-sm text-muted-foreground hover:text-foreground">← Back to levels</Link>
        <h1 className="mt-2 text-3xl font-bold">Courses</h1>
      </div>

      {courses.length === 0 ? (
        <p className="text-muted-foreground">No courses found for this level.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => {
            const locked = course.is_locked || course.locked;
            const progress = course.progress ?? 0;
            const Inner = (
              <div className={`rounded-2xl border bg-card p-6 shadow-sm transition ${
                locked ? "opacity-60" : "hover:border-primary hover:shadow-md"
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                  </div>
                  {locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </div>
                {course.description && (
                  <p className="mt-3 text-sm text-muted-foreground">{course.description}</p>
                )}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="mt-1" />
                </div>
              </div>
            );
            return locked ? (
              <div key={course.id}>{Inner}</div>
            ) : (
              <Link key={course.id} to="/lessons/$courseId" params={{ courseId: String(course.id) }}>
                {Inner}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
