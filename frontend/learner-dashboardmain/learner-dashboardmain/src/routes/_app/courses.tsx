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

    // ONLY select the first locked-breaking point
    const firstLockedIndex = res.data.findIndex((l: any) => !l.unlocked);

    if (firstLockedIndex === -1) {
      setSelectedLevel(res.data[0]?.id);
    } else if (firstLockedIndex === 0) {
      setSelectedLevel(res.data[0]?.id);
    } else {
      setSelectedLevel(res.data[firstLockedIndex - 1]?.id);
    }
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
  const index = levels.findIndex((l) => l.id === lvl.id);
  const previous = levels[index - 1];

  if (index > 0 && !previous?.unlocked) {
    alert("🚫 Finish previous level first");
    return;
  }

  if (!lvl.unlocked) {
    alert("🚫 This level is locked");
    return;
  }

  setSelectedLevel(lvl.id);
};

  const handleCourseClick = (course: any) => {
    if (!course.unlocked) {
      alert("🚫 Finish previous course first");
      return;
    }

    navigate({
      to: "/courses/$courseId",
      params: {
        courseId: String(course.id),
      },
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Courses</h1>

      {/* LEVELS */}
      <div className="flex gap-2 flex-wrap">
      {levels.map((lvl, index) => {
        const prev = levels[index - 1];
        const locked = index > 0 && !prev?.unlocked;

        return (
          <button
            key={lvl.id}
            onClick={() => handleLevelClick(lvl)}
            disabled={locked}
            className={`px-4 py-2 rounded-lg border transition ${
              lvl.id === selectedLevel
                ? "bg-black text-white"
                : locked
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            {lvl.display_name}
          </button>
        );
      })}
      </div>

      {/* COURSES */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              locked={!c.unlocked}
              onLockedClick={() =>
                alert("🚫 Finish previous course first")
              }
              onClick={() => handleCourseClick(c)}
            />
          ))}
        </div>
      )}

      {/* LEVEL QUIZ */}
      {currentLevel?.has_quiz && (
        <div className="border p-4 rounded-xl mt-6">
          <h2 className="text-xl font-bold">Final Level Quiz</h2>

          <button
            disabled={!currentLevel.can_take_quiz}
            className={`border px-4 py-2 rounded mt-2 ${
              !currentLevel.can_take_quiz
                ? "opacity-50 cursor-not-allowed"
                : ""
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
  );
}

export default CoursesPage;