import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Camera, BookOpen, CheckCircle2, Save, KeyRound } from "lucide-react";
import { api, getStoredUser, setStoredUser } from "@/lib/api";
import ProfileCard from "@/components/ProfileCard";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [user, setUser] = useState<any>(getStoredUser() || null);
  const [loading, setLoading] = useState(true);

  const [coursesCount, setCoursesCount] = useState(0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [preview, setPreview] = useState("");

  const [pwd, setPwd] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [msg, setMsg] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  // ---------------- LOAD PROFILE ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/users/profile/");
        const u = res.data;

        setUser(u);
        setFullName(u.full_name || "");
        setEmail(u.email || "");
        setPreview(
        u.avatar
          ? `http://127.0.0.1:8000${u.avatar}`
          : "https://via.placeholder.com/150"
      );

        // NOTE: backend doesn't reliably expose courses endpoint yet
        // so we fallback safely
        setCoursesCount(u.enrolled_courses || 0);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------------- IMAGE UPLOAD (LOCAL PREVIEW ONLY) ----------------
  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ---------------- SAVE PROFILE ----------------
  const handleSave = async (e: any) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("full_name", fullName);
  formData.append("email", email);

  if (fileRef.current?.files?.[0]) {
    formData.append("avatar", fileRef.current.files[0]); // 👈 REAL FILE
  }

  const res = await api.patch("/users/profile/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  setUser(res.data);
  setStoredUser(res.data);

  setMsg("Profile updated ✓");
  setTimeout(() => setMsg(""), 2500);
};

  // ---------------- CHANGE PASSWORD ----------------
  const handlePwd = async (e: any) => {
    e.preventDefault();

    if (pwd.next !== pwd.confirm) {
      setMsg("Passwords don't match");
      return;
    }

    try {
      await api.post("/users/profile/change-password/", {
        current_password: pwd.current,
        new_password: pwd.next,
      });

      setPwd({ current: "", next: "", confirm: "" });

      setMsg("Password changed ✓");
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setMsg("Password change failed");
    }
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (!user) {
    return <div className="p-6">Failed to load profile</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-4">
          <ProfileCard user={{ ...user, avatar: preview }} />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-card border p-4">
              <CheckCircle2 className="h-5 w-5 text-green-500 mb-1.5" />
              <div className="text-2xl font-bold">
                {user.completed_lessons ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Lessons done
              </div>
            </div>

            <div className="rounded-xl bg-card border p-4">
              <BookOpen className="h-5 w-5 text-blue-500 mb-1.5" />
              <div className="text-2xl font-bold">{coursesCount}</div>
              <div className="text-xs text-muted-foreground">
                Enrolled
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* PROFILE FORM */}
          <form
            onSubmit={handleSave}
            className="rounded-2xl bg-card border p-6 space-y-4"
          >
            <h2 className="font-bold text-lg">Personal Information</h2>

            {/* AVATAR */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={preview}
                  className="h-20 w-20 rounded-full object-cover border"
                />

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center"
                >
                  <Camera className="h-4 w-4" />
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFile}
                />
              </div>

              <div>
                <div className="font-medium">Profile picture</div>
                <p className="text-xs text-muted-foreground">
                  Click camera to upload (local preview only)
                </p>
              </div>
            </div>

            {/* NAME */}
            <div>
              <label className="text-sm">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* USERNAME */}
            <div>
              <label className="text-sm">Username</label>
              <input
                value={user.username}
                disabled
                className="w-full border p-2 rounded bg-gray-100"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded"
            >
              <Save className="inline h-4 w-4 mr-2" />
              Save Changes
            </button>
          </form>

          {/* PASSWORD */}
          <form
            onSubmit={handlePwd}
            className="rounded-2xl bg-card border p-6 space-y-4"
          >
            <h2 className="font-bold text-lg flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Change Password
            </h2>

            <input
              type="password"
              placeholder="Current password"
              value={pwd.current}
              onChange={(e) =>
                setPwd({ ...pwd, current: e.target.value })
              }
              className="w-full border p-2 rounded"
            />

            <input
              type="password"
              placeholder="New password"
              value={pwd.next}
              onChange={(e) =>
                setPwd({ ...pwd, next: e.target.value })
              }
              className="w-full border p-2 rounded"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={pwd.confirm}
              onChange={(e) =>
                setPwd({ ...pwd, confirm: e.target.value })
              }
              className="w-full border p-2 rounded"
            />

            <button
              type="submit"
              className="px-4 py-2 border rounded"
            >
              Update Password
            </button>
          </form>

          {msg && (
            <div className="text-green-600 font-medium">{msg}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;