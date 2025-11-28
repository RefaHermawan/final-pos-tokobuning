// src/layouts/Header.jsx
import React, { Fragment } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';

// Komponen-komponen yang sudah ada
import Clock from '../components/header/Clock';
import ThemeToggle from '../components/header/ThemeToggle';
import NotificationBell from '../components/header/NotificationBell';
import UserProfileDropdown from '../components/header/UserProfileDropdown';

// Ikon-ikon yang akan kita gunakan
import { 
    LayoutDashboard, ShoppingCart, Package, Archive, Truck, BarChart3, 
    Landmark, BookUser, Settings, HelpCircle, PlusCircle
} from 'lucide-react';

// Fungsi untuk mendapatkan HANYA judul berdasarkan path URL
const getPageTitle = (path) => {
    if (path === '/') return 'Dashboard';
    const pathMap = {
        'kasir': 'Kasir',
        'produk': 'Produk',
        'stok': 'Stok',
        'supplier': 'Supplier',
        'transaksi': 'Laporan Transaksi',
        // 'keuangan': 'Laporan Keuangan',
        'kasbon': 'Kasbon',
        'pengaturan': 'Pengaturan',
    };
    const key = path.split('/').pop();
    return pathMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

// Komponen baru untuk me-render ikon secara dinamis
const PageIcon = ({ path }) => {
    const key = path === '/' ? '/' : path.split('/').pop();
    switch (key) {
        case '/': return <LayoutDashboard className="text-primary" size={24} />;
        case 'kasir': return <ShoppingCart className="text-primary" size={24} />;
        case 'produk': return <Package className="text-primary" size={24} />;
        case 'stok': return <Archive className="text-primary" size={24} />;
        case 'supplier': return <Truck className="text-primary" size={24} />;
        case 'transaksi': return <BarChart3 className="text-primary" size={24} />;
        // case 'keuangan': return <Landmark className="text-primary" size={24} />;
        case 'kasbon': return <BookUser className="text-primary" size={24} />;
        case 'pengaturan': return <Settings className="text-primary" size={24} />;
        default: return <HelpCircle className="text-primary" size={24} />;
    }
};

const Header = () => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
 
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="sticky top-0 z-30 bg-background backdrop-blur-xl h-20 px-6 flex justify-between items-center border-b border-light-gray/50 shadow-xs"
    >
      {/* Kiri: Judul Halaman Dinamis dengan Ikon */}
      <div className="flex items-center gap-3">
        <PageIcon path={location.pathname} />
        <h1 className="text-xl font-bold text-text-title hidden md:block">
          {title}
        </h1>
      </div>

      {/* Kanan: Grup Aksi & Info Pengguna yang Ditata Ulang */}
      <div className="flex items-center gap-5">
        <div className="hidden lg:block">
          <Clock />
        </div>

        {/* Grup Aksi dalam "Pill" */}
        <div className="flex items-center gap-1 bg-background/50 border border-light-gray/50 rounded-full p-1 shadow-inner">
          <ThemeToggle />
          <NotificationBell />
          <div className="w-px h-5 bg-light-gray/50 mx-1"></div>
          <Menu as="div" className="relative">
            <Menu.Button as={motion.button} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-text-secondary hover:text-primary hover:bg-primary/10">
              <PlusCircle size={20} />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-surface backdrop-blur-xl border border-light-gray/50 shadow-lg focus:outline-none">
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-bold border-b border-light-gray/50 text-text-secondary uppercase">Aksi Cepat</p>
                  <Menu.Item><NavLink to="/produk" state={{ openAddModal: true }} className="block w-full text-left rounded-md px-2 py-2 mt-1 text-sm font-semibold text-text-main hover:bg-secondary/10 hover:text-primary">Tambah Produk</NavLink></Menu.Item>
                  <Menu.Item><NavLink to="/stok" className="block w-full text-left rounded-md px-2 py-2 text-sm font-semibold text-text-main hover:bg-secondary/10 hover:text-primary">Catat Stok Masuk</NavLink></Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
        
        <div className="w-px h-8 bg-light-gray/50 hidden sm:block"></div>

        {/* Grup Pengguna */}
        <div>
          <UserProfileDropdown />
        </div>
      </div>
    </motion.header>
  );
};

export default Header;