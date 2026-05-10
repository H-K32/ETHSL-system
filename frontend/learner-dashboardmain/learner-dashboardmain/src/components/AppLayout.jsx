import { Link, useRouterState, useNavigate, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, User, Users, LogOut, GraduationCap, Bell } from "lucide-react";
import { clearAuth, isAuthenticated, api } from "@/lib/api";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/community", label: "Community", icon: Users },
  { to: "/notification", label: "Notification", icon: Bell },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
    } else {
      setReady(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate({ to: "/login" });
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card sticky top-0 h-screen">
        <div className="px-6 py-6 flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">LearnHub</div>
            <div className="text-xs text-muted-foreground">Keep learning ✨</div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "text-foreground hover:bg-muted"
                }`}
                style={active ? { background: "var(--gradient-primary)" } : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold">LearnHub</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 gap-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 pt-28 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
