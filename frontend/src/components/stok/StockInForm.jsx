// src/components/stok/StockInForm.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Calendar, RotateCcw, Save, Truck, FileText, ShoppingBag } from "lucide-react";
import apiClient from "../../api/axios";
import { useToast } from "../../hooks/useToast";

const StockInForm = ({ products, suppliers, onSuccess }) => {
    // --- State dan Logic (tidak ada perubahan signifikan) ---
    const [formData, setFormData] = useState({
        supplier_id: "",
        reference_number: "",
        transaction_date: new Date().toISOString().substring(0, 10),
    });
    const [items, setItems] = useState([{ varian_id: "", quantity: "", purchase_price: "" }]);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        if (field === "varian_id" && value) {
            const selectedProduct = products.find((p) => p.id === parseInt(value));
            if (selectedProduct) {
                newItems[index]["purchase_price"] = selectedProduct.purchase_price || "";
            }
        }
        setItems(newItems);
    };
    
    const addItemRow = () => { setItems([...items, { varian_id: "", quantity: "", purchase_price: "" }]) };
    const removeItemRow = (index) => { setItems(items.filter((_, i) => i !== index)) };
    
    const resetForm = () => {
        setFormData({ supplier_id: "", reference_number: "", transaction_date: new Date().toISOString().substring(0, 10) });
        setItems([{ varian_id: "", quantity: "", purchase_price: "" }]);
        // addToast("info", <>Formulir telah <span className="font-bold text-primary">direset</span>.</>);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validItems = items.filter((item) => item.varian_id && item.quantity && item.purchase_price);
        if (validItems.length === 0) {
            addToast("error", <>Harap isi setidaknya <span className="font-bold text-error">satu baris produk</span> dengan lengkap.</>);
            return;
        }
        setLoading(true);
        try {
            // PERBAIKAN: Kirim payload yang sesuai dengan API
            const payload = {
                ...formData,
                reason: "PEMBELIAN",
                items: validItems,
            };
            await apiClient.post("/transactions/manage-stock/", payload);

            const addedProductNames = validItems.map(item => {
                const product = products.find(p => p.id === parseInt(item.varian_id));
                return product ? `${product.nama_produk_induk} (${product.nama_varian})` : null;
            }).filter(Boolean);

            let successMessage;
            if (addedProductNames.length === 1) {
                successMessage = <>Stok untuk <span className="font-bold text-accent">{addedProductNames[0]}</span> berhasil dicatat!</>;
            } else if (addedProductNames.length > 1) {
                successMessage = <>Stok untuk <span className="font-bold text-accent">{addedProductNames.length} produk</span> berhasil dicatat!</>;
            } else {
                successMessage = <>Stok masuk berhasil <span className="font-bold text-success">dicatat!</span></>;
            }

            addToast("success", successMessage);
            resetForm();
            if(onSuccess) onSuccess();
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
            className="bg-surface backdrop-blur-md border border-light-gray rounded-2xl shadow-lg p-6 space-y-8"
        >
            {/* 1. SEKSI INFORMASI UTAMA */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3">
                    <FileText size={20} className="text-primary"/>
                    <h3 className="text-lg font-bold text-text-title">Informasi Utama</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Input Pemasok */}
                    <div className="relative">
                        <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <select name="supplier_id" value={formData.supplier_id} onChange={handleFormChange} required
                            className="w-full pl-11 pr-2 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all">
                            <option value="">-- Pilih Pemasok --</option>
                            {suppliers.map((s) => (<option key={s.id} value={s.id}>{s.nama_pemasok}</option>))}
                        </select>
                    </div>
                    {/* Input No. Referensi */}
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg text-text-secondary">#</span>
                        <input type="text" name="reference_number" placeholder="No. Faktur/Referensi" value={formData.reference_number} onChange={handleFormChange}
                            className="w-full pl-11 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
                    </div>
                    {/* Input Tanggal */}
                    <div className="relative">
                         <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                         <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleFormChange} required
                            className="w-full pl-11 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
                    </div>
                </div>
            </motion.div>

            {/* 2. SEKSI DETAIL PRODUK */}
            <motion.div variants={itemVariants} className="space-y-4">
                 <div className="flex items-center gap-3">
                    <ShoppingBag size={20} className="text-primary"/>
                    <h3 className="text-lg font-bold text-text-title">Detail Produk</h3>
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
                                
                                <div className="col-span-12 md:col-span-5">
                                    <label className="text-xs font-semibold text-text-secondary mb-1 block">Produk</label>
                                    <select value={item.varian_id} onChange={(e) => handleItemChange(index, "varian_id", e.target.value)} required
                                        className="w-full px-3 py-2 bg-surface border-1 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                                        <option value="">Pilih Produk</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.nama_produk_induk} ({p.nama_varian})</option>)}
                                    </select>
                                </div>

                                <div className="col-span-6 md:col-span-2">
                                    <label className="text-xs font-semibold text-text-secondary mb-1 block">Jumlah</label>
                                    <input type="number" step="any" min="0" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} required
                                        className="w-full px-3 py-2 bg-surface border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
                                </div>
                                
                                <div className="col-span-6 md:col-span-3">
                                    <label className="text-xs font-semibold text-text-secondary mb-1 block">Harga Beli</label>
                                    <input type="number" step="any" min="0" value={item.purchase_price} onChange={(e) => handleItemChange(index, "purchase_price", e.target.value)} required
                                        className="w-full px-3 py-2 bg-surface border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
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
                 {/* Tombol Tambah Baris */}
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
                    <Save size={16} /> {loading ? 'Menyimpan...' : 'Simpan Stok Masuk'}
                </motion.button>
            </motion.div>
        </motion.form>
    );
};

export default StockInForm;