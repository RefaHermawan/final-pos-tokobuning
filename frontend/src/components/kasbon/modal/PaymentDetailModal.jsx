// src/components/kasbon/modal/PaymentDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../api/axios';
import { useToast } from '../../../hooks/useToast';
import Modal from '../../ui/Modal';
import { Receipt, X, History, Save, Inbox, CheckCircle, LoaderCircle, ArrowUp, ArrowDown } from 'lucide-react';

// Komponen untuk setiap item di riwayat (tidak ada perubahan)
const HistoryItem = ({ item }) => {
    const isMasuk = item.masuk > 0;
    const Icon = isMasuk ? ArrowDown : ArrowUp;
    const colorClass = isMasuk ? "text-error" : "text-success";
    const bgColor = isMasuk ? "bg-error/10" : "bg-success/10";
    const amount = isMasuk ? item.masuk : item.keluar;

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between p-3 bg-background rounded-lg"
        >
            <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${bgColor} ${colorClass}`}>
                    <Icon size={18} />
                </div>
                <div>
                    <p className="font-semibold text-sm text-text-main">{item.keterangan}</p>
                    <p className="text-xs text-text-secondary">
                        {new Date(item.tanggal).toLocaleString('id-ID', {dateStyle: 'medium', timeStyle: 'short'})}
                    </p>
                </div>
            </div>
            <p className={`font-mono font-semibold text-sm ${colorClass}`}>
                Rp {parseFloat(amount).toLocaleString('id-ID')}
            </p>
        </motion.div>
    );
};


const PaymentDetailModal = ({ isOpen, onClose, onSuccess, kasbonItem }) => {
  const [timeline, setTimeline] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [newAmount, setNewAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && kasbonItem) {
      setLoadingHistory(true);
      setTimeline([]);
      setNewAmount('');
      apiClient.get(`/transactions/kasbon-history/?kasbon_id=${kasbonItem.id}`)
        .then(res => {
            if (Array.isArray(res.data)) {
                setTimeline([...res.data].reverse());
            }
        })
        .catch(() => addToast("error", "Gagal memuat riwayat."))
        .finally(() => setLoadingHistory(false));
    }
  }, [isOpen, kasbonItem, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.post('/transactions/pembayaran/', {
        hutang_piutang: kasbonItem.id,
        jumlah_bayar: newAmount,
      });
      const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(newAmount);
      const entityName = kasbonItem.pelanggan_nama || kasbonItem.supplier_name;
      addToast("success", <>Pembayaran <span className="font-bold text-accent">{formattedAmount}</span> untuk <span className="font-bold text-accent">{entityName}</span> berhasil.</>);
      onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Gagal mencatat pembayaran.";
      const fullError = err.response?.data ? JSON.stringify(err.response.data, null, 2) : "Tidak ada detail error.";
      addToast("error", <><span className="font-bold">Gagal:</span> {errorMessage}</>, fullError);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !kasbonItem) return null;

  const total = parseFloat(kasbonItem.total_awal);
  const paid = parseFloat(kasbonItem.total_dibayar);
  const paymentProgress = total > 0 ? (paid / total) * 100 : 0;

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface backdrop-blur-xl border border-light-gray/50 rounded-2xl shadow-lg w-full max-w-lg flex flex-col"
        >
            <div className="flex items-center justify-between p-4 border-b border-light-gray/50">
                <div className="flex items-center gap-3">
                    <Receipt size={18} className="text-primary"/>
                    <div>
                        <h2 className="text-base font-bold text-text-title">Detail {kasbonItem.tipe === 'PIUTANG' ? 'Piutang' : 'Hutang'}</h2>
                        <p className="text-xs text-text-secondary">Untuk: <span className="font-semibold text-accent">{kasbonItem.pelanggan_nama || kasbonItem.supplier_name}</span></p>
                    </div>
                </div>
            </div>
            
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
                    {/* PERBAIKAN: Gaya kartu ringkasan disempurnakan */}
                    <motion.div variants={itemVariants} className="bg-background border border-light-gray/50 rounded-xl p-4 space-y-3 shadow-lg">
                        <div>
                            <div className="flex justify-between items-baseline text-xs font-semibold text-text-secondary mb-1">
                                <span>Telah Dibayar</span>
                                <span>{paymentProgress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-light-gray rounded-full h-2">
                                <motion.div 
                                    className="bg-gradient-to-r from-success to-green-400 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${paymentProgress}%` }}
                                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/10">
                            <div><p className="text-xs text-text-secondary">Total</p><p className="text-sm font-bold text-text-title font-mono">Rp {total.toLocaleString('id-ID')}</p></div>
                            <div><p className="text-xs text-text-secondary">Dibayar</p><p className="text-sm font-bold text-success font-mono">Rp {paid.toLocaleString('id-ID')}</p></div>
                            <div><p className="text-xs text-text-secondary">Sisa</p><p className="text-sm font-bold text-error font-mono">Rp {kasbonItem.sisa_tagihan.toLocaleString('id-ID')}</p></div>
                        </div>
                    </motion.div>

                    <AnimatePresence>
                    {!kasbonItem.lunas && (
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
                            <h3 className="text-sm font-bold text-text-title mb-2">Tambah Pembayaran Baru</h3>
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-grow">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-md text-text-secondary">Rp</span>
                                    <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Jumlah Bayar" required 
                                        className="w-full pl-10 pr-4 py-2 bg-background border-2 border-light-gray rounded-lg text-text-title focus:ring-2 focus:ring-accent font-mono font-bold text-lg"/>
                                </div>
                                <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60">
                                    <Save size={16} />{isSaving ? "Membayar..." : "Bayar"}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                    </AnimatePresence>
                    
                    <motion.div variants={itemVariants}>
                        <h3 className="text-sm font-bold text-text-title mb-2">Riwayat Pembayaran</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border-t border-light-gray/50 pt-3">
                        {loadingHistory ? (
                            <div className="flex justify-center py-4"><LoaderCircle className="animate-spin text-primary"/></div>
                        ) : timeline.length > 0 ? (
                            <AnimatePresence>
                                {timeline.map(item => <HistoryItem key={item.id} item={item} />)}
                            </AnimatePresence>
                        ) : (
                            <div className="text-center text-xs text-text-secondary py-4"><Inbox size={20} className="mx-auto mb-1 text-secondary"/><p>Belum ada riwayat pembayaran.</p></div>
                        )}
                    </div>
                    </motion.div>
                </motion.div>
            </div>

            <div className="flex justify-end p-4 border-t border-light-gray/50">
                <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} className="px-4 py-2 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">Tutup</motion.button>
            </div>
        </motion.div>
    </Modal>
  );
};
export default PaymentDetailModal;