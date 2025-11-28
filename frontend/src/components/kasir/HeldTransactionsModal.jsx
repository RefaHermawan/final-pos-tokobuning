// src/components/kasir/modal/HeldTransactionsModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import { ListChecks, Trash2, ChevronDown, Inbox, LoaderCircle, Check } from 'lucide-react';

// --- Helper Components ---
const HeldTransactionItem = ({ trx, onResume, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const totalItems = trx.detail_items.reduce((sum, item) => sum + parseFloat(item.jumlah), 0);

    return (
        <motion.div 
            layout
            initial={{ borderRadius: 12 }}
            className="bg-background border border-light-gray/50 rounded-xl overflow-hidden"
        >
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center p-3 text-left hover:bg-primary/5 transition-colors">
                <div className="flex-grow overflow-hidden">
                    <p className="font-bold text-text-title truncate">{trx.notes || `Transaksi #${trx.nomor_transaksi}`}</p>
                    <p className="text-xs text-text-secondary">
                        {totalItems} item • Rp {parseFloat(trx.total_setelah_diskon).toLocaleString('id-ID')}
                    </p>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="ml-4 flex-shrink-0">
                    <ChevronDown size={20} className="text-text-secondary"/>
                </motion.div>
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ ease: "easeInOut", duration: 0.3 }}
                    >
                        <div className="border-t border-light-gray/30 p-3 space-y-2">
                            {trx.detail_items.map(item => (
                                <div key={item.id} className="flex justify-between text-xs">
                                    <span className="text-accent truncate pr-2">
                                       {item.varian_produk_terjual.nama_produk_induk} {item.varian_produk_terjual.nama_varian} <span className="font-semibold">x{parseFloat(item.jumlah)}</span>
                                    </span>
                                    <span className="font-mono font-semibold text-accent">
                                        Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-light-gray/30 flex justify-end gap-3">
                            <motion.button onClick={() => onDelete(trx)} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}
                                className="p-2 text-sm font-bold text-error bg-error/10 hover:bg-error/20 rounded-lg">
                                <Trash2 size={16} />
                            </motion.button>
                            <motion.button onClick={() => onResume(trx)} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-accent rounded-lg shadow-md shadow-accent/30">
                                <Check size={16}/> Lanjutkan Transaksi
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const SkeletonItem = () => (
    <div className="w-full h-14 bg-background/50 rounded-lg animate-pulse"></div>
);

const HeldTransactionsModal = ({ isOpen, onClose, onResume, onDelete }) => {
    const [heldTransactions, setHeldTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // PERBAIKAN: Menghapus batasan 'page_size' agar mengambil semua data
            apiClient.get('/transactions/transaksi/?status=Ditahan')
                .then(res => setHeldTransactions(res.data.results || res.data))
                .catch(() => addToast("error", "Gagal memuat transaksi ditahan."))
                .finally(() => setLoading(false));
        }
    }, [isOpen, onResume, addToast]);

    return (
        // PERBAIKAN: Menggunakan komponen Modal dasar yang sudah benar
        <Modal isOpen={isOpen} onClose={onClose} title="Transaksi Ditahan">
            {/* PERBAIKAN: Layout diubah menjadi flexbox vertikal
              agar bisa mengatur area scroll dengan benar.
            */}
            <div className="flex flex-col h-[60vh]">
                <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({length: 3}).map((_, i) => <SkeletonItem key={i}/>)}
                        </div>
                    ) : heldTransactions.length > 0 ? (
                        <AnimatePresence>
                            {heldTransactions.map(trx => (
                            <HeldTransactionItem 
                                    key={trx.id} 
                                    trx={trx} 
                                    onResume={onResume} 
                                    onDelete={onDelete} 
                                />
                        ))}
                        </AnimatePresence>
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-text-secondary py-12">
                            <Inbox size={32} className="mx-auto mb-2"/>
                            <p className="font-semibold">Tidak ada transaksi yang ditahan.</p>
                        </div>
                     )}
                </div>
            </div>
        </Modal>
    );
};
export default HeldTransactionsModal;