import { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "../styles/table.css";

// ---------------- EMPTY QUESTION ----------------
const createEmptyQuestion = () => ({
  question_type: "text",

  question_text: "",
  question_image: null,
  question_video: null,

  points: 1,

  options: [
    {
      option_type: "text",
      option_text: "",
      option_image: null,
      option_video: null,
      is_correct: false,
    },
    {
      option_type: "text",
      option_text: "",
      option_image: null,
      option_video: null,
      is_correct: false,
    },
  ],
});

// ---------------- EMPTY FORM ----------------
const emptyForm = {
  quiz_type: "lesson",
  lesson: "",
  course: "",
  level: "",
  description: "",
  passing_score: "",
  questions: [],
};

const ManageQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [levels, setLevels] = useState([]);

  const [mode, setMode] = useState("list");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // ================= FETCH =================
  const fetchQuizzes = async () => {
    const res = await API.get("/courses/quiz/");
    setQuizzes(res.data);
  };

  const fetchLessons = async () => {
    const res = await API.get("/courses/lesson/");
    setLessons(res.data);
  };

  const fetchCourses = async () => {
    const res = await API.get("/courses/course/");
    setCourses(res.data);
  };

  const fetchLevels = async () => {
    const res = await API.get("/courses/level/");
    setLevels(res.data);
  };

  useEffect(() => {
    fetchQuizzes();
    fetchLessons();
    fetchCourses();
    fetchLevels();
  }, []);

  // ================= ADD =================
  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMode("form");
  };

  // ================= EDIT =================
  const handleEdit = (quiz) => {
    let quizType = "lesson";
    if (quiz.course) quizType = "course";
    if (quiz.level) quizType = "level";

    setForm({
      quiz_type: quizType,
      lesson: quiz.lesson || "",
      course: quiz.course || "",
      level: quiz.level || "",
      description: quiz.description || "",
      passing_score: quiz.passing_score || "",
      questions: quiz.questions
        ? quiz.questions.map((q) => ({
            ...q,
            options: q.options.map((o) => ({ ...o })),
          }))
        : [],
    });

    setEditingId(quiz.id);
    setMode("form");
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    await API.delete(`/courses/quiz/${id}/`);
    fetchQuizzes();
  };

  // ================= QUESTIONS =================
  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion()],
    }));
  };

  const updateQuestion = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.questions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  // ================= OPTIONS =================
  const addOption = (qIndex) => {
    setForm((prev) => {
      const updated = [...prev.questions];

      updated[qIndex].options = [
        ...updated[qIndex].options,
        {
          option_type: "text",
          option_text: "",
          option_image: null,
          option_video: null,
          is_correct: false,
        },
      ];

      return { ...prev, questions: updated };
    });
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    setForm((prev) => {
      const updated = [...prev.questions];

      const options = [...updated[qIndex].options];

      options[oIndex] = {
        ...options[oIndex],
        [field]: value,
      };

      updated[qIndex].options = options;

      return { ...prev, questions: updated };
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append(
      "lesson",
      form.quiz_type === "lesson" ? form.lesson : ""
    );
    formData.append(
      "course",
      form.quiz_type === "course" ? form.course : ""
    );
    formData.append(
      "level",
      form.quiz_type === "level" ? form.level : ""
    );

    formData.append("description", form.description);
    formData.append("passing_score", form.passing_score);

    form.questions.forEach((q, qIndex) => {
      formData.append(
        `questions[${qIndex}][question_text]`,
        q.question_text
      );
      formData.append(
        `questions[${qIndex}][points]`,
        q.points || 1
      );

      if (q.question_image)
        formData.append(
          `questions[${qIndex}][question_image]`,
          q.question_image
        );

      if (q.question_video)
        formData.append(
          `questions[${qIndex}][question_video]`,
          q.question_video
        );

      q.options.forEach((o, oIndex) => {
        formData.append(
          `questions[${qIndex}][options][${oIndex}][option_text]`,
          o.option_text
        );

        formData.append(
          `questions[${qIndex}][options][${oIndex}][is_correct]`,
          o.is_correct
        );

        if (o.option_image)
          formData.append(
            `questions[${qIndex}][options][${oIndex}][option_image]`,
            o.option_image
          );

        if (o.option_video)
          formData.append(
            `questions[${qIndex}][options][${oIndex}][option_video]`,
            o.option_video
          );
      });
    });

    try {
      if (editingId) {
        await API.put(`/courses/quiz/${editingId}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await API.post("/courses/quiz/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setMode("list");
      fetchQuizzes();
    } catch (err) {
      console.error(err.response?.data);
      alert("Error saving quiz");
    }
  };

  // ================= UI =================
  return (
    <>
      <div className="page-header">
        <h1>Manage Quizzes</h1>
      </div>

      {/* LIST */}
      {mode === "list" && (
        <>
          <button className="btn-add" onClick={handleAdd}>
            + Add Quiz
          </button>

          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Target</th>
                <th>Questions</th>
                <th>Passing Score</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {quizzes.map((q) => (
                <tr key={q.id}>
                  <td>
                    {q.lesson && "Lesson Quiz"}
                    {q.course && "Course Quiz"}
                    {q.level && "Level Quiz"}
                  </td>

                  <td>
                    {q.lesson && `Lesson #${q.lesson}`}
                    {q.course && `Course #${q.course}`}
                    {q.level && `Level #${q.level}`}
                  </td>

                  <td>{q.questions?.length || 0}</td>
                  <td>{q.passing_score}</td>

                  <td>
                    <button onClick={() => handleEdit(q)}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(q.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* FORM */}
      {mode === "form" && (
        <form onSubmit={handleSubmit} className="form-column">
          {/* quiz type */}
          <select
            value={form.quiz_type}
            onChange={(e) =>
              setForm({
                ...form,
                quiz_type: e.target.value,
              })
            }
          >
            <option value="lesson">Lesson</option>
            <option value="course">Course</option>
            <option value="level">Level</option>
          </select>

          <input
            type="number"
            placeholder="Passing Score"
            value={form.passing_score}
            onChange={(e) =>
              setForm({
                ...form,
                passing_score: e.target.value,
              })
            }
          />

          <h3>Questions</h3>

          {form.questions.map((q, qIndex) => (
            <div key={qIndex}>
              <select
                value={q.question_type}
                onChange={(e) =>
                  updateQuestion(
                    qIndex,
                    "question_type",
                    e.target.value
                  )
                }
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>

              {q.question_type === "text" && (
                <input
                  value={q.question_text}
                  onChange={(e) =>
                    updateQuestion(
                      qIndex,
                      "question_text",
                      e.target.value
                    )
                  }
                />
              )}

              <button
                type="button"
                onClick={() => addOption(qIndex)}
              >
                Add Option
              </button>

              {q.options.map((o, oIndex) => (
                <div key={oIndex}>
                  <input
                    value={o.option_text}
                    onChange={(e) =>
                      updateOption(
                        qIndex,
                        oIndex,
                        "option_text",
                        e.target.value
                      )
                    }
                  />

                  <input
                    type="checkbox"
                    checked={o.is_correct}
                    onChange={(e) =>
                      updateOption(
                        qIndex,
                        oIndex,
                        "is_correct",
                        e.target.checked
                      )
                    }
                  />
                </div>
              ))}
            </div>
          ))}

          <button type="button" onClick={addQuestion}>
            Add Question
          </button>

          <button type="submit">Save</button>
          <button type="button" onClick={() => setMode("list")}>
            Cancel
          </button>
        </form>
      )}
    </>
  );
};

export default ManageQuizzes;