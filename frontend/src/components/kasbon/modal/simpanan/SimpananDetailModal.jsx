// src/components/kasbon/modal/SimpananDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../../api/axios';
import { useToast } from '../../../../hooks/useToast';
import Modal from '../../../ui/Modal'; // Pastikan path ini benar
import { Wallet, X, History, ArrowUpCircle, ArrowDownCircle, Save, Inbox } from 'lucide-react';

// --- Helper Components ---
const HistoryItem = ({ item }) => {
    const isDeposit = item.tipe === 'MASUK';
    const style = isDeposit ? 'bg-success/10 text-success' : 'bg-error/10 text-error';
    const Icon = isDeposit ? ArrowUpCircle : ArrowDownCircle;
    const sign = isDeposit ? '+' : '-';

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
        >
            <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${style}`}>
                    <Icon size={18} />
                </div>
                <div>
                    <p className="font-semibold text-sm text-text-main">{item.keterangan}</p>
                    <p className="text-xs text-text-secondary">{new Date(item.created_at).toLocaleString('id-ID', {dateStyle: 'medium', timeStyle: 'short'})}</p>
                </div>
            </div>
            <p className={`font-mono font-semibold text-sm ${isDeposit ? 'text-success' : 'text-error'}`}>
                {sign} Rp {parseFloat(item.jumlah).toLocaleString('id-ID')}
            </p>
        </motion.div>
    );
};

const SimpananDetailModal = ({ isOpen, onClose, onSuccess, pelanggan }) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && pelanggan) {
      setLoadingHistory(true);
      apiClient.get(`/transactions/riwayat-simpanan/?pelanggan=${pelanggan.id}`)
        .then(res => setHistory(res.data.results || res.data))
        .catch(() => addToast("error", "Gagal memuat riwayat."))
        .finally(() => setLoadingHistory(false));
      setWithdrawAmount('');
    }
  }, [isOpen, pelanggan, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.post('/transactions/penarikan-simpanan/', {
        pelanggan_id: pelanggan.id,
        jumlah: withdrawAmount,
      });
      const formattedJumlah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(withdrawAmount);
      addToast("success", <>Penarikan <span className="font-bold text-accent">{formattedJumlah}</span> untuk <span className="font-bold text-accent">{pelanggan.nama_pelanggan}</span> berhasil.</>);
      onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Gagal mencatat penarikan.";
      const fullError = err.response?.data ? JSON.stringify(err.response.data, null, 2) : "Tidak ada detail error.";
      addToast("error", <><span className="font-bold">Gagal:</span> {errorMessage}</>, fullError);
    } finally {
      setIsSaving(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' } } };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface backdrop-blur-xl border border-light-gray/50 rounded-2xl shadow-lg w-full flex flex-col"
        >
            {/* PERBAIKAN 1: Header Modal dengan Info Saldo Terintegrasi */}
            <div className="flex items-center justify-between p-4 border-b border-light-gray/50">
                <div className="flex items-center gap-3">
                    <Wallet size={20} className="text-primary"/>
                    <div>
                        <h2 className="text-lg font-bold text-text-title">Detail Simpanan</h2>
                        <p className="text-xs text-text-secondary">Pelanggan: <span className="font-semibold text-accent">{pelanggan?.nama_pelanggan}</span></p>
                    </div>
                </div>
                
                {/* Ringkasan Saldo yang diperkecil */}
                <div className="text-right">
                    <p className="text-xs font-semibold text-text-secondary">Saldo Saat Ini</p>
                    <p className="text-xl font-bold text-accent font-mono">
                        Rp {parseFloat(pelanggan?.saldo_simpanan || 0).toLocaleString('id-ID')}
                    </p>
                </div>
            </div>
            
            {/* Konten Utama */}
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
                    
                    {/* PERBAIKAN 2: Kartu Ringkasan Saldo yang besar dihapus dari sini */}

                    {/* Form Tarik Tunai */}
                    <AnimatePresence>
                    {pelanggan?.saldo_simpanan > 0 && (
                        <motion.form variants={itemVariants} initial="hidden" animate="visible" exit="hidden" onSubmit={handleSubmit}>
                             <h3 className="text-base font-bold text-text-title mb-2">Form Tarik Tunai</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-grow">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-lg text-text-secondary">Rp</span>
                                    <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0" required 
                                        className="w-full pl-12 pr-4 py-2 bg-background border-2 border-light-gray rounded-lg text-text-title focus:ring-2 focus:ring-accent font-mono font-bold text-lg"/>
                                </div>
                                <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60">
                                    <Save size={16} />{isSaving ? "Memproses..." : "Tarik Tunai"}
                                </motion.button>
                            </div>
                        </motion.form>
                    )}
                    </AnimatePresence>
                    
                    {/* 3. Riwayat Transaksi Gaya "Feed" */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-base font-bold text-text-title mb-2">Riwayat Transaksi</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border-t border-light-gray/30 pt-3">
                            {loadingHistory ? <p className="text-center text-sm text-text-secondary">Memuat riwayat...</p> : 
                            history.length > 0 ? (
                                <AnimatePresence>
                                    {history.map(item => <HistoryItem key={item.id} item={item} />)}
                                </AnimatePresence>
                            ) : (
                                <div className="text-center text-sm text-text-secondary py-6">
                                    <Inbox size={24} className="mx-auto mb-2 text-secondary"/>
                                    <p>Belum ada riwayat transaksi.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <div className="flex justify-end p-4 border-t border-light-gray/30">
                <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">Tutup</motion.button>
            </div>
        </motion.div>
    </Modal>
  );
};
export default SimpananDetailModal;