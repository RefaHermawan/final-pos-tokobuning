// src/components/ui/ConfirmationModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal'; // Mengasumsikan Modal.jsx sudah ada dan berfungsi
import { AlertTriangle, CheckCircle } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children,
  type = 'warning', // 'warning' (default) atau 'success'
  confirmText = 'Ya, Lanjutkan'
}) => {

  // Menentukan ikon dan warna berdasarkan tipe modal
  const isWarning = type === 'warning';
  const IconComponent = isWarning ? AlertTriangle : CheckCircle;
  const iconContainerClass = isWarning ? 'bg-error/10' : 'bg-success/10';
  const iconClass = isWarning ? 'text-error' : 'text-success';
  const confirmButtonClass = isWarning 
    ? 'bg-error hover:bg-error/90' 
    : 'bg-success hover:bg-success/90';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-center min-w-md"
        >
            {/* 1. Ikon Kontekstual yang Dinamis */}
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${iconContainerClass}`}>
                <IconComponent className={iconClass} size={32} />
            </div>

            {/* 2. Desain dan Layout yang Lebih Modern */}
            <div className="mt-4">
                <h3 className="text-xl font-bold text-text-title">{title}</h3>
                <div className="mt-2 text-sm text-text-secondary space-y-2">
                    {children}
                </div>
            </div>

            {/* 3. Tombol Aksi yang Ditingkatkan */}
            <div className="mt-8 flex justify-center items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="flex-1 px-4 py-2.5 text-sm font-bold border border-light-gray/50 text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg transition-colors"
                    onClick={onClose}
                >
                    Batal
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05, y: 0 }}
                    whileTap={{ scale: 0.95, y: 0 }}
                    type="button"
                    className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-lg shadow-lg transition-all
                                ${confirmButtonClass} hover:shadow-error/30`}
                    onClick={onConfirm}
                >
                    {confirmText}
                </motion.button>
            </div>
        </motion.div>
    </Modal>
  );
};

export default ConfirmationModal;