import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const stored = authService.getStoredUser();
      const token = authService.getToken();
      if (stored && token) {
        try {
          const freshUser = await authService.getCurrentUser();
          setUser({ ...stored, ...freshUser });
        } catch {
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setUser(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const role = user?.role || '';
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
  const isTeacher = role === 'ROLE_TEACHER' || role === 'TEACHER';
  const isStudent = role === 'ROLE_STUDENT' || role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        isTeacher,
        isStudent,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
