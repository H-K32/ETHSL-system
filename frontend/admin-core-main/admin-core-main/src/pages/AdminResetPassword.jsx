import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import "../styles/adminresetpassword.css";

function AdminResetPassword() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/users/admin/password-reset-confirm/${uidb64}/${token}/`, { password });
      setMessage("Password changed.");
    } catch {
      setMessage("Invalid or expired link.");
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>New Password</h2>
        <form onSubmit={submit}>
          <input
            type="password"
            value={password}
            placeholder="New password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button>Update Password</button>
        </form>
        {message && <div className="message">{message}</div>}
        <button className="login-btn" onClick={() => navigate('/login')}>
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default AdminResetPassword;