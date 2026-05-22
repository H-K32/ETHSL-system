import { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "../styles/table.css";

// ---------------- EMPTY QUESTION ----------------
const createEmptyQuestion = () => ({
  question_type: "text", // 👈 NEW

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

    if (quiz.course) {
      quizType = "course";
    }

    if (quiz.level) {
      quizType = "level";
    }

    setForm({
      quiz_type: quizType,

      lesson: quiz.lesson || "",
      course: quiz.course || "",
      level: quiz.level || "",

      description: quiz.description,
      passing_score: quiz.passing_score,

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmDelete) return;

    await API.delete(`/courses/quiz/${id}/`);

    fetchQuizzes();
  };

  // ================= QUESTIONS =================
  const addQuestion = () => {
    setForm({
      ...form,
      questions: [...form.questions, createEmptyQuestion()],
    });
  };

  const updateQuestion = (index, field, value) => {
    const updated = form.questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );

    setForm({
      ...form,
      questions: updated,
    });
  };

  // ================= OPTIONS =================
  const addOption = (qIndex) => {
    const updated = form.questions.map((q, i) => {
      if (i !== qIndex) return q;

      return {
        ...q,
        options: [
          ...q.options,
          {
            option_text: "",
            is_correct: false,
          },
        ],
      };
    });

    setForm({
      ...form,
      questions: updated,
    });
  };

  const updateOption = (qIndex, oIndex, field, value) => {
  const updated = form.questions.map((q, i) => {
    if (i !== qIndex) return q;

    return {
      ...q,
      options: q.options.map((o, j) => {
        if (j !== oIndex) return o;

        return {
          ...o,
          [field]: value,
        };
      }),
    };
  });

  setForm({ ...form, questions: updated });
};

  // ================= SUBMIT =================
// ================= SUBMIT =================
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();

    // ---------------- QUIZ TARGET ----------------
    formData.append(
      "lesson",
      form.quiz_type === "lesson" ? form.lesson || "" : ""
    );

    formData.append(
      "course",
      form.quiz_type === "course" ? form.course || "" : ""
    );

    formData.append(
      "level",
      form.quiz_type === "level" ? form.level || "" : ""
    );

    // ---------------- BASIC FIELDS ----------------
    formData.append("description", form.description || "");
    formData.append("passing_score", form.passing_score || 0);

    // ---------------- QUESTIONS ----------------
    form.questions.forEach((q, qIndex) => {
      formData.append(
        `questions[${qIndex}][question_text]`,
        q.question_text || ""
      );

      formData.append(
        `questions[${qIndex}][points]`,
        q.points || 1
      );

      // question media
      if (q.question_image) {
        formData.append(
          `questions[${qIndex}][question_image]`,
          q.question_image
        );
      }

      if (q.question_video) {
        formData.append(
          `questions[${qIndex}][question_video]`,
          q.question_video
        );
      }

      // ---------------- OPTIONS ----------------
      q.options.forEach((o, oIndex) => {
        formData.append(
          `questions[${qIndex}][options][${oIndex}][option_text]`,
          o.option_text || ""
        );

        formData.append(
          `questions[${qIndex}][options][${oIndex}][is_correct]`,
          o.is_correct ? "true" : "false"
        );

        if (o.option_image) {
          formData.append(
            `questions[${qIndex}][options][${oIndex}][option_image]`,
            o.option_image
          );
        }

        if (o.option_video) {
          formData.append(
            `questions[${qIndex}][options][${oIndex}][option_video]`,
            o.option_video
          );
        }
      });
    });

    // ---------------- API CALL ----------------
    if (editingId) {
      await API.put(`/courses/quiz/${editingId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await API.post("/courses/quiz/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    // ---------------- SUCCESS ----------------
    setMode("list");
    fetchQuizzes();
  } catch (err) {
    console.error("Quiz save error:", err.response?.data || err.message);
    alert("Error saving quiz");
  }
};

  // ================= UI =================
// ================= UI =================
return (
  <>
    <div className="page-header">
      <h1>Manage Quizzes</h1>
    </div>

    {/* ================= LIST ================= */}
    {mode === "list" && (
      <>
        <button className="btn-add" onClick={handleAdd}>
          + Add Quiz
        </button>

        <table className="data-table">
          <thead>
            <tr>
              <th>Quiz Type</th>
              <th>Target</th>
              <th>Questions</th>
              <th>Passing Score</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {quizzes.length > 0 ? (
              quizzes.map((q) => (
                <tr key={q.id}>
                  {/* QUIZ TYPE */}
                  <td>
                    {q.lesson
                      ? "Lesson Quiz"
                      : q.course
                      ? "Course Final Quiz"
                      : q.level
                      ? "Level Final Quiz"
                      : "Unknown"}
                  </td>

                  {/* TARGET */}
                  <td>
                    {q.lesson
                      ? `Lesson #${q.lesson}`
                      : q.course
                      ? `Course #${q.course}`
                      : q.level
                      ? `Level #${q.level}`
                      : "-"}
                  </td>

                  {/* QUESTIONS COUNT */}
                  <td>{q.questions?.length || 0}</td>

                  {/* PASSING SCORE */}
                  <td>{q.passing_score ?? "-"}</td>

                  {/* ACTIONS */}
                  <td>
                    <button onClick={() => handleEdit(q)}>
                      Edit
                    </button>

                    <button onClick={() => handleDelete(q.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No quizzes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </>
    )}
    {mode === "form" && (
      <form onSubmit={handleSubmit} className="form-column">

        {/* QUIZ TYPE */}
        <select
          value={form.quiz_type}
          onChange={(e) =>
            setForm({
              ...form,
              quiz_type: e.target.value,
              lesson: "",
              course: "",
              level: "",
            })
          }
        >
          <option value="lesson">Lesson Quiz</option>
          <option value="course">Course Final Quiz</option>
          <option value="level">Level Final Quiz</option>
        </select>

        {/* LESSON SELECT */}
        {form.quiz_type === "lesson" && (
          <select
            value={form.lesson}
            onChange={(e) =>
              setForm({
                ...form,
                lesson: e.target.value,
              })
            }
            required
          >
            <option value="">Select Lesson</option>

            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        )}

        {/* COURSE SELECT */}
        {form.quiz_type === "course" && (
          <select
            value={form.course}
            onChange={(e) =>
              setForm({
                ...form,
                course: e.target.value,
              })
            }
            required
          >
            <option value="">Select Course</option>

            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        )}

        {/* LEVEL SELECT */}
        {form.quiz_type === "level" && (
          <select
            value={form.level}
            onChange={(e) =>
              setForm({
                ...form,
                level: e.target.value,
              })
            }
            required
          >
            <option value="">Select Level</option>

            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.display_name}
              </option>
            ))}
          </select>
        )}

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description"
          value={form.description || ""}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        {/* PASSING SCORE */}
        <input
          type="number"
          placeholder="Passing Score"
          value={form.passing_score || ""}
          onChange={(e) =>
            setForm({
              ...form,
              passing_score: e.target.value,
            })
          }
          required
        />
        // ================= QUESTIONS =================
        <h3>Questions</h3>

        {(form.questions || []).map((q, qIndex) => (
          <div
            key={qIndex}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10,
            }}
          >

            {/* QUESTION TYPE */}
            <select
              value={q.question_type || "text"}
              onChange={(e) =>
                updateQuestion(qIndex, "question_type", e.target.value)
              }
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>

            {/* TEXT QUESTION */}
            {(!q.question_type || q.question_type === "text") && (
              <input
                type="text"
                placeholder="Question text"
                value={q.question_text || ""}
                onChange={(e) =>
                  updateQuestion(qIndex, "question_text", e.target.value)
                }
              />
            )}

            {/* IMAGE QUESTION */}
            {q.question_type === "image" && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  updateQuestion(
                    qIndex,
                    "question_image",
                    e.target.files[0]
                  )
                }
              />
            )}

            {/* VIDEO QUESTION */}
            {q.question_type === "video" && (
              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  updateQuestion(
                    qIndex,
                    "question_video",
                    e.target.files[0]
                  )
                }
              />
            )}

            {/* POINTS */}
            <input
              type="number"
              placeholder="Points"
              value={q.points || 1}
              onChange={(e) =>
                updateQuestion(qIndex, "points", e.target.value)
              }
            />

            {/* DELETE QUESTION */}
            <button
              type="button"
              onClick={() => {
                const updated = form.questions.filter((_, i) => i !== qIndex);
                setForm({ ...form, questions: updated });
              }}
            >
              Delete Question
            </button>

            {/* ================= OPTIONS ================= */}

            <button
              type="button"
              onClick={() => addOption(qIndex)}
            >
              + Add Option
            </button>

            {(q.options || []).map((o, oIndex) => (
              <div
                key={oIndex}
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 10,
                  alignItems: "center",
                }}
              >

                {/* OPTION TYPE */}
                <select
                  value={o.option_type || "text"}
                  onChange={(e) =>
                    updateOption(
                      qIndex,
                      oIndex,
                      "option_type",
                      e.target.value
                    )
                  }
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>

                {/* TEXT OPTION */}
                {(!o.option_type || o.option_type === "text") && (
                  <input
                    type="text"
                    placeholder="Option text"
                    value={o.option_text || ""}
                    onChange={(e) =>
                      updateOption(
                        qIndex,
                        oIndex,
                        "option_text",
                        e.target.value
                      )
                    }
                  />
                )}

                {/* IMAGE OPTION */}
                {o.option_type === "image" && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      updateOption(
                        qIndex,
                        oIndex,
                        "option_image",
                        e.target.files[0]
                      )
                    }
                  />
                )}

                {/* VIDEO OPTION */}
                {o.option_type === "video" && (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      updateOption(
                        qIndex,
                        oIndex,
                        "option_video",
                        e.target.files[0]
                      )
                    }
                  />
                )}

                {/* CORRECT CHECKBOX */}
                <label>
                  <input
                    type="checkbox"
                    checked={o.is_correct || false}
                    onChange={(e) =>
                      updateOption(
                        qIndex,
                        oIndex,
                        "is_correct",
                        e.target.checked
                      )
                    }
                  />
                  Correct
                </label>
              </div>
            ))}

          </div>
        ))}

        {/* ADD QUESTION (OUTSIDE LOOP - IMPORTANT FIX) */}
        <button type="button" onClick={addQuestion}>
          + Add Question
        </button>

        {/* SAVE */}
        <button type="submit">
          Save Quiz
        </button>

        {/* CANCEL */}
        <button
          type="button"
          onClick={() => setMode("list")}
        >
          Cancel
        </button>
      </form>
    )}
  </>
);
