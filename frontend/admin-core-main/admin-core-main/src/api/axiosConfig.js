import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // ✅ correct backend
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access"); // ✅ consistent key

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// optional but good
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config.url.includes("/users/login/");
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("access"); // ✅ same key
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;