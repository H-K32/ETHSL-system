import { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "../styles/managequiz.css";

// ---------------- EMPTY QUESTION ----------------
const createEmptyQuestion = () => ({
  question_type: "text",

  question_text: "",
  question_image: null,
  question_image_url: "",
  question_video: null,
  question_video_url: "",

  points: 1,

  options: [
    {
      option_type: "text",
      option_text: "",
      option_image: null,
      option_image_url: "",
      option_video: null,
      option_video_url: "",
      is_correct: false,
    },
    {
      option_type: "text",
      option_text: "",
      option_image: null,
      option_image_url: "",
      option_video: null,
      option_video_url: "",
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

  const [quizToDelete, setQuizToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);



  const [quizzes, setQuizzes] = useState([]);

  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [levels, setLevels] = useState([]);

  const [mode, setMode] = useState("list");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const normalizePositiveInt = (value) => {
    if (value === "" || value === null || value === undefined) {
      return "";
    }

    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
      return "";
    }

    return numberValue < 1 ? 1 : numberValue;
  };

  const validateForm = () => {
    const errors = {};

    if (!form.passing_score || Number(form.passing_score) < 1) {
      errors.passing_score = "Passing score must be at least 1.";
    }

    if (!Array.isArray(form.questions) || form.questions.length < 2) {
      errors.questions = "Quiz must contain at least two questions.";
    }

    const questionErrors = {};

    form.questions.forEach((q, qIndex) => {
      const qError = {};

      const hasQuestionContent =
        (q.question_type === "text" && q.question_text?.trim()) ||
        (q.question_type === "image" && (q.question_image || q.question_image_url)) ||
        (q.question_type === "video" && (q.question_video || q.question_video_url));

      if (!hasQuestionContent) {
        qError.question = "Question must include text, image, or video.";
      }

      if (!q.points || Number(q.points) < 1) {
        qError.points = "Points must be at least 1.";
      }

      if (!Array.isArray(q.options) || q.options.length < 2) {
        qError.options = "Each question needs at least two options.";
      }

      const optionErrors = {};
      q.options?.forEach((o, oIndex) => {
        const hasOptionContent =
          (o.option_type === "text" && o.option_text?.trim()) ||
          (o.option_type === "image" && (o.option_image || o.option_image_url)) ||
          (o.option_type === "video" && (o.option_video || o.option_video_url));

        if (!hasOptionContent) {
          optionErrors[oIndex] = "Option must include text, image, or video.";
        }
      });

      if (Object.keys(optionErrors).length > 0) {
        qError.option_errors = optionErrors;
      }

      if (!q.options?.some((o) => o.is_correct)) {
        qError.correct = "Select one correct answer.";
      }

      if (Object.keys(qError).length > 0) {
        questionErrors[qIndex] = qError;
      }
    });

    if (Object.keys(questionErrors).length > 0) {
      errors.question_errors = questionErrors;
    }

    return errors;
  };

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
          id: q.id, // Track existing question ID
          ...q,

          question_type: q.question_image
            ? "image"
            : q.question_video
            ? "video"
            : "text",

          // Store existing URLs separately so we can display them
          question_image_url: q.question_image || "",
          question_video_url: q.question_video || "",
          
          options: q.options.map((o) => ({
            id: o.id, // Track existing option ID
            ...o,

            option_type: o.option_image
              ? "image"
              : o.option_video
              ? "video"
              : "text",

            option_image_url: o.option_image || "",
            option_video_url: o.option_video || "",
          })),
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
  const newValue = field === "points" ? normalizePositiveInt(value) : value;

  setForm((prev) => ({
    ...prev,
    questions: prev.questions.map((q, i) =>
      i === index ? { ...q, [field]: newValue } : q
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
          option_image_url: "",
          option_video: null,
          option_video_url: "",
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

  const errors = validateForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  setFormErrors({});

  const payload = {
    quiz_type: form.quiz_type === 'placement' ? 'placement' : form.quiz_type === 'level' ? 'final' : form.quiz_type,
    lesson: form.quiz_type === "lesson" ? Number(form.lesson) : null,
    course: form.quiz_type === "course" ? Number(form.course) : null,
    level: (form.quiz_type === "level" || form.quiz_type === "placement") ? Number(form.level) : null,

    description: form.description,
    passing_score: Number(form.passing_score),

    questions: form.questions.map((q) => ({
      question_type: q.question_type || "text",
      question_text: q.question_text || "",
      points: q.points || 1,

      options: q.options.map((o) => ({
        option_type: o.option_type || "text",
        option_text: o.option_text || "",
        is_correct: o.is_correct,
      })),
    })),
  };

  try {
    const formData = new FormData();

    // JSON blob (MAIN CHANGE)
    formData.append("data", JSON.stringify(payload));

    // ---------------- FILES (FLAT) ----------------
    form.questions.forEach((q, qIndex) => {
      if (q.question_image instanceof File) {
        formData.append(`question_image_${qIndex}`, q.question_image);
      }

      if (q.question_video instanceof File) {
        formData.append(`question_video_${qIndex}`, q.question_video);
      }

      q.options.forEach((o, oIndex) => {
        if (o.option_image instanceof File) {
          formData.append(
            `option_image_${qIndex}_${oIndex}`,
            o.option_image
          );
        }

        if (o.option_video instanceof File) {
          formData.append(
            `option_video_${qIndex}_${oIndex}`,
            o.option_video
          );
        }
      });
    });

    if (editingId) {
      await API.put(`/courses/quiz/${editingId}/`, formData);
    } else {
      await API.post("/courses/quiz/", formData);
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

      {/* ================= LIST ================= */}
      {mode === "list" && (
        <>
          {/* ONLY CHANGE IS HERE - Added the toolbar div */}
          <div className="table-toolbar">
            <button className="btn-add" onClick={handleAdd}>
              + Add Quiz
            </button>
          </div>

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
                    {q.level && q.quiz_type === "placement" && "Placement Test"}
                    {q.level && q.quiz_type !== "placement" && "Level Final Quiz"}
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
            <option value="lesson">Lesson Quiz</option>
            <option value="course">Course Final Quiz</option>
            <option value="level">Level Final Quiz</option>
            <option value="placement">Placement Test</option>
          </select>

          {/* LESSON SELECT */}
          {form.quiz_type === "lesson" && (
            <select
              value={form.lesson}
              onChange={(e) => setForm({ ...form, lesson: e.target.value })}
              required
            >
              <option value="">Select Lesson</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          )}

          {/* COURSE SELECT */}
          {form.quiz_type === "course" && (
            <select
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              required
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          )}

          {/* LEVEL SELECT — for Level Final Quiz OR Placement Test */}
          {(form.quiz_type === "level" || form.quiz_type === "placement") && (
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              required
            >
              <option value="">Select Level</option>
              {levels
                .filter((l) =>
                  form.quiz_type === "placement"
                    ? l.name === "intermediate" || l.name === "advanced"
                    : true
                )
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.display_name || l.name}
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
            min={1}
            step={1}
            placeholder="Passing Score"
            value={form.passing_score}
            onChange={(e) =>
              setForm({
                ...form,
                passing_score: normalizePositiveInt(e.target.value),
              })
            }
            required
          />
          {formErrors.passing_score && (
            <p style={{ color: "red" }}>{formErrors.passing_score}</p>
          )}
          {formErrors.questions && (
            <p style={{ color: "red" }}>{formErrors.questions}</p>
          )}

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
          updateQuestion(qIndex, "question_text", e.target.value)
        }
      />
    )}

    {q.question_type === "image" && (
      <div>
        {q.question_image_url && editingId && (
          <div style={{ marginBottom: "8px", fontSize: "12px", color: "#666" }}>
            Current: <a href={q.question_image_url} target="_blank" rel="noreferrer">view image</a>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) updateQuestion(qIndex, "question_image", file);
          }}
        />
        {q.question_image_url && editingId && !q.question_image && (
          <p style={{ fontSize: "11px", color: "#888" }}>Leave empty to keep existing image</p>
        )}
      </div>
    )}

    {q.question_type === "video" && (
      <div>
        {q.question_video_url && editingId && (
          <div style={{ marginBottom: "8px", fontSize: "12px", color: "#666" }}>
            Current: <a href={q.question_video_url} target="_blank" rel="noreferrer">view video</a>
          </div>
        )}
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) updateQuestion(qIndex, "question_video", file);
          }}
        />
        {q.question_video_url && editingId && !q.question_video && (
          <p style={{ fontSize: "11px", color: "#888" }}>Leave empty to keep existing video</p>
        )}
      </div>
    )}

    {/* ================= QUESTION VALIDATION ================= */}
    {formErrors.question_errors?.[qIndex]?.question && (
      <p style={{ color: "red" }}>
        {formErrors.question_errors[qIndex].question}
      </p>
    )}

    {/* POINTS */}
    <input
      type="number"
      min={1}
      step={1}
      placeholder="Points"
      value={q.points}
      onChange={(e) =>
        updateQuestion(qIndex, "points", e.target.value)
      }
    />
    {formErrors.question_errors?.[qIndex]?.points && (
      <p style={{ color: "red" }}>
        {formErrors.question_errors[qIndex].points}
      </p>
    )}

    {/* ================= ADD OPTION ================= */}
    <button type="button" onClick={() => addOption(qIndex)}>
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

        {/* TEXT OPTION */}
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

        {/* IMAGE OPTION */}
        {o.option_type === "image" && (
          <div>
            {o.option_image_url && editingId && (
              <div style={{ marginBottom: "6px", fontSize: "11px", color: "#666" }}>
                Current: <a href={o.option_image_url} target="_blank" rel="noreferrer">view image</a>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file)
                  updateOption(qIndex, oIndex, "option_image", file);
              }}
            />
            {o.option_image_url && editingId && !o.option_image && (
              <p style={{ fontSize: "10px", color: "#888" }}>Leave empty to keep</p>
            )}
          </div>
        )}

        {/* VIDEO OPTION */}
        {o.option_type === "video" && (
          <div>
            {o.option_video_url && editingId && (
              <div style={{ marginBottom: "6px", fontSize: "11px", color: "#666" }}>
                Current: <a href={o.option_video_url} target="_blank" rel="noreferrer">view video</a>
              </div>
            )}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file)
                  updateOption(qIndex, oIndex, "option_video", file);
              }}
            />
            {o.option_video_url && editingId && !o.option_video && (
              <p style={{ fontSize: "10px", color: "#888" }}>Leave empty to keep</p>
            )}
          </div>
        )}

        {/* ================= CORRECT (RADIO BEHAVIOR) ================= */}
        <label>
          <input
            type="checkbox"
            checked={!!o.is_correct}
            onChange={() => {
              // FORCE ONLY ONE CORRECT OPTION PER QUESTION
              const updatedOptions = q.options.map((opt, i) => ({
                ...opt,
                is_correct: i === oIndex,
              }));

              setForm((prev) => {
                const updatedQuestions = [...prev.questions];
                updatedQuestions[qIndex].options = updatedOptions;
                return { ...prev, questions: updatedQuestions };
              });
            }}
          />
          Correct
        </label>
            {formErrors.question_errors?.[qIndex]?.option_errors?.[oIndex] && (
              <p style={{ color: "red", marginTop: 4 }}>
                {formErrors.question_errors[qIndex].option_errors[oIndex]}
              </p>
            )}
          </div>
        ))}

        {/* ================= OPTION VALIDATION ================= */}
        {formErrors.question_errors?.[qIndex]?.options && (
          <p style={{ color: "red" }}>
            {formErrors.question_errors[qIndex].options}
          </p>
        )}

        {formErrors.question_errors?.[qIndex]?.correct && (
          <p style={{ color: "red" }}>
            {formErrors.question_errors[qIndex].correct}
          </p>
        )}

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