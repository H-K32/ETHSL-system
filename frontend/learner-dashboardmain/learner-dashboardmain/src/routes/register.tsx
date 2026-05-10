import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Hand } from "lucide-react";
import { api, setToken, setStoredUser } from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const [levels, setLevels] = useState<any[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // stores backend value ONLY
  const [level, setLevel] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOAD LEVELS
  // =========================
  useEffect(() => {
    async function fetchLevels() {
      try {
        const res = await api.get("courses/public/levels/");
        const data = res.data;

        setLevels(data);

        // default selection (backend value)
        if (data.length > 0) {
          setLevel(data[0].name); // e.g. "beginner"
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load levels");
      } finally {
        setLoadingLevels(false);
      }
    }

    fetchLevels();
  }, []);

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!level) {
      setError("Please select a level");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/users/register/", {
        full_name: fullName,
        email,
        password,
        level, // backend value
      });

      setToken(res.data.token);
      setStoredUser(res.data.user);

      if (res.data.user.placement_required) {
        navigate({ to: "/placement-test" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      console.log(err.response?.data);
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="h-14 w-14 mx-auto rounded-2xl flex items-center justify-center text-white bg-gradient-to-r from-purple-500 to-blue-500 mb-3">
            <Hand className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-gray-500 text-sm">
            Start learning Ethiopian Sign Language
          </p>
        </div>

        {/* FORM */}
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

          {/* LEVELS */}
          <div className="grid grid-cols-3 gap-2">
            {loadingLevels ? (
              <p className="text-sm text-gray-500">Loading levels...</p>
            ) : (
              levels.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(l.name)}   // backend value
                  className={`p-2 rounded border text-sm transition ${
                    level === l.name
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {l.name} {/* shows Amharic from DB */}
                </button>
              ))
            )}
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* SUBMIT */}
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