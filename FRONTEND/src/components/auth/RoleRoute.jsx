import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleRoute({ allow }) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!role || !allow.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
