import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Hand, Mail, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/forgot-password/", { email });
    } catch {
      // Demo fallback — pretend success
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, oklch(0.95 0.05 280), oklch(0.92 0.08 195))" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex h-14 w-14 rounded-2xl items-center justify-center text-primary-foreground mb-3 shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-primary)" }}>
            <Hand className="h-7 w-7" />
          </Link>
          <h1 className="text-3xl font-bold">Forgot password?</h1>
          <p className="text-muted-foreground mt-1">We'll send you a reset link</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-[var(--shadow-soft)]">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="text-5xl">📧</div>
              <h2 className="font-bold text-lg">Check your email</h2>
              <p className="text-sm text-muted-foreground">If an account exists for <strong>{email}</strong>, we just sent a reset link.</p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-input/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
              <p className="text-sm text-center text-muted-foreground">
                <Link to="/login" className="text-primary font-medium hover:underline">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
