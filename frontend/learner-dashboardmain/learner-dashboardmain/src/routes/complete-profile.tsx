import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, setStoredUser } from "@/lib/api";

export const Route = createFileRoute("/complete-profile")({
  component: CompleteProfile,
});

type Level = {
  id: number;
  code: "beginner" | "intermediate" | "advanced";
  order: number;
  display_name: string;
};

function CompleteProfile() {
  const navigate = useNavigate();

  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(true);

  const [form, setForm] = useState({
    avatar: null as File | null,
    country: "",
    motivation: "",
    bio: "",
    age: "",
    level: "",
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ======================
  // FETCH LEVELS
  // ======================
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setLoadingLevels(true);
        const res = await api.get("/courses/public/levels/");
        setLevels(res.data);
      } catch (err) {
        console.error("Failed to load levels", err);
      } finally {
        setLoadingLevels(false);
      }
    };

    fetchLevels();
  }, []);

  // ======================
  // SUBMIT PROFILE
  // ======================
  const submit = async () => {
    setLoading(true);

    try {
      const data = new FormData();

      data.append("country", form.country);
      data.append("motivation", form.motivation);
      data.append("bio", form.bio);

      if (form.age) {
        data.append("age", String(Number(form.age)));
      }

      if (form.level) {
        data.append("level", String(Number(form.level)));
      }

      if (form.avatar) {
        data.append("avatar", form.avatar);
      }

      const res = await api.put("/users/profile/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStoredUser(res.data);

      // ======================
      // ROUTING LOGIC
      // ======================
      const selectedLevel = levels.find(
        (l) => l.id === Number(form.level)
      );

      const code = selectedLevel?.code;

      if (code === "beginner") {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/placement-test" });
      }
    } catch (err: any) {
      console.error(err);
      alert(JSON.stringify(err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 p-4">

      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-6 space-y-4">

        <h1 className="text-2xl font-bold text-center">
          መገለጫዎን ይሙሉ
        </h1>

        {/* COUNTRY */}
        <input
          className="w-full border p-2 rounded"
          placeholder="አገር"
          onChange={(e) => handleChange("country", e.target.value)}
        />

        {/* MOTIVATION */}
        <textarea
          className="w-full border p-2 rounded"
          placeholder="ምን አነሳሳዎ?"
          onChange={(e) => handleChange("motivation", e.target.value)}
        />

        {/* BIO */}
        <textarea
          className="w-full border p-2 rounded"
          placeholder="ባዮ"
          onChange={(e) => handleChange("bio", e.target.value)}
        />

        {/* AGE */}
        <input
          type="number"
          className="w-full border p-2 rounded"
          placeholder="ዕድሜ"
          onChange={(e) => handleChange("age", e.target.value)}
        />

        {/* LEVEL SELECT */}
        <select
          className="w-full border p-2 rounded"
          value={form.level}
          onChange={(e) => handleChange("level", e.target.value)}
          disabled={loadingLevels}
        >
          <option value="">
            {loadingLevels ? "በመጫን ላይ..." : "ደረጃ ይምረጡ"}
          </option>

          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.display_name}
            </option>
          ))}
        </select>

        {/* AVATAR */}
        <input
          type="file"
          className="w-full"
          onChange={(e) =>
            handleChange("avatar", e.target.files?.[0] || null)
          }
        />

        {/* SUBMIT */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "በመቆጠር..." : "ቀጥል"}
        </button>

      </div>
    </div>
  );
}

export default CompleteProfile;