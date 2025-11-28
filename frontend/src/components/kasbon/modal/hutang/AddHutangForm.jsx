// src/components/kasbon/modal/AddHutangForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../../../api/axios';
import { useToast } from '../../../../hooks/useToast';
import Modal from '../../../ui/Modal';
// PERUBAHAN: Ikon baru yang lebih segar
import { Save, X, Building, Coins, CalendarDays, ClipboardEdit } from 'lucide-react';

const AddHutangForm = ({ isOpen, onClose, onSuccess, suppliers }) => {
  const initialFormState = {
    supplier: '',
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
      await apiClient.post('/transactions/hutang-piutang/create-hutang/', payload);
      const supplierName = suppliers.find(s => s.id === parseInt(formData.supplier))?.nama_pemasok || '';
      addToast("success", <>Hutang baru ke <span className="font-bold text-accent">{supplierName}</span> berhasil ditambahkan.</>);
      onSuccess();
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Gagal menyimpan data hutang.";
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
            {/* Header yang lebih ringkas */}
            <div className="flex items-center justify-between p-4 border-b border-light-gray/50">
                <div className="flex items-center gap-3">
                    <ClipboardEdit size={20} className="text-primary"/>
                    <h2 className="text-lg font-bold text-text-title">Catat Hutang Baru</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
                    
                    {/* Layout Terpadu yang Mengalir */}
                    <motion.div variants={itemVariants}>
                        <label className="text-sm font-semibold text-text-main mb-2 block">
                           Supplier {required_field}
                        </label>
                        <div className="relative">
                            <Building className="input-icon-style"/>
                            <select id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} required 
                                className="input-style-modern pl-10 bg-background border-light-gray border-2"
                            >
                                <option value="">Pilih dari daftar supplier...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama_pemasok}</option>)}
                            </select>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <label className="text-sm font-semibold text-text-main mb-2 block">
                           Jumlah Total {required_field}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-lg text-text-secondary">Rp</span>
                            {/* Input nominal yang lebih compact */}
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
                            <CalendarDays className="input-icon-style"/>
                            <input id="tanggal_jatuh_tempo" name="tanggal_jatuh_tempo" type="date" value={formData.tanggal_jatuh_tempo} onChange={handleChange} 
                                className="input-style-modern pl-10 bg-background border-light-gray border-2"
                            />
                         </div>
                    </motion.div>

                </motion.div>

                <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-light-gray/50">
                    <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">
                        Batal
                    </motion.button>
                    <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60">
                        <Save size={16} />{isSaving ? "Menyimpan..." : "Simpan Hutang"}
                    </motion.button>
                </div>
            </form>
        </motion.div>
  );
};

export default AddHutangForm;

// CATATAN: Pastikan Anda memiliki kelas-kelas ini di CSS global (src/index.css)
// .input-style-modern {
//   @apply w-full px-3 py-2 bg-background/70 border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all;
// }
// .input-icon-style {
//   @apply absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none;
// }