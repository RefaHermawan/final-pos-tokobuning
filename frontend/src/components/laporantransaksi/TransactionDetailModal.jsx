// src/components/laporantransaksi/TransactionDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal'; // Menggunakan komponen Modal dasar
import { Receipt, X, User, Calendar, CheckCircle, Clock, XCircle, CreditCard, Printer } from 'lucide-react';

// --- Helper Components ---

// Badge Status yang bisa diimpor dari file terpisah
const StatusBadge = ({ status }) => {
    let style = "bg-light-gray/50 text-text-secondary";
    let Icon = Clock;
    switch (status?.toUpperCase()) {
        case 'LUNAS': style = "bg-success/10 text-success"; Icon = CheckCircle; break;
        case 'PENDING': style = "bg-yellow-500/10 text-yellow-500"; Icon = Clock; break;
        case 'BATAL': style = "bg-error/10 text-error"; Icon = XCircle; break;
    }
    return <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${style}`}><Icon size={14} /> {status}</span>;
};

// Skeleton Loader untuk detail transaksi
const DetailSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-light-gray/50 rounded-md"></div>
            <div className="h-10 bg-light-gray/50 rounded-md"></div>
        </div>
        <div className="border-t border-light-gray/30 pt-4 space-y-3">
            <div className="h-8 bg-light-gray/50 rounded-md"></div>
            <div className="h-8 bg-light-gray/50 rounded-md w-3/4"></div>
        </div>
        <div className="border-t border-light-gray/30 pt-4 space-y-2">
            <div className="h-5 bg-light-gray/50 rounded-md w-1/2 ml-auto"></div>
            <div className="h-5 bg-light-gray/50 rounded-md w-1/2 ml-auto"></div>
            <div className="h-8 bg-light-gray/50 rounded-md w-2/3 ml-auto mt-2"></div>
        </div>
    </div>
);

// --- Komponen Utama ---

const TransactionDetailModal = ({ isOpen, onClose, transactionId }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && transactionId) {
      setLoading(true);
      apiClient.get(`/transactions/transaksi/${transactionId}/`)
        .then(res => setDetails(res.data))
        .catch(() => addToast("error", "Gagal memuat detail transaksi."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, transactionId, addToast]);


return (
    // PERUBAHAN UKURAN: size diubah ke 'md' untuk modal yang lebih kecil
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface backdrop-blur-xl border border-light-gray/50 rounded-2xl shadow-lg w-full flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-light-gray/30">
            <div className="flex items-center gap-3">
                <Receipt size={18} className="text-primary"/>
                <div>
                    <h2 className="text-base font-bold text-text-title">Detail Transaksi</h2>
                    <p className="text-xs font-mono text-text-secondary">#{details?.nomor_transaksi}</p>
                </div>
            </div>
        </div>
        
        {/* PERUBAHAN UKURAN: Padding (p-5) dikurangi */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
            {loading ? <DetailSkeleton /> : details && (
                <div className="space-y-4">
                    {/* Info Utama */}
                    <div className="grid grid-cols-2 gap-4 text-xs ">
                        <div className="flex items-center gap-2"><User size={14} className="text-primary"/><div><p className="text-text-secondary">Kasir</p><p className="font-semibold text-text-main">{details.kasir.username}</p></div></div>
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-primary"/><div><p className="text-text-secondary">Tanggal</p><p className="font-semibold text-text-main">{new Date(details.created_at).toLocaleString('id-ID', {dateStyle:'medium', timeStyle:'short'})}</p></div></div>
                        <div className="flex items-center gap-2"><CreditCard size={14} className="text-primary"/><div><p className="text-text-secondary">Metode</p><p className="font-semibold text-text-main">{details.metode_pembayaran}</p></div></div>
                        <div className="flex items-center gap-2"><div className="w-4"><StatusBadge status={details.status}/></div></div>
                    </div>

                    {/* Daftar Item */}
                    <div className="border-y border-light-gray/30 py-3">
                        <h4 className="font-bold text-text-title text-sm mb-2">Rincian Item</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 text-sm">
                            {details.detail_items.map(item => (
                                <div key={item.id} className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-text-main">{item.varian_produk_terjual.nama_produk_induk} {(item.varian_produk_terjual.nama_varian)}</p>
                                        <p className="text-xs text-text-secondary">{parseFloat(item.jumlah)} x @ Rp {parseFloat(item.harga_saat_transaksi).toLocaleString('id-ID')}</p>
                                    </div>
                                    <p className="font-semibold font-mono text-text-main ml-4">Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Rincian Total */}
                    <div className="space-y-1 text-xs font-medium">
                        <div className="flex justify-between text-text-main"><p>Subtotal</p><p className="font-mono">Rp {parseFloat(details.total_harga).toLocaleString('id-ID')}</p></div>
                        <div className="flex justify-between text-text-main"><p>Diskon</p><p className="font-mono">- Rp {parseFloat(details.diskon_nominal).toLocaleString('id-ID')}</p></div>
                        {/* PERUBAHAN UKURAN: Tipografi Total Akhir disesuaikan */}
                        <div className="flex justify-between text-base font-bold text-accent pt-2 border-t border-light-gray/30 mt-2"><p>Total Akhir</p><p className="font-mono">Rp {parseFloat(details.total_setelah_diskon).toLocaleString('id-ID')}</p></div>
                        <div className="flex justify-between text-text-main pt-2"><p>Bayar</p><p className="font-mono">Rp {parseFloat(details.jumlah_bayar).toLocaleString('id-ID')}</p></div>
                        <div className="flex justify-between text-secondary"><p>Kembalian</p><p className="font-mono">Rp {parseFloat(details.kembalian).toLocaleString('id-ID')}</p></div>
                    </div>
                </div>
            )}
        </div>
        
        <div className="flex justify-end items-center gap-3 p-4 border-t border-light-gray/30">
            <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} className="px-4 py-2 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">Tutup</motion.button>

        </div>
      </motion.div>
    </Modal>
  );
};

export default TransactionDetailModal;