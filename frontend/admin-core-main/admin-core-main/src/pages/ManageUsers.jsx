import { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "../styles/table.css";

const ManageUsers = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  // ---------------- LOAD USERS ----------------
  const fetchUsers = async () => {
    try {
      const res = await API.get("/users/list/");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------------- WARN USER ----------------
  const warnUser = async (id) => {
    const reason = window.prompt("Enter the reason for warning this user:");
    if (!reason || !reason.trim()) return;
    try {
      await API.post(`/users/warn/${id}/`, { message: reason.trim() });
      alert("User warned successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to warn user");
    }
  };
//=============deactivateUser================
  const deactivateUser = async (id) => {
  try {
    await API.post(`/users/deactivate/${id}/`);

    fetchUsers();

    alert("User deactivated");

  } catch (err) {
    console.error(err);
  }
};

const activateUser = async (id) => {
  try {
    await API.post(`/users/activate/${id}/`);

    fetchUsers();

    alert("User activated");

  } catch (err) {
    console.error(err);
  }
};

  // ---------------- FILTER ----------------
  const filtered = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchRole =
      roleFilter === "All" || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  return (
    <>
      <div className="page-header">
        <h1>Manage Users</h1>
        <p>View and manage all platform users</p>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="table-toolbar">
        <div className="table-toolbar-left">

          <input
            className="search-input"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>All</option>
            <option>learner</option>
            <option>admin</option>
          </select>

        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">

          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Streak</th>
              <th>Reports</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.streak_count}</td>
                <td>{u.reports_count}</td>

<td style={{ display: "flex", gap: "8px" }}>

  {u.role !== "admin" && !u.is_superuser && (
    <>
      <button
        onClick={() => warnUser(u.id)}
        style={{
          background: "orange",
          color: "white",
          border: "none",
          padding: "6px 10px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Warn
      </button>

      {u.is_active ? (
        <button
          onClick={() => deactivateUser(u.id)}
          style={{
            background:"red",
            color:"white",
            border:"none",
            padding:"6px 10px",
            borderRadius:"6px",
            cursor:"pointer"
          }}
        >
          Deactivate
        </button>
      ) : (
        <button
          onClick={() => activateUser(u.id)}
          style={{
            background:"green",
            color:"white",
            border:"none",
            padding:"6px 10px",
            borderRadius:"6px",
            cursor:"pointer"
          }}
        >
          Activate
        </button>
      )}
    </>
  )}

</td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </>
  );
};

export default ManageUsers;