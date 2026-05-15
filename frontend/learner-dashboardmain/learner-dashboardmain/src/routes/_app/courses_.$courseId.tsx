import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/courses_/$courseId")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [locked, setLocked] = useState(false);

  const id = Number(courseId);

  // Load course + lessons
  useEffect(() => {
    api.get(`/courses/learner/course/${id}/`)
      .then((res) => setCourse(res.data))
      .catch(() => setCourse(null));

    api.get(`/courses/learner/lessons/${id}/`)
      .then((res) => setLessons(res.data))
      .catch(() => setLessons([]));
  }, [courseId]);

  // 🔒 GLOBAL LOCK CHECK (if backend says course locked)
  useEffect(() => {
    if (course && course.unlocked === false) {
      setLocked(true);
    }
  }, [course]);

  const handleComplete = async (lessonId: number) => {
    await api.post(`/progress/complete-lesson/${lessonId}/`);

    setLessons((prev) =>
      prev.map((l) =>
        l.id === lessonId ? { ...l, completed: true } : l
      )
    );
  };

  const handleTakeQuiz = (lesson: any) => {
    if (!lesson.quiz_id) return;

    navigate({
      to: "/quiz/$quizId",
      params: { quizId: String(lesson.quiz_id) },
    });
  };

  const openLesson = async (lesson: any) => {
    if (!lesson.unlocked) {
      alert("🚫 Finish previous course first");
      return;
    }

    const res = await api.get(`/courses/learner/lesson/${lesson.id}/`);

    setSelectedLesson({
      ...lesson,
      ...res.data,
    });
  };

  if (locked) {
    return (
      <div className="p-6 text-center text-red-500 text-lg">
        🚫 Finish previous course before accessing this one
      </div>
    );
  }

  if (!course) return <div>Loading...</div>;

  // ---------------- LESSON DETAIL VIEW ----------------
  if (selectedLesson) {
    return (
      <div className="space-y-4 p-4">
        <button onClick={() => setSelectedLesson(null)}>← Back</button>

        <h2 className="text-xl font-bold">{selectedLesson.title}</h2>

        {selectedLesson.video && (
          <video controls className="w-full">
            <source src={selectedLesson.video} />
          </video>
        )}

        <p>{selectedLesson.description}</p>

        {!selectedLesson.completed && (
          <button
            className="border px-4 py-2 rounded"
            onClick={() => handleComplete(selectedLesson.id)}
          >
            Complete Lesson
          </button>
        )}

        {selectedLesson.completed && selectedLesson.has_quiz && (
          <button
            className="border px-4 py-2 rounded"
            onClick={() => handleTakeQuiz(selectedLesson)}
          >
            Take Quiz
          </button>
        )}
      </div>
    );
  }

  // ---------------- COURSE VIEW ----------------
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">{course.title}</h1>

      {/* COURSE QUIZ */}
      {course.has_quiz && (
        <button
          className="border px-4 py-2 rounded"
          onClick={() =>
            navigate({
              to: "/quiz/$quizId",
              params: {
                quizId: String(course.quiz_id),
              },
            })
          }
        >
          Take Course Quiz
        </button>
      )}

      {/* LESSON LIST */}
      {lessons.map((l) => (
        <div
          key={l.id}
          onClick={() => openLesson(l)}
          className={`border p-4 transition ${
            l.unlocked
              ? "cursor-pointer hover:bg-gray-50"
              : "opacity-40 cursor-not-allowed"
          }`}
        >
          {l.title} {l.completed ? "✔" : ""}
        </div>
      ))}
    </div>
  );
}

export default CourseDetailPage;