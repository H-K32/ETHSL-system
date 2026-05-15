import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { LoadingSpinner, ErrorState } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Target, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/placement")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <PlacementPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function PlacementPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/placement/quiz/");
      setQuiz(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const questions = quiz?.questions || quiz?.results || quiz || [];
  const list = Array.isArray(questions) ? questions : [];

  const handleSelect = (qid, oid) => setAnswers({ ...answers, [qid]: oid });

  const handleSubmit = async () => {
    if (Object.keys(answers).length < list.length) {
      toast.error("Please answer all questions");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([question, option]) => ({
          question: Number(question),
          option: Number(option),
        })),
      };
      const { data } = await api.post("/placement/submit/", payload);
      setResult(data);
      await refresh();
      toast.success("Placement complete!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading placement test..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  if (result) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Placement complete</h1>
        <p className="mt-2 text-muted-foreground">
          Score: <span className="font-semibold">{result.score ?? "—"}</span>
          {result.level && (
            <> • Assigned level: <span className="font-semibold">{result.level.name || result.level}</span></>
          )}
        </p>
        <Button className="mt-6" onClick={() => navigate({ to: "/levels" })}>Continue to levels</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Placement Test</h1>
            <p className="text-sm text-muted-foreground">Answer all questions to determine your starting level.</p>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <ErrorState message="No questions available." onRetry={load} />
      ) : (
        <div className="space-y-4">
          {list.map((q, idx) => (
            <div key={q.id} className="rounded-xl border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">Question {idx + 1}</p>
              <h3 className="mt-1 font-medium">{q.question_text || q.text}</h3>
              <div className="mt-4 space-y-2">
                {(q.options || []).map((opt) => {
                  const selected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(q.id, opt.id)}
                      className={`block w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                        selected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "bg-background hover:bg-secondary"
                      }`}
                    >
                      {opt.option_text || opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full">
            {submitting ? "Submitting..." : "Submit placement test"}
          </Button>
        </div>
      )}
    </div>
  );
}
