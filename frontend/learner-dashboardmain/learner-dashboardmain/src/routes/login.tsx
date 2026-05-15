import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Mail, Lock } from "lucide-react";
import { api, setToken, setRefreshToken, setStoredUser } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  // backend expects username (NOT email)
  const [username, setUsername] = useState("lud");
  const [password, setPassword] = useState("12345678");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/users/login/", {
        username,
        password,
      });

      // SimpleJWT response
      setToken(res.data.access);
      if (res.data.refresh) {
        setRefreshToken(res.data.refresh);
      }

      // store minimal user info
      setStoredUser({ username });

      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.95 0.05 280), oklch(0.92 0.08 195))",
      }}
    >
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-6">
          <div
            className="inline-flex h-14 w-14 rounded-2xl items-center justify-center text-primary-foreground mb-3"
            style={{ background: "var(--gradient-primary)" }}
          >
            <GraduationCap className="h-7 w-7" />
          </div>

          <h1 className="text-3xl font-bold">Welcome back 👋</h1>
          <p className="text-muted-foreground mt-1">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-card border border-border p-6 md:p-8 space-y-4"
        >

          {/* USERNAME */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Username
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border"
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border"
                required
              />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-semibold"
            style={{ background: "var(--gradient-primary)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* REGISTER */}
          <p className="text-sm text-center text-muted-foreground pt-2">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium">
              Register
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}