import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { LoadingSpinner, ErrorState } from "@/components/Loading";
import { api, getErrorMessage } from "@/lib/api";
import { Lock, ArrowRight, Layers } from "lucide-react";

export const Route = createFileRoute("/levels")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <LevelsPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function LevelsPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/levels/");
      setLevels(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner label="Loading levels..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Levels</h1>
        <p className="mt-1 text-muted-foreground">Pick a level to start exploring courses.</p>
      </div>

      {levels.length === 0 ? (
        <p className="text-muted-foreground">No levels available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => {
            const locked = level.is_locked || level.locked;
            const Inner = (
              <div className={`relative rounded-2xl border bg-card p-6 shadow-sm transition ${
                locked ? "opacity-60" : "hover:border-primary hover:shadow-md"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  {locked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{level.name}</h3>
                {level.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{level.description}</p>
                )}
                {typeof level.order !== "undefined" && (
                  <p className="mt-3 text-xs text-muted-foreground">Order: {level.order}</p>
                )}
              </div>
            );
            return locked ? (
              <div key={level.id}>{Inner}</div>
            ) : (
              <Link key={level.id} to="/courses/$levelId" params={{ levelId: String(level.id) }}>
                {Inner}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
