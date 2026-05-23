import { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "../styles/table.css";



const emptyForm = {
  title: "",
  description: "",
  course: "",
  order: "",
  duration: "",
  video: null,
  thumbnail: null,
};

const ManageLessons = () => {
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);

  const [mode, setMode] = useState("list"); // list | form
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------- FETCH DATA ----------------
  const fetchLessons = async () => {
    const res = await API.get("/courses/lesson/");
    setLessons(res.data);
  };

  const fetchCourses = async () => {
    const res = await API.get("/courses/course/");
    setCourses(res.data);
  };

  useEffect(() => {
    fetchLessons();
    fetchCourses();
  }, []);

  // ---------------- ADD ----------------
  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMode("form");
  };

  // ---------------- EDIT ----------------
  const handleEdit = (lesson) => {
    setForm({
      title: lesson.title,
      description: lesson.description,
      course: lesson.course,
      order: lesson.order,
      duration: lesson.duration || "",
      video: null,
      thumbnail: null,
    });

    setEditingId(lesson.id);
    setMode("form");
  };

  // ---------------- DELETE ----------------
const handleDelete = (lesson) => {
  setLessonToDelete(lesson);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  try {
    await API.delete(`/courses/lesson/${lessonToDelete.id}/`);

    fetchLessons();

    setShowDeleteModal(false);
    setLessonToDelete(null);

  } catch (err) {
    console.error(err);
  }
};

const cancelDelete = () => {
  setShowDeleteModal(false);
  setLessonToDelete(null);
};
    // ---------------- submit ----------------
 const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  const formData = new FormData();
  console.log("FORM STATE:", form);

  formData.append("title", form.title);
  formData.append("description", form.description);
  formData.append("course", form.course);
  formData.append("order", form.order);
  formData.append("duration", form.duration);

  if (form.video) formData.append("video", form.video);
  if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

  try {
    console.log("Submitting lesson...", Object.fromEntries(formData));

    if (editingId) {
      await API.patch(`/courses/lesson/${editingId}/`, formData);
    } else {
      await API.post("/courses/lesson/", formData);
    }

    setSuccess("Lesson saved successfully!");
    setMode("list");
    fetchLessons();

  } catch (err) {
  console.log("FULL ERROR OBJECT:", err);
  console.log("STATUS:", err.response?.status);
  console.log("DATA:", err.response?.data);
  console.log("HEADERS:", err.response?.headers);

  setError(JSON.stringify(err.response?.data || err.message));
}
};
  // ---------------- UI ----------------
  return (
    <>
      <div className="page-header">
        <h1>Manage Lessons</h1>
        <p>Organize and manage lesson content</p>
      </div>

      {/* ================= LIST ================= */}
      {mode === "list" && (
        <>
          <div className="table-toolbar">
            <button className="btn-add" onClick={handleAdd}>
              + Add Lesson
            </button>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Order</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {lessons.map((l) => (
                  <tr key={l.id}>
                    <td>{l.title}</td>
                    <td>{l.course_title}</td>
                    <td>{l.order}</td>
                    <td>{l.duration}</td>

                    <td>
                      <button
                        className="btn-action edit"
                        onClick={() => handleEdit(l)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn-action danger"
                        onClick={() => handleDelete(l)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {error && (
  <div style={{ color: "red", marginBottom: 10 }}>
    ❌ {error}
  </div>
)}

{success && (
  <div style={{ color: "green", marginBottom: 10 }}>
    ✅ {success}
  </div>
)}

      {/* ================= FORM ================= */}
      {mode === "form" && (
        <div className="form-container">
          <h2>{editingId ? "Edit Lesson" : "Add Lesson"}</h2>

          <form onSubmit={handleSubmit} className="form-column">

            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />

            {/* COURSE DROPDOWN */}
            <select
              value={form.course}
              onChange={(e) =>
                setForm({ ...form, course: e.target.value })
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

            <input
              type="number"
              placeholder="Order"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Duration"
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: e.target.value })
              }
            />

            {/* VIDEO */}
            <label>Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                setForm({ ...form, video: e.target.files[0] })
              }
              required={!editingId}
            />

            {/* THUMBNAIL */}
            <label>Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, thumbnail: e.target.files[0] })
              }
            />

            <button type="submit" className="btn-add">
              {editingId ? "Update Lesson" : "Create Lesson"}
               
            </button>

            <button
              type="button"
              className="btn-action"
              onClick={() => setMode("list")}
            >
              Cancel
            </button>
          </form>
        </div>
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
      <h3 style={{ marginBottom: "12px" }}>Delete Lesson</h3>

<p style={{ marginBottom: "20px", color: "#555" }}>
  Are you sure you want to delete lesson{" "}
  <strong style={{ color: "red" }}>
    "{lessonToDelete?.title}"
  </strong>?
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

export default ManageLessons;