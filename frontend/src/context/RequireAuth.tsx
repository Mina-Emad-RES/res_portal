import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { JSX } from "react";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();

  if (loading) return null; // or spinner

  return token ? children : <Navigate to="/login" replace />;
}
