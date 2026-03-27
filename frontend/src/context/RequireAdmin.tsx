import type { JSX } from "react";
import { useAuth } from "./useAuth";
import { Navigate } from "react-router-dom";

export function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user?.role === "ADMIN" ? children : <Navigate to="/" replace />;
}
