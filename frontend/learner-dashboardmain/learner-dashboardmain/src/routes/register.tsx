import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Hand } from "lucide-react";
import {
  api,
  setToken,
  setRefreshToken,
  setStoredUser,
} from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = async (e: any) => {
  e.preventDefault();
  setError("");

  if (password !== confirm) {
    setError("Passwords do not match");
    return;
  }

  setLoading(true);

  try {
    const res = await api.post("/users/register/", {
      username,
      full_name: fullName,
      email,
      password,
      gender,
    });

    setToken(res.data.token);

    if (res.data.refresh) {
      setRefreshToken(res.data.refresh);
    }

    setStoredUser(res.data.user);

    navigate({ to: "/complete-profile" });

  } catch (err: any) {
    console.log(err.response?.data);
    setError(JSON.stringify(err.response?.data || err.message));
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="w-full max-w-md">

        <div className="text-center mb-6">
          <div className="h-14 w-14 mx-auto rounded-2xl flex items-center justify-center text-white bg-gradient-to-r from-purple-500 to-blue-500 mb-3">
            <Hand className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold">
            Create Account
          </h1>

          <p className="text-gray-500 text-sm">
            Start learning Ethiopian Sign Language
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow space-y-4"
        >
          <input
            className="w-full p-2 border rounded"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="w-full p-2 border rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full p-2 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="w-full p-2 border rounded"
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

      <select
        className="w-full p-2 border rounded"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      >
        <option value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
         
      </select>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;