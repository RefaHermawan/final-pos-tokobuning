// src/App.jsx

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext.jsx'; // Import AuthProvider
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext.jsx'; // Import ThemeProvider
import ToastProvider from './contexts/ToastProvider';
// Import semua halaman
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kasir from './pages/Kasir';
import Produk from './pages/Produk';
import Stok from './pages/Stok';
import Supplier from './pages/Supplier';
import LaporanTransaksi from './pages/LaporanTransaksi';
import LaporanKeuangan from './pages/LaporanKeuangan';
import Kasbon from './pages/Kasbon';
import Pengaturan from './pages/Pengaturan';
import ProfilePage from './pages/ProfilePage'; // Import halaman baru

const RootLayout = () => {
  return (
    <AuthProvider>
      <ToastProvider>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

// Konfigurasi router dengan struktur yang benar
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/',
        element: <ProtectedRoute><MainLayout /></ProtectedRoute>, // Semua yang login bisa lihat layout
        children: [
          // Halaman yang bisa diakses SEMUA peran
          { 
            index: true, 
            element: <ProtectedRoute allowedRoles={['admin', 'kasir', 'guest']}><Dashboard /></ProtectedRoute> 
          },
          { 
            path: 'kasir', 
            element: <ProtectedRoute allowedRoles={['admin', 'kasir', 'guest']}><Kasir /></ProtectedRoute> 
          },
          { 
            path: 'profil', 
            element: <ProtectedRoute allowedRoles={['admin', 'kasir', 'guest']}><ProfilePage /></ProtectedRoute> 
          },
          
          // Halaman KHUSUS ADMIN
          { 
            path: 'produk', 
            element: <ProtectedRoute allowedRoles={['admin', 'guest']}><Produk /></ProtectedRoute> 
          },
          { 
            path: 'stok', 
            element: <ProtectedRoute allowedRoles={['admin', 'guest']}><Stok /></ProtectedRoute> 
          },
          { 
            path: 'supplier', 
            element: <ProtectedRoute allowedRoles={['admin', 'guest']}><Supplier /></ProtectedRoute> 
          },
          { 
            path: 'laporan/transaksi', 
            element: <ProtectedRoute allowedRoles={['admin', 'guest']}><LaporanTransaksi /></ProtectedRoute> 
          },
          { 
            path: 'kasbon', 
            element: <ProtectedRoute allowedRoles={['admin', 'guest']}><Kasbon /></ProtectedRoute> 
          },
          { 
            path: 'pengaturan', 
            element: <ProtectedRoute allowedRoles={['admin']}><Pengaturan /></ProtectedRoute> 
          },
        ],
      },
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;