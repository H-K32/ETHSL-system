import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { LoadingSpinner, ErrorState } from "@/components/Loading";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/quiz/$id")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <QuizPage />
      </AppShell>
    </ProtectedRoute>
  ),
});

function QuizPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
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
      const { data } = await api.get(`/quizzes/${id}/`);
      setQuiz(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <LoadingSpinner label="Loading quiz..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!quiz) return null;

  const questions = quiz.questions || [];

  const handleSelect = (qid, oid) => setAnswers({ ...answers, [qid]: oid });

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
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
      const { data } = await api.post(`/quizzes/${id}/submit/`, payload);
      setResult(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const score = result.score ?? 0;
    const passing = quiz.passing_score ?? 50;
    const passed = result.passed ?? score >= passing;
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          passed ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
        }`}>
          {passed ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
        </div>
        <h1 className="mt-4 text-2xl font-bold">{passed ? "You passed!" : "Not quite"}</h1>
        <p className="mt-2 text-muted-foreground">
          Score: <span className="font-semibold">{score}</span> / Passing: {passing}
        </p>
        {result.feedback && <p className="mt-3 text-sm text-muted-foreground">{result.feedback}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => { setResult(null); setAnswers({}); }}>Try again</Button>
          <Button variant="outline" onClick={() => navigate({ to: "/levels" })}>Back to levels</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold capitalize">{quiz.type || "Quiz"}</h1>
            {quiz.description && <p className="text-sm text-muted-foreground">{quiz.description}</p>}
            {quiz.passing_score && (
              <p className="mt-1 text-xs text-muted-foreground">Passing score: {quiz.passing_score}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
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
          {submitting ? "Submitting..." : "Submit quiz"}
        </Button>
      </div>
    </div>
  );
}
