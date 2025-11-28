// src/components/stok/StockHistoryTable.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { LoaderCircle, History, ArrowUp, ArrowDown, User, Edit, ArrowRight, Search, Filter as FilterIcon } from 'lucide-react';

// Badge untuk Jenis Aksi, dengan gaya yang lebih kaya
const ActionBadge = ({ action }) => {
    let style = "bg-light-gray/30 text-primary"; // Default untuk Opname
    let Icon = Edit;

    if (action.includes("Masuk")) {
        style = "bg-success/10 text-success";
        Icon = ArrowRight; // Panah masuk
    } else if (action.includes("Keluar")) {
        style = "bg-error/10 text-error";
        Icon = ArrowLeft; // Panah keluar, dari ikon yang sudah ada
    }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style}`}>
            <Icon size={14} />
            {action}
        </span>
    );
};

// Komponen untuk state saat loading atau kosong
const StatusDisplay = ({ isLoading, isEmpty }) => {
    if (!isLoading && !isEmpty) return null;
    const content = isLoading ? (
        <>
            <LoaderCircle size={32} className="animate-spin text-primary" />
            <span>Memuat riwayat stok...</span>
        </>
    ) : (
        <>
            <History size={48} className="text-secondary" />
            <h3 className="font-bold text-lg text-text-title">Belum Ada Riwayat</h3>
            <p className="text-sm">Semua pergerakan stok akan tercatat di sini.</p>
        </>
    );

    return (
        <tr>
            <td colSpan="6" className="text-center p-16">
                <div className="flex flex-col items-center justify-center gap-3 text-text-secondary">
                    {content}
                </div>
            </td>
        </tr>
    );
};

const StockHistoryTable = ({ history, loading, onSearchChange, onReasonChange }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
    
  return (
    <div className="bg-surface backdrop-blur-sm border border-light-gray/50 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-light-gray/50 flex items-center gap-3">
        <History size={18} className="text-primary"/>
        <h3 className="font-bold text-text-title">Riwayat Stok Terbaru</h3>
      </div>
          {/* Panel Filter Baru di Dalam Komponen */}
      <div className="p-3 border-b border-light-gray/50 flex flex-wrap items-center gap-3">
          <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"/>
              <input 
                  type="text" 
                  placeholder="Cari produk di riwayat..." 
                  onChange={onSearchChange}
                  className="input-style-modern w-full pl-10 bg-background border-light-gray/50 focus:border-accent focus:ring-accent"
              />
          </div>
          <div className="relative">
              <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"/>
              <select 
                  onChange={onReasonChange}
                  className="input-style-modern w-full pl-10"
              >
                  <option value="">Semua Aksi</option>
                  <option value="PEMBELIAN">Pembelian</option>
                  <option value="RUSAK">Barang Rusak</option>
                  <option value="HILANG">Barang Hilang</option>
                  <option value="OPNAME">Stok Opname</option>
              </select>
          </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left">
          <thead className="bg-secondary/10">
            <tr>
              <th className="p-4 text-sm font-semibold text-text-title tracking-wider">TANGGAL & WAKTU</th>
              <th className="p-4 text-sm font-semibold text-text-title tracking-wider">PRODUK</th>
              <th className="p-4 text-sm font-semibold text-text-title tracking-wider">JENIS AKSI</th>
              <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-center">PERUBAHAN</th>
              <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-center">STOK AKHIR</th>
              <th className="p-4 text-sm font-semibold text-text-title tracking-wider">PENGGUNA</th>
            </tr>
          </thead>
          <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
            {loading || history.length === 0 ? (
                <StatusDisplay isLoading={loading} isEmpty={history.length === 0} />
            ) : (
              history.map(item => (
                <motion.tr
                  key={item.id}
                  variants={itemVariants}
                  // EFEK 1: Zebra Stripping & Hover yang lebih baik
                  className="border-b border-light-gray/50 last:border-b-0 even:bg-light-gray/25 odd:bg-transparent hover:!bg-primary/10 transition-colors duration-200"
                >
                  {/* EFEK 2: Hierarki Tipografi diterapkan di setiap cell */}
                  <td className="p-4">
                    <p className="font-semibold text-sm text-text-main">{new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="text-xs text-text-secondary">{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-base text-text-title">{item.nama_produk_induk} {item.product_name}</p>
                    {/* <p className="text-md font-semibold text-text-secondary">{item.product_name}</p> */}
                  </td>                  
                  <td className="p-4"><ActionBadge action={item.reason_display} /></td>
                  <td className={`p-4 text-left font-mono font-medium text-base ${item.quantity_change > 0 ? 'text-success' : 'text-error'}`}>
                    {item.quantity_change > 0 ? `+${parseFloat(item.quantity_change).toFixed(2)}` : parseFloat(item.quantity_change).toFixed(2)}
                  </td>
                  <td className="p-4 text-left font-mono font-medium text-base text-text-title">{parseFloat(item.stock_after).toFixed(2)}<span className="ml-1 text-sm font-normal text-text-secondary">{item.satuan}</span></td>
                  <td className="p-4 text-sm text-text-secondary font-semibold">
                    <div className="flex items-center gap-2 text-primary bg-light-gray/30 px-2 py-1 rounded-full w-max">
                      <User size={14} />
                      <span>{item.user_name}</span>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};

export default StockHistoryTable;