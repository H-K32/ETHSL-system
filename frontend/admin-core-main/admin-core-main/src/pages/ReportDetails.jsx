import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axiosConfig";
import "../styles/table.css";

export default function ReportDetails() {
  const { userId }            = useParams();
  const navigate              = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    API.get(`/community/admin/reported-users/${userId}/`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message || "Failed to load report details."))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="table-loading">Loading...</div>;
  if (error)   return <div className="table-error">{error}</div>;
  if (!data)   return null;

  const { user, reports, total_reports } = data;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Report Details</h1>
          <p>Full report history for <strong>{user.username}</strong></p>
        </div>
        <button className="btn-back" onClick={() => navigate("/reported-users")}>
          ← Back to Reported Users
        </button>
      </div>

      {/* User info card */}
      <div className="detail-user-card">
        <div className="detail-user-avatar">
          {(user.username || "?")[0].toUpperCase()}
        </div>
        <div className="detail-user-info">
          <h2>{user.full_name || user.username}</h2>
          <span className={`status-badge ${user.is_active ? "active" : "inactive"}`}>
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="detail-user-meta">
          <div className="detail-meta-row"><span>Username</span><strong>{user.username}</strong></div>
          <div className="detail-meta-row"><span>Email</span><strong>{user.email}</strong></div>
          <div className="detail-meta-row"><span>Registered</span><strong>{user.date_joined}</strong></div>
          <div className="detail-meta-row"><span>Total Reports</span><strong className="report-count-badge">{total_reports}</strong></div>
        </div>
      </div>

      {/* Report history */}
      <div className="section-heading">Report History</div>

      {reports.length === 0 ? (
        <div className="table-empty"><p>No reports found.</p></div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Reported By</th>
                <th>Reporter Email</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r.id}>
                  <td className="report-id">#{r.id}</td>
                  <td><strong>{r.reported_by}</strong></td>
                  <td>{r.reporter_email}</td>
                  <td className="report-reason">{r.reason}</td>
                  <td>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
