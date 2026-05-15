import axios from "axios";

const TOKEN_KEY = "elearn_token";
const REFRESH_KEY = "elearn_refresh";
const USER_KEY = "elearn_user";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/* =========================
   AUTH INTERCEPTOR (JWT FIX)
   ========================= */
api.interceptors.request.use((config) => {

  // ✅ PUBLIC ROUTES (NO TOKEN)
  const publicRoutes = [
    "/users/register/",
    "/users/login/",
    "/users/refresh/",
    "/courses/public/levels/",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    config.url?.includes(route)
  );

  // ✅ ONLY attach token for protected routes
  if (!isPublicRoute) {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

/* =========================
   TOKEN HANDLING
   ========================= */

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_KEY, token);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

/* =========================
   USER STORAGE
   ========================= */

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated() {
  return !!getToken();
}

/* =========================
   OPTIONAL: REFRESH TOKEN
   ========================= */

export async function refreshAccessToken() {
  const refresh = getRefreshToken();

  if (!refresh) return null;

  try {
    const res = await axios.post("/users/refresh/", {
      refresh,
    });

    const newAccess = res.data.access;

    setToken(newAccess);

    return newAccess;
  } catch (err) {
    clearAuth();
    return null;
  }
}

/* =========================
   MOCK DATA (UNCHANGED)
   ========================= */

export const mockData = {
  user: {
    id: 1,
    username: "alex_learner",
    email: "alex@example.com",
    full_name: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    completed_lessons: 24,
    quizzes_passed: 8,
  },
  courses: [
    {
      id: 1,
      title: "React Fundamentals",
      description: "Master the basics of React, components, and hooks.",
      progress: 75,
      thumbnail: "🚀",
      color: "var(--gradient-primary)",
    },
    {
      id: 2,
      title: "UI/UX Design Principles",
      description: "Learn design thinking and create delightful interfaces.",
      progress: 40,
      thumbnail: "🎨",
      color: "var(--gradient-warm)",
    },
    {
      id: 3,
      title: "Python for Data Science",
      description: "Analyze data and build models with Python.",
      progress: 90,
      thumbnail: "🐍",
      color: "var(--gradient-cool)",
    },
    {
      id: 4,
      title: "Public Speaking",
      description: "Build confidence and deliver memorable talks.",
      progress: 20,
      thumbnail: "🎤",
      color: "var(--gradient-warm)",
    },
  ],
  lessons: {
    1: [
      { id: 11, title: "Introduction to React", content: "React is a library for building UIs...", completed: true, has_quiz: false },
      { id: 12, title: "Components & Props", content: "Components let you split the UI into independent pieces...", completed: true, has_quiz: false },
      { id: 13, title: "State and Hooks", content: "useState lets you add state to function components...", completed: false, has_quiz: true, quiz_id: 101 },
      { id: 14, title: "Effects & Lifecycle", content: "useEffect runs side effects after render...", completed: false, has_quiz: true, quiz_id: 102 },
    ],
  },
};