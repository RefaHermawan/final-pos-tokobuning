// src/pages/Pengaturan.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoToko from '../components/pengaturan/InfoToko';
import ManajemenKategori from '../components/pengaturan/ManajemenKategori';
import ManajemenPengguna from '../components/pengaturan/ManajemenPengguna';
import { Settings, Store, Shapes, Users } from 'lucide-react';

const Pengaturan = () => {
  const [activeTab, setActiveTab] = useState('toko');

  // Daftar tab untuk kemudahan mapping dan styling
  const tabs = [
    { id: 'toko', label: 'Informasi Toko', icon: Store },
    { id: 'kategori', label: 'Kategori Produk', icon: Shapes },
    { id: 'pengguna', label: 'Manajemen Pengguna', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'toko': return <InfoToko />;
      case 'kategori': return <ManajemenKategori />;
      case 'pengguna': return <ManajemenPengguna />;
      default: return null;
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

  return (
    <div className="relative min-h-screen">
        <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
            <div className="absolute -top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-blob"></div>
            <div className="absolute -bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl animate-blob animation-delay-3000"></div>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-4 sm:p-6">
            {/* 1. Header Halaman yang Modern */}
            <motion.div variants={itemVariants} className="flex items-center gap-4">
                <div className="bg-surface/80 backdrop-blur-sm border border-white/10 p-3 rounded-2xl shadow-lg">
                    <Settings size={28} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-text-title">Pengaturan</h1>
                    <p className="text-sm text-text-secondary mt-1">Kelola informasi toko, kategori, dan pengguna sistem Anda.</p>
                </div>
            </motion.div>

            {/* 2. Layout Kartu Terintegrasi */}
            <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
                {/* 3. Navigasi Tab 'Sliding Pill' yang Interaktif */}
                <div className="p-1.5 flex items-center justify-start space-x-2 overflow-x-auto border-b border-light-gray/30">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-300
                                ${activeTab === tab.id ? 'text-white' : 'text-text-secondary hover:bg-primary/10 hover:text-primary'}`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="pengaturanActiveTabPill"
                                    className="absolute inset-0 bg-primary shadow-md shadow-primary/40"
                                    style={{ borderRadius: '0.5rem' }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            )}
                            <span className="relative z-10"><tab.icon size={16} /></span>
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>
                
                {/* 4. Transisi Konten yang Mulus */}
                <div className="p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
                            exit={{ opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' } }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    </div>
  );
};

export default Pengaturan;