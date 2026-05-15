import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/quiz/$quizId")({
  component: QuizPage,
});

function QuizPage() {
  const { quizId } = Route.useParams();

  const [quiz, setQuiz] = useState<any>(null);

  const [answers, setAnswers] = useState<
    Record<number, number>
  >({});

  const [result, setResult] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!quizId) return;

    setLoading(true);
    setError("");

    api
      .get(`/courses/learner/quiz/${quizId}/`)
      .then((res) => setQuiz(res.data))
      .catch(() => {
        setQuiz(null);
        setError("Failed to load quiz");
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  const selectOption = (
    questionId: number,
    optionId: number
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    try {
      setSubmitting(true);
      setError("");

      const formattedAnswers = Object.keys(
        answers
      ).map((qId) => ({
        question: Number(qId),
        selected_option: answers[Number(qId)],
      }));

      const res = await api.post(
        "/progress/submit-quiz/",
        {
          quiz: Number(quizId),
          answers: formattedAnswers,
        }
      );

      setResult(res.data);

    } catch (err: any) {

      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Failed to submit quiz"
      );

    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- LOADING ----------------

  if (loading) {
    return (
      <div className="p-6">
        Loading quiz...
      </div>
    );
  }

  // ---------------- NOT FOUND ----------------

  if (!quiz) {
    return (
      <div className="p-6">
        Quiz not found
      </div>
    );
  }

  // ---------------- RESULT ----------------

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">

        <div className="rounded-2xl border bg-card p-6">

          <h1 className="text-3xl font-bold mb-4">
            Quiz Result
          </h1>

          <div className="space-y-2">

            <p className="text-lg">
              Score:
              <span className="font-bold ml-2">
                {result.score}
              </span>
            </p>

            <p
              className={`text-lg font-semibold ${
                result.passed
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {result.passed
                ? "Passed 🎉"
                : "Failed ❌"}
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ---------------- QUIZ UI ----------------

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Quiz
        </h1>

        <p className="text-muted-foreground mt-1">
          Answer all questions carefully.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">

        {quiz.questions.map((q: any, index: number) => (
          <div
            key={q.id}
            className="rounded-2xl border bg-card p-5"
          >

            <div className="font-semibold text-lg mb-4">
              {index + 1}. {q.question_text}
            </div>

            <div className="space-y-3">

              {q.options.map((opt: any) => (

                <label
                  key={opt.id}
                  className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition ${
                    answers[q.id] === opt.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                >

                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={
                      answers[q.id] === opt.id
                    }
                    onChange={() =>
                      selectOption(
                        q.id,
                        opt.id
                      )
                    }
                  />

                  <span>{opt.option_text}</span>

                </label>
              ))}

            </div>

          </div>
        ))}

      </div>

      <button
        disabled={submitting}
        onClick={handleSubmit}
        className="px-6 py-3 rounded-xl font-medium bg-primary text-primary-foreground disabled:opacity-50"
      >
        {submitting
          ? "Submitting..."
          : "Submit Quiz"}
      </button>

    </div>
  );
}

export default QuizPage;