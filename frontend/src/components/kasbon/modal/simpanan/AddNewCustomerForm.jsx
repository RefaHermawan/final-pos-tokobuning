// src/components/simpanan/modal/AddSetoranForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../../../api/axios';
import { useToast } from '../../../../hooks/useToast';
import Modal from '../../../ui/Modal';
import { Save, X, User, Coins, Phone, MapPin, PiggyBank } from 'lucide-react';

const AddNewCustomerForm = ({ isOpen, onClose, onSuccess }) => {
    const initialFormState = {
        nama_pelanggan: '',
        jumlah: '',
        nomor_telepon: '',
        alamat: '',
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
        try {
            await apiClient.post('/transactions/setoran-simpanan/', formData);
            const formattedJumlah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.jumlah);
            addToast("success", <>Setoran <span className="font-bold text-accent">{formattedJumlah}</span> untuk pelanggan baru <span className="font-bold text-accent">{formData.nama_pelanggan}</span> berhasil.</>);
            onSuccess();
        } catch (err) {
            const errorData = err.response?.data;
            let errorMessage = "Gagal mencatat setoran.";
            if (errorData) {
                const firstErrorKey = Object.keys(errorData)[0];
                errorMessage = `${firstErrorKey}: ${errorData[firstErrorKey][0]}`;
            }
            const fullError = errorData ? JSON.stringify(errorData, null, 2) : "Tidak ada detail error.";
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
                        <h2 className="text-lg font-bold text-text-title">Catat Setoran Simpanan Baru</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
                        
                        <motion.div variants={itemVariants}>
                            <label className="text-sm font-semibold text-text-main mb-2 block">Nama Pelanggan {required_field}</label>
                            <div className="relative">
                                <User className="input-icon-style"/>
                                <input name="nama_pelanggan" value={formData.nama_pelanggan} onChange={handleChange} required className="input-style-modern pl-10 bg-background border-2 border-light-gray" placeholder="Ketik nama pelanggan..."/>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="text-sm font-semibold text-text-main mb-2 block">Jumlah Setoran {required_field}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-lg text-text-secondary">Rp</span>
                                <input name="jumlah" type="number" value={formData.jumlah} onChange={handleChange} required 
                                    className="w-full pl-12 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-title focus:ring-2 focus:ring-accent focus:border-accent transition-all font-mono font-bold text-xl"
                                />
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <motion.div variants={itemVariants}>
                                <label className="text-sm font-semibold text-text-main mb-2 block">Nomor Telepon <span className="font-normal text-text-secondary">(Opsional)</span></label>
                                <div className="relative">
                                    <Phone className="input-icon-style"/>
                                    <input type="text" name="nomor_telepon" value={formData.nomor_telepon} onChange={handleChange} className="input-style-modern pl-10 bg-background border-2 border-light-gray" placeholder="08..."/>
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="text-sm font-semibold text-text-main mb-2 block">Alamat <span className="font-normal text-text-secondary">(Opsional)</span></label>
                                <div className="relative">
                                    <MapPin className="input-icon-style"/>
                                    <input name="alamat" value={formData.alamat} onChange={handleChange} className="input-style-modern pl-10 bg-background border-2 border-light-gray" placeholder="Alamat singkat..."/>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-light-gray/50">
                        <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">
                            Batal
                        </motion.button>
                        <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60">
                            <Save size={16} />{isSaving ? "Menyimpan..." : "Simpan Setoran"}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
    );
};

export default AddNewCustomerForm;