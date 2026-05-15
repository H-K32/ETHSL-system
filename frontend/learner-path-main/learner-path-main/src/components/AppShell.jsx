import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { GraduationCap, LogOut, User as UserIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/levels" className="flex items-center gap-2 font-bold text-foreground">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>ETHSL</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link to="/levels" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Learn
            </Link>
            <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.username || "Profile"}</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">Logout</span>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
