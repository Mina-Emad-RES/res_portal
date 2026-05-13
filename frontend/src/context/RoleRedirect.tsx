import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or spinner

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "CLIENT") {
    return <Navigate to="/reports" replace state={location.state} />;
  }

  return <Navigate to="/dashboard" replace />;
};
