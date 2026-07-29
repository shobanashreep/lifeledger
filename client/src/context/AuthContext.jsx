import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lifeledger_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('lifeledger_token');
        localStorage.removeItem('lifeledger_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    localStorage.setItem('lifeledger_token', res.data.token);
    localStorage.setItem('lifeledger_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const res = await authService.register({ fullName, email, password });
    localStorage.setItem('lifeledger_token', res.data.token);
    localStorage.setItem('lifeledger_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout — clear local state regardless
    }
    localStorage.removeItem('lifeledger_token');
    localStorage.removeItem('lifeledger_user');
    setUser(null);
  }, []);

  const updateUserLocal = useCallback((partialUser) => {
    setUser((prev) => ({ ...prev, ...partialUser }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, register, logout, updateUserLocal }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
