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
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        // Optimistic Login: Langsung set user agar UI tidak flicker
        setUser(JSON.parse(storedUser));
        try {
          // Coba dapatkan access token baru secara diam-diam
          const response = await apiClient.post('/auth/token/refresh/');
          setAuthToken(response.data.access);
        } catch (error) {
          // Jika refresh token gagal, berarti sesi benar-benar tidak valid. Logout paksa.
          console.error("Refresh token gagal, sesi tidak valid.", error);
          setUser(null);
          localStorage.removeItem('user');
          setAuthToken(null);
        }
      }
      
      // Selesai loading, baik ada user atau tidak
      setLoading(false);
    };

    checkAuthStatus();
  }, []); // Hanya berjalan sekali saat aplikasi dimuat

  const login = async (username, password) => {
    try {
      await apiClient.get('/users/csrf-cookie/');
      const response = await apiClient.post('/auth/login/', { username, password });
      
      const { access, user: userData } = response.data;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setAuthToken(access);
      
      navigate('/');
    } catch (error) {
      // Alih-alih menampilkan toast di sini, kita lempar error-nya
      // agar bisa ditangkap oleh komponen Login
      if (error.response && error.response.data) {
          // Ambil pesan error spesifik dari backend
          const errorMessages = Object.values(error.response.data).flat();
          throw new Error(errorMessages[0] || 'Login gagal.');
      }
      throw new Error('Terjadi kesalahan. Periksa koneksi Anda.');
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