// src/components/kasir/modal/HoldNoteForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, FileText, Hand } from 'lucide-react';
import { toast } from 'react-toastify';

// Ganti nama menjadi HoldNoteForm
const HoldNoteForm = ({ isOpen, onClose, onSubmit }) => {
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setNotes('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        // onSubmit di sini akan memanggil handleConfirmHold dari Kasir.jsx
        // Kita tambahkan sedikit delay agar user melihat status 'Menyimpan...'
        setTimeout(() => {
            onSubmit(notes);
            setIsSaving(false);
        }, 500);
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' } } };

    return (
        // Komponen ini sekarang HANYA me-render form-nya saja
        // Modal wrapper akan ada di komponen induk (Kasir.jsx)
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className='min-w-md'>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Hand size={20} className="text-primary"/>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-text-title">Tahan Transaksi</h2>
                    <p className="text-xs text-text-secondary">Beri nama agar mudah ditemukan lagi.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <motion.div variants={itemVariants}>
                    <label className="text-sm font-semibold text-text-main mb-2 block">
                        Nama / Catatan <span className="font-normal text-text-secondary">(Opsional)</span>
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"/>
                        <input 
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-secondary/10 border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                            placeholder="Contoh: Ibu Sri"
                            autoFocus
                        />
                    </div>
                </motion.div>
                <div className="flex justify-end items-center gap-4 pt-6 mt-4 border-t border-light-gray/30">
                    <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/70 hover:bg-light-gray rounded-lg">
                        Batal
                    </motion.button>
                    <motion.button type="submit" disabled={isSaving} 
                        whileHover={{ scale: 1.05, y: -2 }} 
                        whileTap={{ scale: 0.98, y: 0 }}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-md shadow-accent/30 disabled:opacity-60"
                    >
                        <Save size={16} />{isSaving ? "Menyimpan..." : "Tahan Transaksi"}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};

export default HoldNoteForm;