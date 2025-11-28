import React from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Filter as FilterIcon, RotateCcw, FileText, DollarSign, Hash, CheckCircle, Clock, XCircle, Calendar, Eye, Inbox, User } from 'lucide-react';

// Komponen untuk state saat loading atau kosong
const StatusDisplay = ({ isLoading, isEmpty, forMobile = false }) => {
    if (!isLoading && !isEmpty) return null;

    const content = isLoading ? (
        <>
            <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <DollarSign size={32} className="text-primary" />
            </motion.div>
            <span className="mt-3 text-sm">Memuat data transaksi...</span>
        </>
    ) : (
        <>
            <Inbox size={48} className="text-primary/50" />
            <h3 className="font-bold text-lg text-text-title mt-4">Tidak Ada Transaksi</h3>
            <p className="text-sm">Tidak ada data transaksi yang ditemukan pada rentang tanggal ini.</p>
        </>
    );

    if (forMobile) {
        return <div className="w-full col-span-full flex flex-col items-center justify-center gap-2 p-16 text-text-secondary">{content}</div>;
    }

    return <tr><td colSpan="7" className="text-center p-16"><div className="flex flex-col items-center justify-center gap-2 text-text-secondary">{content}</div></td></tr>;
};

export default StatusDisplay;