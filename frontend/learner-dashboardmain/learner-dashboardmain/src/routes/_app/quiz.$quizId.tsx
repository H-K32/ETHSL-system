import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/quiz/$quizId")({
  component: QuizPage,
});

function QuizPage() {
  const { quizId } = Route.useParams();

  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;

    setLoading(true);

    api.get(`/courses/learner/quiz/${quizId}/`)
      .then((res) => setQuiz(res.data))
      .catch(() => setQuiz(null))
      .finally(() => setLoading(false));
  }, [quizId]);

  const selectOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const formattedAnswers = Object.keys(answers).map((qId) => ({
      question: Number(qId),
      selected_option: answers[Number(qId)],
    }));

    const res = await api.post("/progress/submit-quiz/", {
      quiz: Number(quizId),
      answers: formattedAnswers,
    });

    setResult(res.data);
  };

  if (loading) return <div>Loading quiz...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  if (result) {
    return (
      <div>
        <h2>Result</h2>
        <p>Score: {result.score}</p>
        <p>{result.passed ? "Passed 🎉" : "Failed ❌"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold">Quiz</h1>

      {quiz.questions.map((q: any) => (
        <div key={q.id} className="border p-3">
          <p className="font-semibold">{q.question_text}</p>

          {q.options.map((opt: any) => (
            <label key={opt.id} className="block">
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={answers[q.id] === opt.id}
                onChange={() => selectOption(q.id, opt.id)}
              />
              {opt.option_text}
            </label>
          ))}
        </div>
      ))}

      <button
        className="border px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Submit Quiz
      </button>
    </div>
  );
}

export default QuizPage;