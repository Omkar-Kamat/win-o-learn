import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import FullScreenLoader from "./FullScreenLoader";

export default function ProtectedRoute({ children }) {
  const {
    initialized,
    isAuthenticated,
  } = useAuth();

  if (!initialized) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}