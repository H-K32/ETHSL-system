import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import CourseCard from "@/components/CourseCard";

export const Route = createFileRoute("/_app/courses")({
  component: CoursesPage,
});

function CoursesPage() {
  const navigate = useNavigate();

  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses/learner/levels/").then((res) => {
      setLevels(res.data);
      if (res.data.length > 0) setSelectedLevel(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedLevel) return;

    setLoading(true);

    api
      .get(`/courses/learner/courses/${selectedLevel}/`)
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false));
  }, [selectedLevel]);

  const currentLevel = levels.find((l) => l.id === selectedLevel);

  const handleLevelClick = (lvl: any) => {
    if (!lvl.unlocked) {
      alert("You must complete previous level first");
      return;
    }
    setSelectedLevel(lvl.id);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Courses</h1>

      {/* LEVELS */}
      <div className="flex gap-2 flex-wrap">
        {levels.map((lvl) => (
          <button
            key={lvl.id}
            onClick={() => handleLevelClick(lvl)}
            className={`px-4 py-2 rounded-lg border transition ${
              selectedLevel === lvl.id
                ? "bg-primary text-white"
                : lvl.unlocked
                ? ""
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            {lvl.name}
          </button>
        ))}
      </div>

      {/* COURSES */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>

          {/* LEVEL QUIZ */}
          {currentLevel?.has_quiz && (
            <div className="border p-4 rounded-xl">
              <h2 className="text-xl font-bold">Final Level Quiz</h2>

              <button
                disabled={!currentLevel.can_take_quiz}
                className={`border px-4 py-2 rounded ${
                  !currentLevel.can_take_quiz ? "opacity-50" : ""
                }`}
                onClick={() =>
                  navigate({
                    to: "/quiz/$quizId",
                    params: {
                      quizId: String(currentLevel.quiz_id),
                    },
                  })
                }
              >
                Take Level Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CoursesPage;