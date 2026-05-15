import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, TOKEN_KEY, REFRESH_KEY } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/profile/");
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProfile().finally(() => setLoading(false));
  }, [fetchProfile]);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login/", { username, password });
    const access = data.access || data.token || data.access_token;
    const refresh = data.refresh || data.refresh_token;
    if (access) localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    const profile = await fetchProfile();
    return profile;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register/", payload);
    const access = data.access || data.token || data.access_token;
    const refresh = data.refresh || data.refresh_token;
    if (access) localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    const profile = await fetchProfile();
    return profile;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refresh: fetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
