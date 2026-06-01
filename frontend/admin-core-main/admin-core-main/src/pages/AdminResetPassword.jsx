import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import "../styles/adminresetpassword.css";

function validate(password) {
  return {
    minLength: password.length >= 8,
    hasUpper:  /[A-Z]/.test(password),
    hasLower:  /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

function AdminResetPassword() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = validate(password);
  const isPasswordValid = Object.values(checks).every(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!isPasswordValid) {
      setMsg("Password does not meet the requirements below.");
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await API.post(`/users/admin/password-reset-confirm/${uidb64}/${token}/`, { password });
      setSuccess(true);
      setMsg("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const data = err?.response?.data;
      const pwdError = data?.password;
      if (pwdError) {
        const errMsg = Array.isArray(pwdError) ? pwdError[0] : pwdError;
        if (errMsg.toLowerCase().includes("used before") || errMsg.toLowerCase().includes("previous")) {
          setMsg("Can't use a password you've used before. Please choose a new password.");
        } else {
          setMsg(errMsg);
        }
      } else {
        setMsg(data?.non_field_errors?.[0] || data?.detail || "Invalid or expired link.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        <p className="reset-subtitle">Enter your new password below</p>

        <form onSubmit={submit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setMsg(""); }}
            disabled={loading}
            required
          />

          {/* Live password requirements */}
          {password && (
            <ul className="reset-checks">
              <li className={checks.minLength ? "check-pass" : "check-fail"}>
                {checks.minLength ? "✔" : "✖"} At least 8 characters
              </li>
              <li className={checks.hasUpper ? "check-pass" : "check-fail"}>
                {checks.hasUpper ? "✔" : "✖"} At least 1 uppercase letter
              </li>
              <li className={checks.hasLower ? "check-pass" : "check-fail"}>
                {checks.hasLower ? "✔" : "✖"} At least 1 lowercase letter
              </li>
              <li className={checks.hasNumber ? "check-pass" : "check-fail"}>
                {checks.hasNumber ? "✔" : "✖"} At least 1 number
              </li>
              <li className={checks.hasSpecial ? "check-pass" : "check-fail"}>
                {checks.hasSpecial ? "✔" : "✖"} At least 1 special character
              </li>
            </ul>
          )}

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setMsg(""); }}
            disabled={loading}
            required
          />

          <button
            type="submit"
            disabled={loading || !isPasswordValid || !password || !confirmPassword}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {msg && (
          <div className={`message ${success ? "success" : "error"}`}>
            {msg}
          </div>
        )}

        <button className="login-btn" onClick={() => navigate("/login")}>
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default AdminResetPassword;
