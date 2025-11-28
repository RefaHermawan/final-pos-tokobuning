// src/components/pengaturan/ManajemenKategori.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import { Shapes, Plus, Edit, Trash2, Save, X, Inbox, List, ChevronsRight } from 'lucide-react';
import ConfirmationModal from '../ui/ConfirmationModal';

// --- Helper Components ---

const SkeletonList = () => (
    <div className="space-y-2 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-light-gray/50 rounded-lg"></div>
        ))}
    </div>
);

const FormPanel = ({ mode, category, onSave, onUpdate, onDelete, onCancel, isLoading }) => {
    const [name, setName] = useState(mode === 'edit' ? category.nama_kategori : '');
    
    useEffect(() => {
        setName(mode === 'edit' ? category.nama_kategori : '');
    }, [mode, category]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === 'edit') {
            onUpdate({ ...category, nama_kategori: name });
        } else {
            onSave(name);
        }
    };
    
    const contentVariants = {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
        exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' } },
    };

    const title = mode === 'edit' ? 'Edit Kategori' : 'Tambah Kategori Baru';
    const Icon = mode === 'edit' ? Edit : Plus;
    const buttonText = mode === 'edit' ? 'Simpan Perubahan' : 'Tambahkan Kategori';
    
    return (
        <motion.div key={mode} variants={contentVariants} initial="initial" animate="animate" exit="exit"
            className="bg-background border border-light-gray/50 p-6 rounded-xl h-full flex flex-col"
        >
            <div className="flex items-center gap-3 mb-6">
                <Icon size={20} className="text-primary"/>
                <h3 className="text-lg font-bold text-text-title">{title}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                <div className="flex-grow">
                    <label className="text-sm font-semibold text-text-main mb-2 block">Nama Kategori</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Minuman Dingin" required
                        className="w-full pl-4 pr-4 py-2.5 bg-surface border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all" autoFocus />
                </div>
                
                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-light-gray/30">
                    {mode === 'edit' && (
                        <motion.button type="button" onClick={() => onDelete(category)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center gap-2 p-2.5 text-sm font-bold text-error bg-error/10 hover:bg-error/20 rounded-lg">
                            <Trash2 size={16} /> Hapus
                        </motion.button>
                    )}
                    <div className="flex-grow"></div>
                    <motion.button type="button" onClick={onCancel} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg transition-colors">
                        Batal
                    </motion.button>
                    <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60">
                        <Save size={16} /> {buttonText}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};


const ManajemenKategori = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formMode, setFormMode] = useState('idle'); // 'idle', 'add', 'edit'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const { addToast } = useToast();
  
  const fetchCategories = () => {
    setLoading(true);
    apiClient.get('/products/kategori/')
      .then(res => setCategories(res.data.results || res.data))
      .catch(() => addToast("error", "Gagal memuat kategori."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

      const handleAddCategory = async (name) => {
        try {
            await apiClient.post('/products/kategori/', { nama_kategori: name });
            addToast("success", <>Kategori <span className="font-bold text-accent">{name}</span> berhasil ditambahkan.</>);
            setFormMode('idle');
            fetchCategories();
        } catch (err) { addToast("error", "Gagal menambah kategori.") }
    };
  
    const handleUpdateCategory = async (categoryToUpdate) => {
        try {
            await apiClient.patch(`/products/kategori/${categoryToUpdate.id}/`, { nama_kategori: categoryToUpdate.nama_kategori });
            addToast("success", <>Kategori berhasil diperbarui menjadi <span className="font-bold text-accent">{categoryToUpdate.nama_kategori}</span>.</>);
            setFormMode('idle');
            setSelectedCategory(null);
            fetchCategories();
        } catch (err) { addToast("error", "Gagal memperbarui kategori.") }
    };
    
    const handleDeleteCategory = (category) => {
        setSelectedCategory(category); // Pilih item yang akan dihapus
        setConfirmModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (!selectedCategory) return;
        try {
            await apiClient.delete(`/products/kategori/${selectedCategory.id}/`);
            addToast("success", <>Kategori <span className="font-bold text-accent">{selectedCategory.nama_kategori}</span> berhasil dihapus.</>);
            fetchCategories();
        } catch (err) {
            if (err.response && err.response.status === 400) {
                addToast("error", <>Tidak bisa menghapus. Kategori <span className="font-bold text-accent">{selectedCategory.nama_kategori}</span> masih digunakan oleh produk.</>);
            } else { addToast("error", "Gagal menghapus kategori.") }
        } finally {
            setConfirmModalOpen(false);
            setFormMode('idle');
            setSelectedCategory(null);
        }
    };

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        setFormMode('edit');
    };

    const handleCancel = () => {
        setFormMode('idle');
        setSelectedCategory(null);
    }
    
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
    
    return (
        <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg"
            >
                {/* Layout Dua Kolom (Master-Detail) */}
                <div className="grid grid-cols-1 md:grid-cols-3 min-h-[60vh]">
                    {/* Kolom Kiri: Daftar Kategori */}
                    <div className="md:col-span-1 p-4 md:border-r border-light-gray/50">
                        <div className="flex items-center gap-3 mb-4">
                            <List size={20} className="text-primary"/>
                            <h3 className="text-lg font-bold text-text-title">Daftar Kategori</h3>
                        </div>
                        <motion.button onClick={() => { setFormMode('add'); setSelectedCategory(null); }} whileHover={{ scale: 1.02 }}
                            className="w-full flex items-center gap-2 p-3 text-sm font-bold text-accent bg-accent/10 hover:bg-accent/20 rounded-lg mb-4 text-left">
                            <Plus size={16}/> Tambah Kategori Baru
                        </motion.button>
                        <div className="space-y-2 pr-2 -mr-2 max-h-[45vh] overflow-y-auto">
                            {loading ? <SkeletonList /> : 
                                categories.map(cat => (
                                    <button key={cat.id} onClick={() => handleSelectCategory(cat)}
                                        className={`w-full p-3 rounded-lg text-left transition-colors duration-200 text-sm font-semibold
                                            ${selectedCategory?.id === cat.id ? 'bg-primary text-white shadow' : 'text-text-main hover:bg-primary/10'}`}
                                    >
                                        {cat.nama_kategori}
                                    </button>
                                ))
                            }
                        </div>
                    </div>

                    {/* Kolom Kanan: Panel Form Dinamis */}
                    <div className="md:col-span-2 p-4">
                        <AnimatePresence mode="wait">
                            {formMode === 'idle' && (
                                <motion.div key="idle" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="h-full flex flex-col items-center justify-center text-center text-text-secondary p-8">
                                    <ChevronsRight size={48} className="text-secondary mb-4"/>
                                    <h4 className="font-bold text-text-title">Panel Manajemen</h4>
                                    <p className="mt-1">Pilih kategori di samping untuk mengedit, atau tambah kategori baru.</p>
                                </motion.div>
                            )}
                            {(formMode === 'add' || (formMode === 'edit' && selectedCategory)) && (
                                <FormPanel 
                                    mode={formMode}
                                    category={selectedCategory}
                                    onSave={handleAddCategory}
                                    onUpdate={handleUpdateCategory}
                                    onDelete={handleDeleteCategory}
                                    onCancel={handleCancel}
                                    isLoading={loading}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={handleConfirmDelete} title="Konfirmasi Hapus Kategori" confirmText="Ya, Hapus" type="warning">
                <p>Anda yakin ingin menghapus kategori <strong className="text-text-main">{selectedCategory?.nama_kategori}</strong>?</p>
                <p className="text-sm mt-2">Menghapus kategori tidak akan menghapus produk yang ada di dalamnya.</p>
            </ConfirmationModal>
        </>
    );
};

export default ManajemenKategori;