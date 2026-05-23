import { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "../styles/table.css";

// ---------------- EMPTY QUESTION ----------------
const createEmptyQuestion = () => ({
  question_type: "text",
  question_text: "",
  points: 1,
  options: [
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
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

  const [quizToDelete, setQuizToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);



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
const handleDelete = (quiz) => {
  setQuizToDelete(quiz);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  try {
    await API.delete(
      `/courses/quiz/${quizToDelete.id}/`
    );

    fetchQuizzes();

    setShowDeleteModal(false);
    setQuizToDelete(null);

  } catch (err) {
    console.error(err);
  }
};

const cancelDelete = () => {
  setShowDeleteModal(false);
  setQuizToDelete(null);
};

  // ================= QUESTIONS =================
  const addQuestion = () => {
    setForm({
      ...form,
      questions: [...form.questions, createEmptyQuestion()],
    });
  };

const updateQuestion = (index, field, value) => {
  setForm((prev) => ({
    ...prev,
    questions: prev.questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    ),
  }));
};
  // ================= OPTIONS =================
 const addOption = (qIndex) => {
  setForm((prev) => {
    const updatedQuestions = [...prev.questions];

    const q = updatedQuestions[qIndex];

    updatedQuestions[qIndex] = {
      ...q,
      options: [
        ...q.options,
        {
          option_type: "text",
          option_text: "",
          option_image: null,
          option_video: null,
          is_correct: false,
        },
      ],
    };

    return { ...prev, questions: updatedQuestions };
  });
};

const updateOption = (qIndex, oIndex, field, value) => {
  setForm((prev) => {
    const updatedQuestions = [...prev.questions];

    const q = updatedQuestions[qIndex];

    const updatedOptions = q.options.map((o, j) => {
      if (j !== oIndex) return o;

      let updated = { ...o, [field]: value };

      // HANDLE TYPE SWITCH CLEANLY
      if (field === "option_type") {
        if (value === "text") {
          updated.option_image = null;
          updated.option_video = null;
        }

        if (value === "image") {
          updated.option_text = "";
          updated.option_video = null;
        }

        if (value === "video") {
          updated.option_text = "";
          updated.option_image = null;
        }
      }

      return updated;
    });

    updatedQuestions[qIndex] = {
      ...q,
      options: updatedOptions,
    };

    return { ...prev, questions: updatedQuestions };
  });
};

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      lesson:
        form.quiz_type === "lesson"
          ? Number(form.lesson)
          : null,

      course:
        form.quiz_type === "course"
          ? Number(form.course)
          : null,

      level:
        form.quiz_type === "level"
          ? Number(form.level)
          : null,

      description: form.description,

      passing_score: Number(form.passing_score),

      questions: form.questions.map((q) => ({
        question_text: q.question_text,

        points: q.points || 1,

        options: q.options.map((o) => ({
          option_text: o.option_text,
          is_correct: o.is_correct,
        })),
      })),
    };

    try {
      if (editingId) {
        await API.put(
          `/courses/quiz/${editingId}/`,
          payload
        );
      } else {
        await API.post("/courses/quiz/", payload);
      }

      setMode("list");

      fetchQuizzes();
    } catch (err) {
      console.error(err.response?.data);

      alert("Error saving quiz. Check console.");
    }
  };

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
              {quizzes.map((q) => (
                <tr key={q.id}>
                  <td>
                    {q.lesson && "Lesson Quiz"}
                    {q.course && "Course Final Quiz"}
                    {q.level && "Level Final Quiz"}
                  </td>

                  <td>
                    {q.lesson && `Lesson #${q.lesson}`}
                    {q.course && `Course #${q.course}`}
                    {q.level && `Level #${q.level}`}
                  </td>

                  <td>{q.questions?.length}</td>

                  <td>{q.passing_score}</td>

                  <td>
                    <button onClick={() => handleEdit(q)}>
                      Edit
                    </button>

                    <button onClick={() => handleDelete(q)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ================= FORM ================= */}
      {mode === "form" && (
        <form
          onSubmit={handleSubmit}
          className="form-column"
        >

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
            <option value="lesson">
              Lesson Quiz
            </option>

            <option value="course">
              Course Final Quiz
            </option>

            <option value="level">
              Level Final Quiz
            </option>
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
              <option value="">
                Select Lesson
              </option>

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
              <option value="">
                Select Course
              </option>

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
              <option value="">
                Select Level
              </option>

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
            value={form.description}
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
            value={form.passing_score}
            onChange={(e) =>
              setForm({
                ...form,
                passing_score: e.target.value,
              })
            }
            required
          />

{/* QUESTIONS */}
<h3>Questions</h3>

{form.questions.map((q, qIndex) => (
  <div
    key={qIndex}
    style={{
      border: "1px solid #ccc",
      padding: 10,
      marginBottom: 10,
    }}
  >
    {/* ================= QUESTION TYPE ================= */}
    <select
      value={q.question_type || "text"}
      onChange={(e) => {
        const type = e.target.value;

        updateQuestion(qIndex, "question_type", type);

        // reset unused fields
        if (type === "text") {
          updateQuestion(qIndex, "question_image", null);
          updateQuestion(qIndex, "question_video", null);
        }

        if (type === "image") {
          updateQuestion(qIndex, "question_text", "");
          updateQuestion(qIndex, "question_video", null);
        }

        if (type === "video") {
          updateQuestion(qIndex, "question_text", "");
          updateQuestion(qIndex, "question_image", null);
        }
      }}
    >
      <option value="text">Text Question</option>
      <option value="image">Image Question</option>
      <option value="video">Video Question</option>
    </select>

    {/* ================= QUESTION INPUT ================= */}

    {(!q.question_type || q.question_type === "text") && (
      <input
        type="text"
        placeholder="Question text"
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
      value={q.points}
      onChange={(e) =>
        updateQuestion(qIndex, "points", e.target.value)
      }
    />

    {/* ================= ADD OPTION ================= */}
    <button
      type="button"
      onClick={() => addOption(qIndex)}
    >
      + Add Option
    </button>

    {/* ================= OPTIONS ================= */}
    {q.options.map((o, oIndex) => (
      <div
        key={oIndex}
        style={{
          display: "flex",
          gap: 10,
          marginTop: 10,
          alignItems: "center",
        }}
      >
        {/* OPTION TYPE SELECT */}
        <select
          value={o.option_type || "text"}
          onChange={(e) => {
            const type = e.target.value;

            updateOption(qIndex, oIndex, "option_type", type);

            // RESET OLD DATA
            if (type === "text") {
              updateOption(qIndex, oIndex, "option_image", null);
              updateOption(qIndex, oIndex, "option_video", null);
            }

            if (type === "image") {
              updateOption(qIndex, oIndex, "option_text", "");
              updateOption(qIndex, oIndex, "option_video", null);
            }

            if (type === "video") {
              updateOption(qIndex, oIndex, "option_text", "");
              updateOption(qIndex, oIndex, "option_image", null);
            }
          }}
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>

        {/* ================= TEXT OPTION ================= */}
        {(!o.option_type || o.option_type === "text") && (
          <input
            type="text"
            placeholder="Option text"
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
        )}

        {/* ================= IMAGE OPTION ================= */}
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

        {/* ================= VIDEO OPTION ================= */}
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

        {/* ================= CORRECT ================= */}
        <label>
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
          Correct
        </label>
      </div>
    ))}

    {/* ================= DELETE QUESTION ================= */}
    <button
      type="button"
      onClick={() => {
        const updated = form.questions.filter(
          (_, i) => i !== qIndex
        );
        setForm({ ...form, questions: updated });
      }}
      style={{
        marginTop: 10,
        color: "red",
      }}
    >
      Delete Question
    </button>
  </div>
))}

{/* ================= ADD QUESTION ================= */}
<button type="button" onClick={addQuestion}>
  + Add Question
</button>

{/* ================= SAVE ================= */}
<button type="submit">
  Save Quiz
</button>

{/* ================= CANCEL ================= */}
<button
  type="button"
  onClick={() => setMode("list")}
>
  Cancel
</button>
        </form>
      )}

             {/* DELETE MODAL */}
{showDeleteModal && (
  <div
    className="modal-overlay"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      className="delete-modal"
      style={{
        background: "#fff",
        padding: "24px",
        borderRadius: "12px",
        width: "400px",
        maxWidth: "90%",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        textAlign: "center",
      }}
    >
      <h3 style={{ marginBottom: "12px" }}>Delete Quiz</h3>

<p style={{ marginBottom: "20px", color: "#555" }}>
  Are you sure you want to delete this{" "}
  <strong>
    {quizToDelete?.lesson && "Lesson Quiz"}
    {quizToDelete?.course && "Course Final Quiz"}
    {quizToDelete?.level && "Level Final Quiz"}
  </strong>
  ?
</p>
      <div
        className="modal-actions"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <button
          className="btn-action"
          onClick={cancelDelete}
        >
          Cancel
        </button>

        <button
          className="btn-action danger"
          onClick={confirmDelete}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default ManageQuizzes;