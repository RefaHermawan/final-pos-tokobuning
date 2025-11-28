// src/components/kasbon/modal/AddPiutangForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../../../api/axios';
import { useToast } from '../../../../hooks/useToast';
import Modal from '../../../ui/Modal';
import { Save, X, UserPlus, Coins, CalendarDays, User } from 'lucide-react';

const AddPiutangForm = ({ isOpen, onClose, onSuccess }) => {
  const initialFormState = {
    pelanggan_nama: '',
    total_awal: '',
    tanggal_jatuh_tempo: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = { ...formData, tanggal_jatuh_tempo: formData.tanggal_jatuh_tempo || null };
    try {
      await apiClient.post('/transactions/hutang-piutang/create-piutang/', payload);
      addToast("success", <>Piutang untuk <span className="font-bold text-accent">{payload.pelanggan_nama}</span> berhasil ditambahkan.</>);
      onSuccess();
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Gagal menyimpan data piutang.";
      if (errorData) {
        const firstErrorKey = Object.keys(errorData)[0];
        errorMessage = `${firstErrorKey}: ${errorData[firstErrorKey][0]}`;
      }
      const fullError = errorData ? JSON.stringify(errorData, null, 2) : "Tidak ada detail error.";
      addToast("error", <><span className="font-bold">Gagal:</span> {errorMessage}</>, fullError);
      console.error(err.response);
    } finally {
        setIsSaving(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' } } };
  const required_field = <span className="text-error ml-1">*</span>;

  return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface backdrop-blur-xl border border-light-gray/50 rounded-2xl shadow-lg w-full max-w-lg"
        >
            <div className="flex items-center justify-between p-4 border-b border-light-gray/50">
                <div className="flex items-center gap-3">
                    <UserPlus size={20} className="text-primary"/>
                    <h2 className="text-lg font-bold text-text-title">Catat Piutang Baru</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
                    
                    <motion.div variants={itemVariants}>
                        <label className="text-sm font-semibold text-text-main mb-2 block">
                           Nama Pelanggan {required_field}
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"/>
                            <input id="pelanggan_nama" name="pelanggan_nama" value={formData.pelanggan_nama} onChange={handleChange} required 
                                className="w-full pl-10 pr-3 py-2 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                                placeholder="Input nama pelanggan..."
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <label className="text-sm font-semibold text-text-main mb-2 block">
                           Jumlah Total {required_field}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-lg text-text-secondary">Rp</span>
                            <input id="total_awal" name="total_awal" type="number" value={formData.total_awal} onChange={handleChange} required 
                                className="w-full pl-12 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-title focus:ring-2 focus:ring-accent focus:border-accent transition-all font-mono font-bold text-xl"
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <label className="text-sm font-semibold text-text-main mb-2 block">
                           Tanggal Jatuh Tempo <span className="font-normal text-text-secondary">(Opsional)</span>
                        </label>
                         <div className="relative">
                            <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"/>
                            <input id="tanggal_jatuh_tempo" name="tanggal_jatuh_tempo" type="date" value={formData.tanggal_jatuh_tempo} onChange={handleChange} 
                                className="w-full pl-10 pr-3 py-2 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                            />
                         </div>
                    </motion.div>

                </motion.div>

                <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-light-gray/30">
                    <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">
                        Batal
                    </motion.button>
                    <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/50 disabled:opacity-60">
                        <Save size={16} />{isSaving ? "Menyimpan..." : "Simpan Piutang"}
                    </motion.button>
                </div>
            </form>
        </motion.div>
  );
};

export default AddPiutangForm;