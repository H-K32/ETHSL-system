import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";

export default function AdminVerifyEmailChange() {
  const { uidb64, token } = useParams();
  const nav = useNavigate();
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    API.get(`/users/email-change-confirm/${uidb64}/${token}/`)
      .then(() => {
        setStatus("success");
        setTimeout(() => {
          localStorage.removeItem("access");
          window.location.href = "/login";
        }, 2500);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.error || "The link is invalid or has expired.");
        setStatus("error");
      });
  }, [uidb64, token]);

  const containerStyle = {
    maxWidth: 480,
    margin: "80px auto",
    textAlign: "center",
    padding: "0 1rem",
    fontFamily: "Inter, sans-serif",
  };

  if (status === "loading") return (
    <div style={containerStyle}>
      <p style={{ color: "#555" }}>Verifying your new email…</p>
    </div>
  );

  if (status === "success") return (
    <div style={containerStyle}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
      <h2 style={{ color: "#16a34a" }}>Email Updated Successfully!</h2>
      <p style={{ color: "#555", marginTop: "0.5rem" }}>
        Your email address has been updated. You have been signed out from all
        devices. Redirecting to login…
      </p>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
      <h2 style={{ color: "#dc2626" }}>Verification Failed</h2>
      <p style={{ color: "#555", marginTop: "0.5rem" }}>{errorMsg}</p>
      <button
        onClick={() => nav("/login")}
        style={{
          marginTop: "1.5rem",
          padding: "0.6rem 1.4rem",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: "0.9rem",
        }}
      >
        Back to Login
      </button>
    </div>
  );
}
