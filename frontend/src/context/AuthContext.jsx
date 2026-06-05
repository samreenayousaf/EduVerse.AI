import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({ baseURL: BASE });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ev_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start — restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('ev_token');
    const saved = localStorage.getItem('ev_user');
    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
        // Verify token is still valid with backend
        API.get('/auth/me')
          .then(res => {
            setUser(res.data);
            localStorage.setItem('ev_user', JSON.stringify(res.data));
          })
          .catch(() => {
            localStorage.removeItem('ev_token');
            localStorage.removeItem('ev_user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Login — calls backend, stores JWT
  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('ev_token', res.data.token);
    localStorage.setItem('ev_user',  JSON.stringify(res.data.user));
    setUser(res.data.user);
    const roleEmoji = { student:'🎓', instructor:'👨‍🏫', admin:'🛡️' };
    toast.success(`Welcome back, ${res.data.user.name}! ${roleEmoji[res.data.user.role] || ''}`, {
      position: 'top-right',
      autoClose: 3000,
    });
    return res.data.user;
  };

  // Register — calls backend
  const register = async (form) => {
    const res = await API.post('/auth/register', form);
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('ev_token');
    localStorage.removeItem('ev_user');
    setUser(null);
  };

  // Update local user state
  const updateUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('ev_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
