// src/components/stok/StockOutForm.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RotateCcw, Save, AlertCircle, MessageSquare, ShoppingBag, ChevronDown } from 'lucide-react';
import apiClient from '../../api/axios';
import { useToast } from '../../hooks/useToast';

const StockOutForm = ({ products, onSuccess }) => {
    // --- State dan Logic disesuaikan untuk Stok Keluar ---
    const [formData, setFormData] = useState({
        reason: 'RUSAK',
        notes: ''
    });
    const [items, setItems] = useState([{ varian_id: '', quantity: '', notes: '' }]);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItemRow = () => { setItems([...items, { varian_id: '', quantity: '', notes: '' }]) };
    const removeItemRow = (index) => { setItems(items.filter((_, i) => i !== index)) };

    const resetForm = () => {
        setFormData({ reason: 'RUSAK', notes: '' });
        setItems([{ varian_id: '', quantity: '', notes: '' }]);
        // addToast("info", <>Formulir telah <span className="font-bold text-primary">direset</span>.</>);
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validItems = items.filter(item => item.varian_id && item.quantity);
        if (validItems.length === 0) {
            addToast("error", <>Harap isi setidaknya <span className="font-bold text-error">satu baris produk</span> dengan lengkap.</>);
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...formData,
                items: validItems
            };
            await apiClient.post('/transactions/manage-stock/', payload);
            
            const removedProductNames = validItems.map(item => {
                const product = products.find(p => p.id === parseInt(item.varian_id));
                return product ? `${product.nama_produk_induk} ${product.nama_varian}` : null;
            }).filter(Boolean);

            let successMessage;
            if (removedProductNames.length === 1) {
                successMessage = <>Stok keluar untuk <span className="font-bold text-accent">{removedProductNames[0]}</span> berhasil dicatat!</>;
            } else if (removedProductNames.length > 1) {
                successMessage = <>Stok keluar untuk <span className="font-bold text-accent">{removedProductNames.length} produk</span> berhasil dicatat!</>;
            } else {
                successMessage = <>Stok keluar berhasil <span className="font-bold text-success">dicatat!</span></>;
            }

            addToast("success", successMessage);
            onSuccess();
            resetForm();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Terjadi kesalahan";
            const fullError = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
            addToast("error", <><span className="font-bold">Gagal:</span> {errorMessage}</>, fullError);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

    return (
        <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="bg-surface backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-6 space-y-8"
        >
            {/* 1. SEKSI INFORMASI UTAMA */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-primary"/>
                    <h3 className="text-lg font-bold text-text-title">Alasan & Catatan</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Input Alasan dengan ChevronDown */}
                    <div className="relative">
                        <select name="reason" value={formData.reason} onChange={handleFormChange} required
                            // 3. Sesuaikan padding (pr-10) untuk memberi ruang ikon
                            className="w-full pl-4 pr-10 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all appearance-none">
                            <option value="RUSAK">-- Barang Rusak/Kadaluwarsa --</option>
                            <option value="HILANG">Barang Hilang</option>
                            <option value="INTERNAL">Keperluan Toko</option>
                            <option value="OTHER">Lainnya</option>
                        </select>
                        {/* 2. Tambahkan ikon ChevronDown di dalam div relative */}
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                    </div>
                    {/* Input Catatan Umum */}
                    <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input type="text" name="notes" placeholder="Catatan umum (opsional)" value={formData.notes} onChange={handleFormChange}
                            className="w-full pl-11 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all" />
                    </div>
                
                </div>
            </motion.div>

            {/* 2. SEKSI DETAIL PRODUK */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                    <ShoppingBag size={20} className="text-primary"/>
                    <h3 className="text-lg font-bold text-text-title">Detail Produk yang Dikeluarkan</h3>
                </div>
                <div className="space-y-4">
                    <AnimatePresence>
                        {items.map((item, index) => (
                            <motion.div
                                key={index}
                                layout
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -300, transition: { duration: 0.3 } }}
                                className="grid grid-cols-12 gap-4 items-end bg-background p-4 rounded-xl border-2 border-light-gray"
                            >
                                <span className="col-span-12 md:col-span-1 font-bold text-primary text-center bg-primary/10 rounded-md py-2">{index + 1}</span>
                                
                                <div className="col-span-12 md:col-span-4">
                                    <label className="text-xs font-semibold text-text-secondary mb-1 block">Produk</label>
                                    <select value={item.varian_id} onChange={(e) => handleItemChange(index, "varian_id", e.target.value)} required
                                        className="w-full px-3 py-2 bg-surface border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all">
                                        <option value="">Pilih Produk</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.nama_produk_induk} ({p.nama_varian})</option>)}
                                    </select>
                                </div>

                                <div className="col-span-6 md:col-span-2">
                                    <label className="text-xs font-semibold text-text-secondary mb-1 block">Jumlah</label>
                                    <input type="number" step="any" min="0" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} required
                                        className="w-full px-3 py-2 bg-surface border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"/>
                                </div>
                                
                                <div className="col-span-6 md:col-span-4">
                                    <label className="text-xs font-semibold text-text-secondary mb-1 block">Catatan Item</label>
                                    <input type="text" value={item.notes} onChange={(e) => handleItemChange(index, "notes", e.target.value)} placeholder="Misal: Pecah"
                                        className="w-full px-3 py-2 bg-surface border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"/>
                                </div>

                                <div className="col-span-12 md:col-span-1 flex justify-end items-end">
                                    <motion.button type="button" onClick={() => removeItemRow(index)} title="Hapus Baris" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors">
                                        <Trash2 size={18} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                 <motion.button type="button" onClick={addItemRow} whileHover={{ scale: 1.02 }} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 border-2 border-dashed border-primary/30 rounded-lg transition-colors">
                    <Plus size={16} /> Tambah Baris Produk
                </motion.button>
            </motion.div>

            {/* 3. SEKSI AKSI FINAL */}
            <motion.div variants={itemVariants} className="flex justify-end items-center gap-4 pt-4 border-t border-light-gray/50">
                 <motion.button type="button" onClick={resetForm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group flex items-center gap-2 px-4 py-2 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg transition-colors">
                    <span className="transition-transform duration-300 group-hover:rotate-[-45deg]"><RotateCcw size={16} /></span> Reset Form
                </motion.button>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.05, y: 0 }} whileTap={{ scale: 0.95, y: 0 }} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg hover:shadow-primary/30 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none">
                    <Save size={16} /> {loading ? 'Menyimpan...' : 'Simpan Stok Keluar'}
                </motion.button>
            </motion.div>
        </motion.form>
    );
};

export default StockOutForm;