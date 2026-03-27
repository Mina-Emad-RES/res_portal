import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import type { ReactNode } from "react";
import type { User } from "../types/auth";
import { AUTH_LOGOUT_EVENT } from "../api/authEvents";
import api from "../api/axios";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );
  const [token, setToken] = useState<string | null>(storedToken);

  const [loading, setLoading] = useState(!!storedToken);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener(AUTH_LOGOUT_EVENT, handler);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!storedToken) return;

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [storedToken]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
