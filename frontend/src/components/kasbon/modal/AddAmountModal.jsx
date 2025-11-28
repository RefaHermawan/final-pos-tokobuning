// src/components/kasbon/modal/AddAmountModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../../api/axios';
import { useToast } from '../../../hooks/useToast';
import Modal from '../../ui/Modal'; // Pastikan path ini benar
import { Save, X, User, Truck, Coins, PlusCircle } from 'lucide-react';

const AddAmountModal = ({ isOpen, onClose, onSuccess, kasbonItem }) => {
    const [amountToAdd, setAmountToAdd] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setAmountToAdd('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await apiClient.post(`/transactions/hutang-piutang/${kasbonItem.id}/add_amount/`, {
                amount_to_add: amountToAdd
            });
            const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amountToAdd);
            const entityName = kasbonItem.pelanggan_nama || kasbonItem.supplier_name;
            addToast("success", <>Nominal <span className="font-bold text-accent">{formattedAmount}</span> berhasil ditambahkan ke <span className="font-bold text-accent">{entityName}</span>.</>);
            onSuccess();
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Gagal menambah nominal.";
            const fullError = err.response?.data ? JSON.stringify(err.response.data, null, 2) : "Tidak ada detail error.";
            addToast("error", <><span className="font-bold">Gagal:</span> {errorMessage}</>, fullError);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const isPiutang = kasbonItem.tipe === 'PIUTANG';
    const entityName = kasbonItem.pelanggan_nama || kasbonItem.supplier_name;
    const EntityIcon = isPiutang ? User : Truck;
    
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
                        <PlusCircle size={20} className="text-primary"/>
                        <div>
                            <h2 className="text-lg font-bold text-text-title">Tambah Nominal {isPiutang ? 'Piutang' : 'Hutang'}</h2>
                            <p className="text-xs text-text-secondary">Untuk: <span className="font-semibold text-accent">{entityName}</span></p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
                        
                        <motion.div variants={itemVariants}>
                            <label className="text-sm font-semibold text-text-main mb-2 block">
                                {isPiutang ? 'Pelanggan' : 'Supplier'}
                            </label>
                            <div className="flex items-center gap-3 bg-background p-3 rounded-lg border-2 border-light-gray">
                                <div className="w-9 h-9 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                    <EntityIcon size={18}/>
                                </div>
                                <span className="font-bold text-text-title">{entityName}</span>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="text-sm font-semibold text-text-main mb-2 block">
                                Jumlah Tambahan {required_field}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-lg text-text-secondary">Rp</span>
                                <input 
                                    type="number" 
                                    value={amountToAdd} 
                                    onChange={(e) => setAmountToAdd(e.target.value)} 
                                    required 
                                    autoFocus
                                    className="w-full pl-12 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-title focus:ring-2 focus:ring-accent focus:border-accent transition-all font-mono font-bold text-xl"
                                    placeholder="0"
                                />
                            </div>
                        </motion.div>

                    </motion.div>

                    <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-light-gray/30">
                        <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">
                            Batal
                        </motion.button>
                        <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg  hover:shadow-accent/30 disabled:opacity-60">
                            <Save size={16} />{isSaving ? "Menyimpan..." : "Tambah"}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
    );
};

export default AddAmountModal;