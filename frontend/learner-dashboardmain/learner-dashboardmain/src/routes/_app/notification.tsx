import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Bell, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_app/notification")({
  component: NotificationPage,
});

function NotificationPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/profile/")
      .then((res) => setUser(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <h1 className="text-2xl font-bold">
          Notifications
        </h1>
      </div>

      {!user?.warning_message ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-muted-foreground">
          No notifications
        </div>
      ) : (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-700" />

            <h2 className="font-bold text-yellow-700">
              Warning from Admin
            </h2>
          </div>

          <p className="text-sm text-yellow-800">
            {user.warning_message}
          </p>
        </div>
      )}
    </div>
  );
}

export default NotificationPage;