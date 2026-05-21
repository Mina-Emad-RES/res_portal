import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import type { ReactNode } from "react";
import type { User } from "../types/auth";
import { AUTH_LOGOUT_EVENT } from "../api/authEvents";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // Read localStorage once, on mount — not on every render.
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState<boolean>(
    () => !!localStorage.getItem("token"),
  );

  const login = useCallback((user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Wipe all cached query data so the next user doesn't briefly see the
    // previous user's data on screen.
    queryClient.clear();
  }, [queryClient]);

  // Cross-tab / interceptor-driven logout.
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener(AUTH_LOGOUT_EVENT, handler);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handler);
  }, [logout]);

  // If we have a token on boot, verify it and refresh the user record.
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    api
      .get("/auth/me")
      .then((res) => {
        if (cancelled) return;
        setUser(res.data);
        // Keep localStorage in sync with the freshly-fetched user.
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch(() => {
        if (cancelled) return;
        logout();
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // We only want to run this when the token changes (login/logout/boot),
    // not whenever `logout` happens to get a new identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // The crucial change: memoize the context value so consumers don't
  // re-render every time AuthProvider re-renders.
  const value = useMemo(
    () => ({ user, token, login, logout, loading }),
    [user, token, login, logout, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
