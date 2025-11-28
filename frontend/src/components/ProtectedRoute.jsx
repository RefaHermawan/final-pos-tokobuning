// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { LoaderCircle } from 'lucide-react'; // Atau ikon loading Anda

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Jika sedang dalam proses verifikasi, tampilkan layar loading
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // Setelah verifikasi selesai, baru cek status login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Cek hak akses (role) jika diperlukan
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Arahkan ke dashboard jika tidak punya akses
  }

  return children;
};

export default ProtectedRoute;