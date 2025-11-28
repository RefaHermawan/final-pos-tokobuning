// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient, { setAuthToken } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Mulai dengan status loading
  const navigate = useNavigate();

useEffect(() => {
    const checkAuthStatus = async () => {
      // 1. Ambil CSRF Token dulu dari JSON body
      try {
        const csrfRes = await apiClient.get('/users/csrf-cookie/');
        const csrfToken = csrfRes.data.csrfToken;
        
        // 2. Pasang ke Header Global Axios
        if (csrfToken) {
            apiClient.defaults.headers.common['X-CSRFToken'] = csrfToken;
        }
      } catch (e) {
        console.error("Gagal ambil CSRF", e);
      }

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
          // ... logika cek user lama
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

const login = async (username, password) => {
    try {
      // Panggil lagi untuk memastikan token terbaru sebelum POST login
      const csrfRes = await apiClient.get('/users/csrf-cookie/');
      const csrfToken = csrfRes.data.csrfToken;
      apiClient.defaults.headers.common['X-CSRFToken'] = csrfToken;

      const response = await apiClient.post('/auth/login/', { username, password });
      
      const { access, user: userData } = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setAuthToken(access);
      
      navigate('/');
    } catch (error) {
      toast.error('Login gagal! Periksa kembali username dan password.');
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout/');
    } catch (error) {
      console.error("Logout di server gagal, tetap logout di client.", error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      setAuthToken(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);