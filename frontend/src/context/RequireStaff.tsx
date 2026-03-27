import type { JSX } from "react";
import { useAuth } from "./useAuth";
import { Navigate } from "react-router-dom";

export function RequireStaff({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  const isStaff =
    user?.role === "ADMIN" || user?.role === "AUDITOR" || user?.role === "DM";

  return isStaff ? children : <Navigate to="/" replace />;
}
