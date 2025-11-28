// src/components/supplier/SupplierFormModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
// PERUBAHAN: Ikon 'Mail' dihapus dari import
import { Truck, Save, User, Phone, MapPin, Building2, Info } from 'lucide-react';

const SupplierFormModal = ({ isOpen, onClose, onSuccess, supplier }) => {
  // PERUBAHAN: 'email' dihapus dari state
  const [formData, setFormData] = useState({
    nama_pemasok: '',
    kontak_person: '',
    nomor_telepon: '',
    alamat: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();
  const isEditMode = !!supplier;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
            nama_pemasok: supplier.nama_pemasok || '',
            kontak_person: supplier.kontak_person || '',
            nomor_telepon: supplier.nomor_telepon || '',
            alamat: supplier.alamat || ''
        });
      } else {
        // PERUBAHAN: 'email' dihapus dari state awal
        setFormData({ nama_pemasok: '', kontak_person: '', nomor_telepon: '', alamat: '' });
      }
    }
  }, [isOpen, supplier, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditMode) {
        await apiClient.put(`/products/pemasok/${supplier.id}/`, formData);
        addToast("success", <>Supplier <span className="font-bold text-accent">{formData.nama_pemasok}</span> berhasil diperbarui.</>);
      } else {
        await apiClient.post('/products/pemasok/', formData);
        addToast("success", <>Supplier <span className="font-bold text-accent">{formData.nama_pemasok}</span> berhasil ditambahkan.</>);
      }
      onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.nama_pemasok?.[0] || "Gagal menyimpan supplier.";
      const fullError = err.response?.data ? JSON.stringify(err.response.data, null, 2) : "Tidak ada detail error.";
      addToast("error", <><span className="font-bold">Gagal:</span> {errorMessage}</>, fullError);
      console.error(err.response);
    } finally {
      setIsSaving(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const required_field = <span className="text-error ml-1">*</span>;

  const sidePanel = (
    <div className="flex flex-col text-center h-full p-4">
        <div className="bg-primary/10 p-4 rounded-full mt-8 mb-6 mx-auto">
            <Truck size={40} className="text-primary" />
        </div>
        <h3 className="text-xl font-bold text-text-title">
            {isEditMode ? 'Edit Data Supplier' : 'Supplier Baru'}
        </h3>
        <p className="text-sm text-text-secondary mt-2 flex-grow">
            {isEditMode 
                ? `Perbarui informasi untuk ${supplier?.nama_pemasok}.`
                : 'Lengkapi formulir untuk menambahkan pemasok baru ke dalam sistem.'
            }
        </p>
        <div className="text-xs text-text-secondary/50 mt-4 flex items-center gap-2 mx-auto">
            <Info size={14}/> Data supplier akan digunakan di modul Stok dan Laporan.
        </div>
    </div>
  );

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={isEditMode ? 'Edit Supplier' : 'Tambah Supplier'}
        sidePanelContent={sidePanel}
    >
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-grow max-h-[65vh] overflow-y-auto pr-3 -mr-3 p-1">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                    <motion.div variants={itemVariants}>
                        <label className="label-style">Nama Supplier {required_field}</label>
                        <div className="relative">
                            <Building2 className="input-icon-style"/>
                            <input name="nama_pemasok" value={formData.nama_pemasok} onChange={handleChange} required className="input-style-modern pl-10 bg-background border-2 border-light-gray focus:border-accent focus:ring-accent" placeholder="Contoh: PT Pangan Sejahtera"/>
                        </div>
                    </motion.div>
                    
                    {/* PERUBAHAN: Layout 'Kontak Person' dan 'Nomor Telepon' dikembalikan berdampingan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div variants={itemVariants}>
                            <label className="label-style">Kontak Person</label>
                            <div className="relative">
                                <User className="input-icon-style"/>
                                <input name="kontak_person" value={formData.kontak_person} onChange={handleChange} className="input-style-modern pl-10 bg-background border-2 border-light-gray focus:border-accent focus:ring-accent" placeholder="Nama penanggung jawab"/>
                            </div>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                             <label className="label-style">Nomor Telepon</label>
                            <div className="relative">
                                <Phone className="input-icon-style"/>
                                <input name="nomor_telepon" value={formData.nomor_telepon} onChange={handleChange} className="input-style-modern pl-10 bg-background border-2 border-light-gray focus:border-accent focus:ring-accent" placeholder="0812-xxxx-xxxx"/>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants}>
                        <label className="label-style">Alamat</label>
                        <div className="relative">
                            <MapPin className="input-icon-style top-5"/>
                            <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows="4" className="input-style-modern pl-10 bg-background border-2 border-light-gray focus:border-accent focus:ring-accent" placeholder="Alamat lengkap supplier"></textarea>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <div className="flex-shrink-0 flex justify-end items-center gap-4 pt-4 mt-4 border-t border-light-gray/50">
                <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">
                    Batal
                </motion.button>
                <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60">
                    <Save size={16} />{isSaving ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Simpan Supplier")}
                </motion.button>
            </div>
        </form>
    </Modal>
  );
};

export default SupplierFormModal;