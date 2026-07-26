import { createContext, useContext, useEffect, useState } from 'react';
import { axiosClient } from '../api/axiosClient';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await axiosClient.get('/auth/me');
      if (response.data.data.isBlocked) {
        await logout();
        return;
      }
      setUser(response.data.data);
      setRole(response.data.data.role);
    } catch (error) {
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleRefreshFailed = () => {
      setUser(null);
      setRole(null);
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
      }
    };

    window.addEventListener('auth:refresh-failed', handleRefreshFailed);
    return () => window.removeEventListener('auth:refresh-failed', handleRefreshFailed);
  }, []);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    if (res.data.data.user.isBlocked) {
      throw new Error('Account is blocked');
    }
    setUser(res.data.data.user);
    setRole(res.data.data.user.role);
    return res.data;
  };

  const signup = async (userData) => {
    const res = await axiosClient.post('/auth/signup', userData);
    setUser(res.data.data.user);
    setRole(res.data.data.user.role);
    return res.data;
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    return axiosClient.put('/auth/change-password', { oldPassword, newPassword });
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, signup, logout, changePassword, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
