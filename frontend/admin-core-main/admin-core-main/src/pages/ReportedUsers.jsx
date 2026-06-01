import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import "../styles/table.css";

export default function ReportedUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const navigate              = useNavigate();

  useEffect(() => {
    API.get("/community/admin/reported-users/")
      .then((r) => setUsers(r.data))
      .catch((e) => setError(e.message || "Failed to load reported users."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Reported Users</h1>
          <p>Users who have received at least one report</p>
        </div>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {loading && <div className="table-loading">Loading...</div>}

      {error && <div className="table-error">{error}</div>}

      {!loading && !error && users.length === 0 && (
        <div className="table-empty">
          <div className="table-empty-icon">🎉</div>
          <p>No reported users found.</p>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Reports</th>
                <th>Last Report</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.full_name || "—"}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="report-count-badge">{u.report_count}</span>
                  </td>
                  <td>{u.last_report || "—"}</td>
                  <td>
                    <span className={`status-badge ${u.is_active ? "active" : "inactive"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/reported-users/${u.id}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
