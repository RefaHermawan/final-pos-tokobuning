// src/components/dashboard/BestSellersWidget.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Inbox } from 'lucide-react';

// --- Helper Components ---

// Placeholder saat data dimuat
const SkeletonItem = () => (
    <div className="flex items-center gap-3 animate-pulse">
        <div className="w-6 h-6 bg-light-gray/50 rounded-md"></div>
        <div className="flex-grow space-y-2">
            <div className="h-4 bg-light-gray/50 rounded w-3/4"></div>
            <div className="h-2 bg-light-gray/50 rounded w-full"></div>
        </div>
        <div className="h-6 w-12 bg-light-gray/50 rounded-md"></div>
    </div>
);

// Tampilan saat tidak ada data
const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
        <Inbox size={32} className="mb-2 text-secondary" />
        <p className="text-sm font-semibold">Belum ada data penjualan.</p>
    </div>
);

// --- Komponen Utama ---

const BestSellersWidget = ({ items, loading, className }) => {
    // Tentukan nilai penjualan tertinggi untuk kalkulasi bar progres
    const maxSold = items.length > 0 ? items[0].total_sold : 0;

    const getRankIndicator = (index) => {
        const rank = index + 1;
        if (rank === 1) return <Award className="text-yellow-500" size={18} />;
        if (rank === 2) return <Award className="text-gray-400" size={18} />;
        if (rank === 3) return <Award className="text-yellow-700" size={18} />;
        return <span className="font-bold text-text-secondary text-sm w-5 text-center">{rank}.</span>;
    };

    return (
        <div className={`bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg max-h-100 flex flex-col ${className}`}>
            <div className="p-4 flex items-center gap-3 border-b border-light-gray/50">
                <TrendingUp className="text-primary" size={20} />
                <h3 className="text-lg font-bold text-text-title">Produk Terlaris</h3>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-grow">
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => <SkeletonItem key={index} />)
                ) : items.length > 0 ? (
                    items.map((item, index) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-2"
                        >
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    {getRankIndicator(index)}
                                    <div className="truncate">
                                        <p className="font-semibold text-text-main truncate" title={`${item.nama_produk_induk} (${item.nama_varian})`}>
                                            {item.nama_produk_induk}
                                        </p>
                                        <p className="text-sm text-text-secondary">{item.nama_varian}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-accent flex-shrink-0">
                                    {/* PERBAIKAN: Tampilkan jumlah terjual */}
                                    {parseFloat(item.total_sold).toFixed(0)} Terjual
                                </span>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
};

export default BestSellersWidget;