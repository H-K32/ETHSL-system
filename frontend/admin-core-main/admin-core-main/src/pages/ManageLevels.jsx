import { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "../styles/managelevel.css";

const emptyForm = {
  name: "",
  order: "",
};

const ManageLevels = () => {
  const [levels, setLevels] = useState([]);

  const [mode, setMode] = useState("list"); // list | form
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // ---------------- FETCH ----------------
  const fetchLevels = async () => {
    const res = await API.get("/courses/level/");
    setLevels(res.data);
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  // ---------------- ADD ----------------
  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMode("form");
  };

  // ---------------- EDIT ----------------
  const handleEdit = (level) => {
    setForm({
      name: level.name,
      order: level.order,
    });
    setEditingId(level.id);
    setMode("form");
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this level?"
    );

    if (!confirmDelete) return;

    await API.delete(`/courses/level/${id}/`);
    fetchLevels();
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await API.put(`/courses/level/${editingId}/`, form);
    } else {
      await API.post("/courses/level/", form);
    }

    setMode("list");
    fetchLevels();
  };

  // ---------------- UI ----------------
  return (
    <>
      <div className="page-header">
        <h1>Manage Levels</h1>
        <p>Create, edit, and organize learning levels</p>
      </div>

      {/* LIST VIEW */}
      {mode === "list" && (
        <>
          <div className="table-toolbar">
            <button className="btn-add" onClick={handleAdd}>
              + Add Level
            </button>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {levels.map((l) => (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{l.order}</td>

                    <td>
                      <button
                        className="btn-action edit"
                        onClick={() => handleEdit(l)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn-action danger"
                        onClick={() => handleDelete(l.id)}
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
          <h2>{editingId ? "Edit Level" : "Add Level"}</h2>

          <form onSubmit={handleSubmit} className="form-column">
            <input
              type="text"
              placeholder="Level Name (Beginner, Intermediate...)"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Order (1, 2, 3...)"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: e.target.value })
              }
              required
            />

            <button type="submit" className="btn-add">
              {editingId ? "Update Level" : "Create Level"}
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
    </>
  );
};

export default ManageLevels;