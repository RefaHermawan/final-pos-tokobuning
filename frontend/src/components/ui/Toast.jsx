import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const toastVariants = {
    initial: { opacity: 0, y: -50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 200 } },
    exit: { opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.2 } },
};

const Toast = ({ id, type, message, fullMessageText, onClose }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-success flex-shrink-0" size={22} />;
            case 'error': return <XCircle className="text-error flex-shrink-0" size={22} />;
            case 'info': return <Info className="text-primary flex-shrink-0" size={22} />;
            case 'warning': return <AlertTriangle className="text-yellow-500 flex-shrink-0" size={22} />;
            default: return null;
        }
    };

    const getStyle = (type) => {
        switch (type) {
            case 'success': return 'bg-gradient-to-r from-background to-background border-success/30 shadow-success/20';
            case 'error': return 'bg-gradient-to-r from-background to-background border-error/30 shadow-error/20';
            case 'info': return 'bg-gradient-to-r from-background to-background border-primary/30 shadow-primary/20';
            case 'warning': return 'bg-gradient-to-r from-background to-background border-yellow-500/30 shadow-yellow-500/20';
            default: return 'border-light-gray';
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const tooltipText = fullMessageText || (typeof message === 'string' ? message : 'Lihat detail');

    return (
        <motion.div
            layout
            key={id}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            title={tooltipText} // Tooltip dengan pesan lengkap
            className={`flex items-center gap-3 py-2 pl-4 pr-3 max-w-xl
                       rounded-full shadow-lg bg-surface backdrop-blur-md border ${getStyle(type)}`}
        >
            <div className="flex-shrink-0">{getIcon(type)}</div>
            {/* PERUBAHAN: Tambahkan kelas 'truncate' untuk memotong teks panjang */}
            <div className="text-text-title font-semibold text-sm flex-grow truncate">
                {message}
            </div>
            <button 
                onClick={() => onClose(id)} 
                className="flex-shrink-0 p-1.5 rounded-full text-text-secondary hover:bg-black/10 hover:text-text-main"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
};

export default Toast;