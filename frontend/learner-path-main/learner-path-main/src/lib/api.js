import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const TOKEN_KEY = "ethsl_access_token";
export const REFRESH_KEY = "ethsl_refresh_token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (err) => {
  const data = err?.response?.data;
  if (!data) return err?.message || "Network error";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  try {
    const firstKey = Object.keys(data)[0];
    const v = data[firstKey];
    return Array.isArray(v) ? `${firstKey}: ${v[0]}` : `${firstKey}: ${v}`;
  } catch {
    return "Something went wrong";
  }
};
