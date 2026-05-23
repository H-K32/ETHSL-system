import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");  

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// optional but good
API.interceptors.response.use(
  (response) => response,
  (error) => {

    const url = error.config?.url || "";

    const excluded =
      url.includes("/users/login/") ||
      url.includes("/users/admin/password-reset/") ||
      url.includes("/users/admin/password-reset-confirm/");

    if (
      error.response?.status === 401 &&
      !excluded
    ) {
      localStorage.removeItem("access");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;