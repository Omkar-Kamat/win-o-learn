import { useSelector } from "react-redux";

export default function useAuth() {
  const auth = useSelector((state) => state.auth);

  return {
    user: auth.user,
    loading: auth.loading,
    initialized: auth.initialized,
    isAuthenticated: !!auth.user,
  };
}