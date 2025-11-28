// src/components/dashboard/RecentActivityWidget.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, PackagePlus, PackageMinus, Wrench, History, Inbox, Package } from 'lucide-react';

// --- Helper Components & Functions ---

// Fungsi helper yang diperbarui untuk mengembalikan Icon dan style
const getActivityStyle = (type) => {
    switch(type) {
        case 'TRANSAKSI':
            return { Icon: ShoppingCart, className: "bg-secondary/10 text-primary" };
        case 'PEMBELIAN':
            return { Icon: PackagePlus, className: "bg-success/10 text-success" };
        case 'RUSAK':
        case 'HILANG':
            return { Icon: PackageMinus, className: "bg-error/10 text-error" };
        case 'OPNAME':
            return { Icon: Wrench, className: "bg-indigo-500/10 text-indigo-500" };
        default:
            return { Icon: Package, className: "bg-light-gray text-text-secondary" };
    }
};

const SkeletonItem = () => (
    <div className="relative flex items-start gap-4 animate-pulse">
        <div className="absolute top-1 left-[5px] w-0.5 h-full bg-light-gray/50"></div>
        <div className="flex-shrink-0 w-4 h-4 bg-light-gray/50 rounded-full z-10"></div>
        <div className="flex-grow space-y-2">
            <div className="h-4 bg-light-gray/50 rounded w-3/4"></div>
            <div className="h-3 bg-light-gray/50 rounded w-1/2"></div>
        </div>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center py-8 text-text-secondary">
        <Inbox size={32} className="mb-2 text-secondary" />
        <p className="text-sm font-semibold">Belum ada aktivitas terbaru.</p>
    </div>
);

// --- Komponen Utama ---

const RecentActivityWidget = ({ activities, loading, className }) => {
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };

    return (
        <div className={`bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg max-h-100 flex flex-col ${className}`}>
            <div className="p-4 flex items-center gap-3 border-b border-light-gray/50">
                <History className="text-primary" size={20} />
                <h3 className="text-lg font-bold text-text-title">Aktivitas Terbaru</h3>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-grow">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => <SkeletonItem key={index} />)
                ) : activities.length > 0 ? (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative">
                        {activities.map((act, index) => {
                            const { Icon, className: style } = getActivityStyle(act.type);
                            return (
                                <motion.div key={act.id} variants={itemVariants} className="relative flex items-start gap-4 pb-4">
                                    {/* Garis Linimasa Vertikal */}
                                    {index < activities.length - 1 && (
                                        <div className="absolute top-3 left-[15px] w-0.5 h-full bg-light-gray/50"></div>
                                    )}
                                    {/* Titik Linimasa dengan Ikon */}
                                    <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full z-10 ${style}`}>
                                        <Icon size={16} />
                                    </div>
                                    {/* Konten Aktivitas */}
                                    <div className="flex-grow pt-1">
                                        <p className="text-sm font-semibold text-text-main leading-tight" dangerouslySetInnerHTML={{ __html: act.description }} />
                                        <p className="text-xs text-text-secondary mt-1">
                                            {new Date(act.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            {' oleh '}{act.user}
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
};

export default RecentActivityWidget;