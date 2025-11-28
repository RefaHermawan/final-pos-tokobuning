// src/components/pelanggan/modal/EditPelangganForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../../../api/axios';
import { useToast } from '../../../../hooks/useToast';
import Modal from '../../../ui/Modal';
import { Save, X, User, Phone, MapPin, Edit as EditIcon } from 'lucide-react';

const EditPelangganForm = ({ isOpen, onClose, onSuccess, pelanggan }) => {
    const [formData, setFormData] = useState({ nama_pelanggan: '', nomor_telepon: '', alamat: '' });
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen && pelanggan) {
            setFormData({
                nama_pelanggan: pelanggan.nama_pelanggan || '',
                nomor_telepon: pelanggan.nomor_telepon || '',
                alamat: pelanggan.alamat || '',
            });
        }
    }, [isOpen, pelanggan]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await apiClient.patch(`/transactions/pelanggan/${pelanggan.id}/`, formData);
            addToast("success", <>Data pelanggan <span className="font-bold text-accent">{formData.nama_pelanggan}</span> berhasil diperbarui.</>);
            onSuccess();
        } catch (err) {
            const errorData = err.response?.data;
            let errorMessage = "Gagal memperbarui data pelanggan.";
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
                        <EditIcon size={20} className="text-primary"/>
                        <div>
                            <h2 className="text-lg font-bold text-text-title">Edit Data Pelanggan</h2>
                            <p className="text-xs text-text-secondary">
                                <span className="font-semibold text-text-secondary">Nama Pelanggan:<span className='font-bold text-accent'> {pelanggan?.nama_pelanggan}</span></span>
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                        
                        <motion.div variants={itemVariants}>
                            <label className="text-sm font-semibold text-text-main mb-2 block">Nama Pelanggan {required_field}</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"/>
                                <input 
                                    type="text" 
                                    name="nama_pelanggan"
                                    value={formData.nama_pelanggan} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full pl-10 pr-3 py-2 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                                    placeholder="Nama lengkap pelanggan..."
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="text-sm font-semibold text-text-main mb-2 block">Nomor Telepon <span className="font-normal text-text-secondary">(Opsional)</span></label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"/>
                                <input 
                                    type="text" 
                                    name="nomor_telepon"
                                    value={formData.nomor_telepon} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-3 py-2 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                                    placeholder="08..."
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="text-sm font-semibold text-text-main mb-2 block">Alamat <span className="font-normal text-text-secondary">(Opsional)</span></label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-text-secondary pointer-events-none"/>
                                <textarea 
                                    name="alamat"
                                    value={formData.alamat} 
                                    onChange={handleChange} 
                                    rows="3"
                                    className="w-full pl-10 pr-3 py-2 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                                    placeholder="Alamat singkat pelanggan..."
                                />
                            </div>
                        </motion.div>

                    </motion.div>

                    <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-light-gray/50">
                        <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">
                            Batal
                        </motion.button>
                        <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60">
                            <Save size={16} />{isSaving ? "Menyimpan..." : "Update Pelanggan"}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
    );
};
export default EditPelangganForm;