// src/components/pengaturan/InfoToko.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import { Store, Phone, MapPin, Receipt, Save } from 'lucide-react';

// Komponen Skeleton untuk pengalaman memuat yang lebih baik
const InfoTokoSkeleton = () => (
    <div className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-6 space-y-6 animate-pulse">
        <div className="h-8 w-1/3 bg-light-gray/50 rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <div className="h-4 w-1/4 bg-light-gray/50 rounded"></div>
                <div className="h-11 bg-light-gray/50 rounded-lg"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 w-1/4 bg-light-gray/50 rounded"></div>
                <div className="h-11 bg-light-gray/50 rounded-lg"></div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-4 w-1/4 bg-light-gray/50 rounded"></div>
            <div className="h-20 bg-light-gray/50 rounded-lg"></div>
        </div>
        <div className="flex justify-end">
            <div className="h-11 w-40 bg-light-gray/50 rounded-lg"></div>
        </div>
    </div>
);

const InfoToko = () => {
  const [storeInfo, setStoreInfo] = useState({
    nama_toko: '',
    alamat: '',
    telepon: '',
    footer_struk: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    apiClient.get('/transactions/store-info/')
      .then(res => setStoreInfo(res.data))
      .catch(() => addToast("error", "Gagal memuat informasi toko."))
      .finally(() => setLoading(false));
  }, [addToast]);

  const handleChange = (e) => {
    setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put('/transactions/store-info/', storeInfo);
      addToast("success", <>Informasi toko berhasil <span className="font-bold text-success">diperbarui!</span></>);
    } catch (err) {
      addToast("error", "Gagal memperbarui informasi toko.");
    } finally {
      setIsSaving(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  if (loading) return <InfoTokoSkeleton />;

  return (
    <motion.form 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit} 
        className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg p-6 space-y-6"
    >
        <motion.div variants={itemVariants} className="flex items-center gap-3 border-b border-light-gray/50 pb-4">
            <Store size={24} className="text-primary"/>
            <h2 className="text-xl font-bold text-text-title">Informasi Toko Anda</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Nama Toko */}
            <motion.div variants={itemVariants}>
                <label className="text-sm font-semibold text-text-main mb-2 block">Nama Toko</label>
                <div className="relative">
                    <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input name="nama_toko" value={storeInfo.nama_toko} onChange={handleChange}
                        className="w-full pl-11 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all" />
                </div>
            </motion.div>

            {/* Nomor Telepon */}
            <motion.div variants={itemVariants}>
                <label className="text-sm font-semibold text-text-main mb-2 block">Nomor Telepon</label>
                <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input name="telepon" value={storeInfo.telepon} onChange={handleChange}
                        className="w-full pl-11 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all" />
                </div>
            </motion.div>

            {/* Alamat Toko */}
            <motion.div variants={itemVariants} className="md:col-span-2">
                <label className="text-sm font-semibold text-text-main mb-2 block">Alamat Toko</label>
                <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-text-secondary" />
                    <textarea name="alamat" value={storeInfo.alamat} onChange={handleChange} rows="3"
                        className="w-full pl-11 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all" />
                </div>
            </motion.div>

            {/* Footer Struk */}
            <motion.div variants={itemVariants} className="md:col-span-2">
                <label className="text-sm font-semibold text-text-main mb-2 block">Footer Struk</label>
                <div className="relative">
                    <Receipt className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input name="footer_struk" placeholder="Contoh: Terima kasih telah berbelanja!" value={storeInfo.footer_struk} onChange={handleChange}
                        className="w-full pl-11 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all" />
                </div>
            </motion.div>
        </div>

        <motion.div variants={itemVariants} className="flex justify-end pt-4 border-t border-light-gray/50">
            <motion.button 
                type="submit" 
                disabled={isSaving}
                whileHover={{ scale: 1.05, y: 0 }} 
                whileTap={{ scale: 0.95, y: 0 }} 
                className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg  hover:shadow-primary/50 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none"
            >
                <Save size={16} /> 
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </motion.button>
        </motion.div>
    </motion.form>
  );
};

export default InfoToko;