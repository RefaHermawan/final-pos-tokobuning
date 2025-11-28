// src/layouts/MainLayout.jsx
import React, { useState, useEffect, useRef } from 'react'; // Tambahkan useEffect dan useRef
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = () => {
  // State untuk mengontrol kondisi sidebar
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const inactivityTimer = useRef(null);

  useEffect(() => {
    // Fungsi untuk melipat sidebar
    const collapseSidebar = () => {
      setSidebarCollapsed(true);
    };

    // Fungsi untuk me-reset timer
    const resetTimer = () => {
      // Hapus timer yang ada
      clearTimeout(inactivityTimer.current);
      // Atur timer baru untuk 15 detik
      inactivityTimer.current = setTimeout(collapseSidebar, 15000);
    };

    // Daftar aktivitas pengguna yang akan me-reset timer
    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    // Pasang event listener
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    // Mulai timer saat komponen dimuat
    resetTimer();

    // Cleanup: Hapus event listener saat komponen di-unmount
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(inactivityTimer.current);
    };
  }, []);
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Kirim state dan fungsi untuk mengubahnya sebagai props */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;