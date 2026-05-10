import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig"; // ✅ use your axios instance
import "../styles/login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/users/login/", {
        username,
        password,
      });

      // ✅ store token
      localStorage.setItem("access", res.data.access);

      console.log("Login success:", res.data);

      // ✅ redirect
      navigate("/dashboard");

    } catch (err) {
      console.error("Login failed:", err);

      if (err.response) {
        // backend responded (like 401)
        if (err.response.status === 401) {
          setError("Invalid username or password");
        } else {
          setError("Something went wrong. Try again.");
        }
      } else {
        // network error
        setError("Server not reachable");
      }
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Welcome Back</h1>
        <p>Sign in to your admin account</p>

        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-login">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;