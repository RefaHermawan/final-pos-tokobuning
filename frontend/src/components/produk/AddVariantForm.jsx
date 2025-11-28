// src/components/produk/AddVariantForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../api/axios';
import Modal from '../ui/Modal';
import { useToast } from '../../hooks/useToast';
import { PlusSquare, Save, X, Tag, Barcode, Warehouse, DollarSign, Truck, Shapes, Scale } from 'lucide-react';

const AddVariantForm = ({ isOpen, onClose, onSuccess, parentProduct, suppliers }) => {
    // --- SEMUA STATE DAN LOGIC TETAP SAMA ---
    const initialFormState = {
        produk_induk: '', nama_varian: '', sku: '', stok: '', satuan: 'pcs',
        purchase_price: '', peringatan_stok_rendah: 10, lacak_stok: true, pemasok: '',
        harga_jual_normal: '', harga_jual_reseller: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen && parentProduct) {
            setFormData({ ...initialFormState, produk_induk: parentProduct.id });
        }
    }, [isOpen, parentProduct]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const payload = {
            ...formData,
            pemasok: formData.pemasok || null,
            harga_jual_reseller: formData.harga_jual_reseller || null,
            sku: formData.sku || null,
        };
        try {
            await apiClient.post('/products/varian-produk/', payload);
            addToast(
                "success",
                <>
                  Varian <span className="font-bold text-accent">{formData.nama_varian}</span> berhasil ditambahkan.
                </>
            );
            onSuccess();
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessage = errorData?.detail || "Gagal menambah varian. Periksa kembali isian Anda.";
            const fullError = errorData ? JSON.stringify(errorData, null, 2) : "Tidak ada detail error dari server.";
            addToast("error", errorMessage, fullError);
            console.error(errorData);
        } finally {
            setIsSaving(false);
        }
    };
    
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
    const required_field = <span className="text-error ml-1">*</span>;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Tambah Varian untuk: ${parentProduct?.nama_produk}`} size="4xl">
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
                <div className="flex-grow max-h-[70vh] overflow-y-auto pr-3 -mr-3 pt-4">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Kolom Kiri: Detail Varian */}
                        <motion.div variants={itemVariants} className=" bg-surface backdrop-blur-sm border border-light-gray/50 rounded-2xl shadow-lg flex flex-col mb-2">
                            <div className="flex items-center gap-3 p-4 bg-surface border-b border-light-gray/50 rounded-t-2xl"><Tag size={20} className="text-primary"/><h3 className="font-bold text-text-title">Detail Varian</h3></div>
                            <div className="p-4 space-y-4 flex-grow">
                                <div>
                                    <label className="text-sm font-semibold text-text-main mb-1 block">Nama Varian {required_field}</label>
                                    <div className="relative"><Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"/><input name="nama_varian" value={formData.nama_varian} onChange={handleChange} required className="input-style-modern pl-10 bg-background border-2 border-light-gray focus:border-accent focus:ring-accent" placeholder="Contoh: Pedas, 250gr"/></div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-main mb-1 block">SKU / Barcode</label>
                                    <div className="relative"><Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"/><input name="sku" value={formData.sku} onChange={handleChange} className="input-style-modern pl-10 font-mono bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"/></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-text-main mb-1 block">Stok Awal {required_field}</label>
                                        <div className="relative"><Warehouse className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"/><input name="stok" type="number" step="0.001" value={formData.stok} onChange={handleChange} required className="input-style-modern pl-10 bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"/></div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-text-main mb-1 block">Satuan {required_field}</label>
                                        <div className="relative"><Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"/><select name="satuan" value={formData.satuan} onChange={handleChange} required className="input-style-modern pl-10 bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"><option value="pcs">Pcs</option><option value="kg">Kg</option><option value="bungkus">Bungkus</option></select></div>
                                    </div>
                                </div>
                                <div className="!mt-auto pt-4">
                                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border-2 border-light-gray/50">
                                        <input id="lacak_stok_varian" name="lacak_stok" type="checkbox" checked={formData.lacak_stok} onChange={handleChange} className="h-5 w-5 rounded accent-primary"/>
                                        <label htmlFor="lacak_stok_varian" className="text-sm font-semibold ">Lacak Stok Varian Ini</label>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Kolom Kanan: Harga & Pemasok */}
                        <motion.div variants={itemVariants} className="bg-surface backdrop-blur-sm border border-light-gray/50 rounded-2xl shadow-lg flex flex-col mb-2">
                            <div className="flex items-center gap-3 p-4 bg-surface border-b border-light-gray/50 rounded-t-2xl"><DollarSign size={20} className="text-primary"/><h3 className="font-bold text-text-title">Harga & Pemasok</h3></div>
                            <div className="p-4 space-y-4 flex-grow">
                                <div>
                                    <label className="text-sm font-semibold text-text-main mb-1 block">Harga Beli {required_field}</label>
                                    <div className="relative"><DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"/><input name="purchase_price" type="number" value={formData.purchase_price} onChange={handleChange} required className="input-style-modern pl-10 font-mono bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"/></div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-main mb-1 block">Harga Ecer {required_field}</label>
                                    <div className="relative"><Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"/><input name="harga_jual_normal" type="number" value={formData.harga_jual_normal} onChange={handleChange} required className="input-style-modern pl-10 font-mono bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"/></div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-main mb-1 block">Harga Grosir <span className="text-text-secondary font-normal">(Opsional)</span></label>
                                    <div className="relative"><Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"/><input name="harga_jual_reseller" type="number" value={formData.harga_jual_reseller} onChange={handleChange} className="input-style-modern pl-10 font-mono bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"/></div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-text-main mb-1 block">Pemasok <span className="text-text-secondary font-normal">(Opsional)</span></label>
                                    <div className="relative"><Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"/><select name="pemasok" value={formData.pemasok} onChange={handleChange} className="input-style-modern pl-10 bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"><option value="">Pilih Pemasok</option>{Array.isArray(suppliers) && suppliers.map(s => <option key={s.id} value={s.id}>{s.nama_pemasok}</option>)}</select></div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="flex-shrink-0 flex justify-end items-center gap-4 pt-4 mt-4 border-t border-light-gray/50">
                    <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">Batal</motion.button>
                    <motion.button 
                        type="submit" 
                        disabled={isSaving} 
                        whileHover={{ scale: 1.05, y: -2 }} 
                        whileTap={{ scale: 0.98, y: 0 }} 
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-accent to-yellow-400 rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60"
                    >
                        <Save size={16} />{isSaving ? "Menyimpan..." : "Simpan Varian"}
                    </motion.button>
                </div>
            </form>
        </Modal>
    );
};

export default AddVariantForm;
