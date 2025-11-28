// src/components/simpanan/modal/AddDepositForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../../../api/axios';
import { useToast } from '../../../../hooks/useToast';
import Modal from '../../../ui/Modal';
import { Save, X, User, Coins, PiggyBank } from 'lucide-react';

const AddDepositForm = ({ isOpen, onClose, onSuccess, pelanggan }) => {
    const [jumlah, setJumlah] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();
    
    useEffect(() => {
        if (isOpen) {
            setJumlah(''); // Reset field setiap kali modal dibuka
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                nama_pelanggan: pelanggan.nama_pelanggan,
                jumlah: jumlah,
            };
            await apiClient.post('/transactions/setoran-simpanan/', payload);
            const formattedJumlah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(jumlah);
            addToast("success", <>Setoran <span className="font-bold text-accent">{formattedJumlah}</span> untuk <span className="font-bold text-accent">{pelanggan.nama_pelanggan}</span> berhasil.</>);
            onSuccess();
        } catch (err) {
            const errorMessage = err.response?.data?.detail || "Gagal menambah setoran.";
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
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface backdrop-blur-xl border border-light-gray/50 rounded-2xl shadow-lg w-full max-w-lg"
            >
                <div className="flex items-center justify-between p-4 border-b border-light-gray/50">
                    <div className="flex items-center gap-3">
                        <PiggyBank size={20} className="text-primary"/>
                        <h2 className="text-lg font-bold text-text-title">Tambah Setoran</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
                        
                        <motion.div variants={itemVariants}>
                            <label className="text-sm font-semibold text-text-main mb-2 block">
                                Pelanggan
                            </label>
                            {/* Menampilkan nama pelanggan sebagai info, bukan input */}
                            <div className="flex items-center gap-3 bg-background p-3 rounded-lg border-2 border-light-gray">
                                <div className="w-9 h-9 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                    {pelanggan?.nama_pelanggan?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-text-title">{pelanggan?.nama_pelanggan || ''}</span>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="text-sm font-semibold text-text-main mb-2 block">
                                Jumlah Setoran Baru {required_field}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-lg text-text-secondary">Rp</span>
                                <input 
                                    type="number" 
                                    value={jumlah} 
                                    onChange={(e) => setJumlah(e.target.value)} 
                                    required 
                                    className="w-full pl-12 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-title focus:ring-2 focus:ring-accent focus:border-accent transition-all font-mono font-bold text-xl"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>
                        </motion.div>

                    </motion.div>

                    <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-light-gray/50">
                        <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">
                            Batal
                        </motion.button>
                        <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60">
                            <Save size={16} />{isSaving ? "Menyimpan..." : "Tambah Setoran"}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
    );
};

export default AddDepositForm;