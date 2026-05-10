import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/placement-test")({
  component: PlacementTest,
});

function PlacementTest() {
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadQuiz() {
      const res = await api.get("/courses/learner/quiz/1/");
      setQuiz(res.data);
    }

    loadQuiz();
  }, []);

  const submit = async () => {
    setLoading(true);

    try {
      const payload = {
        quiz: quiz.id,
        answers: Object.entries(answers).map(([q, opt]) => ({
          question: Number(q),
          selected_option: opt,
        })),
      };

      const res = await api.post("/progress/submit-quiz/", payload);

      if (res.data.passed) {
        alert("🎉 You passed! Level unlocked.");
      } else {
        alert("You failed. You remain beginner.");
      }

      navigate({ to: "/dashboard" });
    } catch (err) {
      alert("Error submitting quiz");
    } finally {
      setLoading(false);
    }
  };

  if (!quiz) {
    return (
      <div className="p-10 text-center">
        Loading placement test...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          Placement Test
        </h1>

        <div className="space-y-6">
          {quiz.questions.map((q: any) => (
            <div
              key={q.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <p className="font-semibold mb-3">
                {q.question_text}
              </p>

              <div className="space-y-2">
                {q.options.map((o: any) => (
                  <button
                    key={o.id}
                    onClick={() =>
                      setAnswers((prev: any) => ({
                        ...prev,
                        [q.id]: o.id,
                      }))
                    }
                    className={`w-full text-left p-2 rounded border ${
                      answers[q.id] === o.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {o.option_text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="mt-6 w-full bg-green-600 text-white p-3 rounded"
        >
          {loading ? "Submitting..." : "Submit Test"}
        </button>
      </div>
    </div>
  );
}

export default PlacementTest;