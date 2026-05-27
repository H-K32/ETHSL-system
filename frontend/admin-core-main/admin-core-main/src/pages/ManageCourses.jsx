import { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "../styles/managecourse.css";

const emptyForm = {
  title: "",
  description: "",
  level: "",
};

const ManageCourses = () => {

  const [courseToDelete, setCourseToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [levels, setLevels] = useState([]);

  const [mode, setMode] = useState("list"); // list | form
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // ---------------- FETCH ----------------
  const fetchCourses = async () => {
    const res = await API.get("/courses/course/");
    setCourses(res.data);
  };

  const fetchLevels = async () => {
    const res = await API.get("/courses/level/");
    setLevels(res.data);
  };

  useEffect(() => {
    fetchCourses();
    fetchLevels();
  }, []);

  // ---------------- ADD ----------------
  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMode("form");
  };

  // ---------------- EDIT ----------------
  const handleEdit = (course) => {
    setForm({
      title: course.title,
      description: course.description,
      level: course.level,
    });
    setEditingId(course.id);
    setMode("form");
  };

 // ---------------- DELETE ----------------
const handleDelete = (course) => {
  setCourseToDelete(course);
  setShowDeleteModal(true);
};

const confirmDelete = async () => {
  try {
    await API.delete(`/courses/course/${courseToDelete.id}/`);

    fetchCourses();

    setShowDeleteModal(false);
    setCourseToDelete(null);
  } catch (err) {
    console.error(err);
  }
};

const cancelDelete = () => {
  setShowDeleteModal(false);
  setCourseToDelete(null);
};

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await API.put(`/courses/course/${editingId}/`, form);
    } else {
      await API.post("/courses/course/", form);
    }

    setMode("list");
    fetchCourses();
  };

  // ---------------- UI ----------------
  return (
    <>
      <div className="page-header">
        <h1>Manage Courses</h1>
        <p>Create, edit, and manage courses</p>
      </div>

      {/* LIST VIEW */}
      {mode === "list" && (
        <>
          <div className="table-toolbar">
            <button className="btn-add" onClick={handleAdd}>
              + Add Course
            </button>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Level</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>{c.description}</td>
                    <td>{c.level}</td>

                    <td>
                      <button
                        className="btn-action edit"
                        onClick={() => handleEdit(c)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn-action danger"
                        onClick={() => handleDelete(c)}
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

      {/* FORM VIEW */}
      {mode === "form" && (
        <div className="form-container">
          <h2>{editingId ? "Edit Course" : "Add Course"}</h2>

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

            <select
              value={form.level}
              onChange={(e) =>
                setForm({ ...form, level: e.target.value })
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

            <button type="submit" className="btn-add">
              {editingId ? "Update Course" : "Create Course"}
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
      <h3 style={{ marginBottom: "12px" }}>Delete Course</h3>

      <p style={{ marginBottom: "20px", color: "#555" }}>
  Are you sure you want to delete the course {" "}
  <strong style={{ color: "red" }}> "{courseToDelete?.title}"</strong>?
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

export default ManageCourses;