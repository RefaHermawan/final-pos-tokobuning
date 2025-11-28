// src/components/kasbon/modal/EditHutangForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../../../api/axios';
import { useToast } from '../../../../hooks/useToast';
import Modal from '../../../ui/Modal';
import { Save, X, Coins, CalendarDays, Edit as EditIcon } from 'lucide-react';

const EditHutangForm = ({ isOpen, onClose, onSuccess, kasbonItem }) => {
  const initialFormState = {
    total_awal: '',
    tanggal_jatuh_tempo: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && kasbonItem) {
      setFormData({
        total_awal: kasbonItem.total_awal || '',
        // Format tanggal agar sesuai dengan input type="date" (YYYY-MM-DD)
        tanggal_jatuh_tempo: kasbonItem.tanggal_jatuh_tempo ? new Date(kasbonItem.tanggal_jatuh_tempo).toISOString().substring(0, 10) : '',
      });
    }
  }, [isOpen, kasbonItem]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = { ...formData, tanggal_jatuh_tempo: formData.tanggal_jatuh_tempo || null };
    try {
      await apiClient.patch(`/transactions/hutang-piutang/${kasbonItem.id}/`, payload);
      addToast("success", <>Hutang ke <span className="font-bold text-accent">{kasbonItem.supplier_name}</span> berhasil diperbarui.</>);
      onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Gagal mengupdate data hutang.";
      const fullError = err.response?.data ? JSON.stringify(err.response.data, null, 2) : "Tidak ada detail error.";
      addToast("error", <><span className="font-bold">Gagal:</span> {errorMessage}</>, fullError);
    } finally {
        setIsSaving(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' } } };
  const required_field = <span className="text-error ml-1">*</span>;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface backdrop-blur-xl border border-light-gray/50 rounded-2xl shadow-lg w-full max-w-lg"
        >
            <div className="flex items-center justify-between p-4 border-b border-light-gray/50">
                <div className="flex items-center gap-3">
                    <EditIcon size={20} className="text-primary"/>
                    <div>
                        <h2 className="text-lg font-bold text-text-title">Edit Hutang</h2>
                        <p className="text-xs text-text-secondary">Untuk Supplier: <span className="font-semibold text-sm text-accent">{kasbonItem?.supplier_name}</span></p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
                    
                    <motion.div variants={itemVariants}>
                        <label className="text-sm font-semibold text-text-main mb-2  flex items-center gap-2">
                           <Coins size={16} className="text-primary"/> Jumlah Total Baru {required_field}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-lg text-text-secondary">Rp</span>
                            <input id="total_awal" name="total_awal" type="number" value={formData.total_awal} onChange={handleChange} required 
                                className="w-full pl-12 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-title focus:ring-2 focus:ring-accent focus:border-accent transition-all font-mono font-bold text-xl"
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <label className="text-sm font-semibold text-text-main mb-2  flex items-center gap-2">
                           <CalendarDays size={16} className="text-primary"/> Tgl Jatuh Tempo <span className="font-normal text-text-secondary">(Opsional)</span>
                        </label>
                         <div className="relative">
                            <input id="tanggal_jatuh_tempo" name="tanggal_jatuh_tempo" type="date" value={formData.tanggal_jatuh_tempo} onChange={handleChange} 
                                className="w-full px-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                            />
                         </div>
                    </motion.div>

                </motion.div>

                <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-light-gray/50">
                    <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">
                        Batal
                    </motion.button>
                    <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg hover:shadow-accent/30 shadow-lg disabled:opacity-60">
                        <Save size={16} />{isSaving ? "Menyimpan..." : "Update Hutang"}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    </Modal>
  );
};

export default EditHutangForm;