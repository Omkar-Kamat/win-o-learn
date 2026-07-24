import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function RoleRoute({
  allow,
  children,
}) {
  const { user } = useAuth();

  if (!allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}