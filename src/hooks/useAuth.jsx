import { useState, useEffect, createContext, useContext, useCallback } from "react";

const API_BASE = "/api";

const AuthContext = createContext(null);

function getStoredAuth() {
  try {
    const raw = localStorage.getItem("geeks_admin");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(getStoredAuth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token is still valid
    const stored = getStoredAuth();
    if (stored?.token) {
      try {
        const payload = JSON.parse(atob(stored.token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("geeks_admin");
          setAdmin(null);
        }
      } catch {
        localStorage.removeItem("geeks_admin");
        setAdmin(null);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }

    const data = await res.json();
    const authData = { token: data.token, ...data.admin };
    localStorage.setItem("geeks_admin", JSON.stringify(authData));
    setAdmin(authData);
    return authData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("geeks_admin");
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useApi() {
  const { admin } = useAuth();

  const authedFetch = useCallback(async (url, options = {}) => {
    const headers = { ...options.headers };
    if (admin?.token) {
      headers["Authorization"] = `Bearer ${admin.token}`;
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("geeks_admin");
      window.location.href = "/admin/login";
    }
    return res;
  }, [admin]);

  return { fetch: authedFetch };
}
