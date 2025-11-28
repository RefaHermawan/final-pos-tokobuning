// src/components/stok/LowStockReport.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  RotateCcw,
  Package,
  Truck,
  Inbox,
  TrendingDown,
  Calendar,
  Eye
} from "lucide-react";
import apiClient from "../../api/axios";
import { useToast } from "../../hooks/useToast";
import Pagination from "../ui/Pagination";
import StatusDisplay from "../stok/ui/StatusDisplay"; // Pastikan path ini benar

// Komponen bar progres stok (tidak ada perubahan)
const StockGauge = ({ stock, min }) => {
  const stockLevel = parseFloat(stock);
  const minLevel = parseFloat(min);
  const percentage = minLevel > 0 ? Math.min(stockLevel / minLevel, 1) : 0; // nilai antara 0 dan 1

  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  let color = "var(--color-error)";
  if (percentage < 0.3) {
    color = "var(--color-error)";
  } else if (percentage < 0.7) {
    color = "var(--color-accent)";
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Latar belakang gauge */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-light-gray)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Indikator progres gauge */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-extrabold text-2xl text-text-title"
          style={{ color }}
        >
          {stockLevel.toFixed(0)}
        </span>
      </div>
    </div>
  );
};

const LowStockReport = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 6;
  const { addToast } = useToast();

  const fetchData = useCallback((page) => {
    setLoading(true);
    apiClient
      .get(
        `/products/laporan/stok-rendah/?page=${page}&page_size=${ITEMS_PER_PAGE}`
      )
      .then((res) => {
        setLowStockItems(res.data.results);
        setTotalItems(res.data.count);
      })
      .catch(() => addToast("error", "Gagal memuat laporan stok rendah."))
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const handleRefresh = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchData(1);
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 20 } } };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-error/10 p-3 rounded-2xl"><AlertTriangle size={28} className="text-error" /></div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-title">Laporan Stok Rendah</h1>
                        <p className="text-sm text-text-secondary mt-1">Produk yang memerlukan pengisian ulang segera.</p>
                    </div>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRefresh} disabled={loading} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-light-gray/50 border border-light-gray/50 rounded-lg font-semibold text-text-secondary hover:bg-light-gray text-sm transition-colors disabled:opacity-50">
                    <span className={loading ? "animate-spin" : ""}><RotateCcw size={15} /></span>
                    <span>{loading ? 'Memuat...' : 'Refresh'}</span>
                </motion.button>
            </motion.div>

            <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading || lowStockItems.length === 0 ? (
                        <div className="sm:col-span-2 lg:col-span-3">
                            <StatusDisplay forMobile={true} isLoading={loading} isEmpty={lowStockItems.length === 0} />
                        </div>
                    ) : (
                        lowStockItems.map(item => (
                            <motion.div 
                                key={item.id} 
                                variants={itemVariants} 
                                whileHover={{ scale: 1.0 }}
                                className="bg-background backdrop-blur-md border border-light-gray rounded-2xl shadow-lg flex flex-col hover:shadow-primary/20 transition-shadow duration-300"
                            >
                                {/* 1. Header Kartu yang Jelas */}
                                <div className="p-4 flex items-center gap-3 border-b border-light-gray/50">
                                    <div className="p-2 bg-error/10 rounded-lg flex-shrink-0">
                                        <Package size={20} className="text-error" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-text-title truncate">{item.nama_produk_induk} {item.nama_varian}</p>
                                        {/* <p className="text-sm text-text-secondary truncate">{item.nama_varian}</p> */}
                                    </div>
                                </div>
                                
                                {/* 2. Body Kartu: Gauge & Daftar Rincian */}
                                <div className="p-4 flex-grow grid grid-cols-2 gap-4 items-center bg-surface/50 rounded-b-xl">
                                    <div className="col-span-1 flex justify-center">
                                        <StockGauge stock={item.stok} min={item.peringatan_stok_rendah} />
                                    </div>
                                    <div className="col-span-1 space-y-3 text-sm">
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <AlertTriangle size={14} className="flex-shrink-0"/>
                                            <div>Batas Min: <span className="font-bold text-text-main">{parseFloat(item.peringatan_stok_rendah).toFixed(0)}</span></div>
                                        </div>
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <Calendar size={14} className="flex-shrink-0"/>
                                            <div>Terakhir Beli: <span className="font-bold text-text-main">{item.last_purchase_date ? new Date(item.last_purchase_date).toLocaleDateString('id-ID') : '-'}</span></div>
                                        </div>
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <Truck size={14} className="flex-shrink-0"/>
                                            <div>Pemasok: <span className="font-bold text-text-main truncate">{item.pemasok_nama || '-'}</span></div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 3. Footer Kartu dengan Aksi Kontekstual */}
                                {/* <div className="p-3 bg-background/50 border-t border-light-gray/30">
                                    <motion.button 
                                      whileHover={{scale: 1.05}}
                                      className="w-full flex items-center justify-center gap-2 py-1.5 text-sm font-bold text-primary hover:bg-primary/10 rounded-md transition-colors"
                                      // onClick={() => navigateToProductDetail(item.id)}
                                    >
                                        <Eye size={16}/> Lihat Detail Produk
                                    </motion.button>
                                </div> */}
                            </motion.div>
                        ))
                    )}
                </div>

                {totalPages > 1 && !loading && (
                    <div className="pt-4 mt-2 flex justify-center">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default LowStockReport;