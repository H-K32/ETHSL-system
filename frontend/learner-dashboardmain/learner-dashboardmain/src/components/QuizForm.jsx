import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function QuizForm({ quiz, onClose }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correct) correct++;
    });
    const score = Math.round((correct / quiz.questions.length) * 100);
    setResult({ score, passed: score >= (quiz.pass_score || 60), correct, total: quiz.questions.length });
  };

  if (result) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center shadow-[var(--shadow-soft)]">
        {result.passed ? (
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-3" />
        ) : (
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-3" />
        )}
        <h3 className="text-2xl font-bold mb-2">{result.passed ? "You passed! 🎉" : "Try again"}</h3>
        <p className="text-muted-foreground mb-1">Your score</p>
        <div className="text-5xl font-bold mb-2" style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {result.score}%
        </div>
        <p className="text-sm text-muted-foreground mb-6">{result.correct} / {result.total} correct</p>
        <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-medium text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          Back to Lessons
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-[var(--shadow-card)] space-y-6">
      <div>
        <h3 className="text-2xl font-bold">{quiz.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">Pass score: {quiz.pass_score || 60}%</p>
      </div>
      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="rounded-xl border border-border p-4 bg-muted/30">
          <p className="font-medium mb-3">
            <span className="text-primary mr-2">{idx + 1}.</span>{q.text}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-card cursor-pointer transition-colors border border-transparent has-[:checked]:border-primary has-[:checked]:bg-card">
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={i}
                  checked={answers[q.id] === i}
                  onChange={() => setAnswers({ ...answers, [q.id]: i })}
                  className="accent-primary"
                  required
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="flex gap-3">
        <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-medium text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          Submit Quiz
        </button>
        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}
