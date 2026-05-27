import { useState } from "react";
import API from "../api/axiosConfig";
import "../styles/adminforgotpassword.css";

function AdminForgotPassword() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await API.post(
        "/users/admin/password-reset/",
        { email }
        );

      setMessage(
        "If account exists, email sent."
      );

    } catch {

      setMessage(
        "Something went wrong."
      );

    }

  };

  return (
  <div className="forgot-password-container">
  <div className="forgot-password-card">
    <h2>Admin Password Reset</h2>

    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Admin email"
        value={email}
        onChange={(e)=>
          setEmail(e.target.value)
        }
      />

      <button>
        Send Reset Link
      </button>
    </form>

    {message && <div className="forgot-message">{message}</div>}
  </div>
</div>);

}

export default AdminForgotPassword;