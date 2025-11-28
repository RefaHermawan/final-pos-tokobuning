// src/components/kasir/ReceiptModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../ui/Modal';
import { CheckCircle, Printer, ChevronsRight } from 'lucide-react';

// Komponen kecil untuk efek konfeti
const ConfettiPiece = ({ i }) => {
    const colors = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)'];
    const randomXEnd = Math.random() * 200 - 100;
    const randomYEnd = Math.random() * 200 - 100;
    const randomScale = Math.random() * 0.5 + 0.5;
    const randomDuration = Math.random() * 0.5 + 0.5;

    return (
        <motion.div
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
            style={{ background: colors[i % colors.length] }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ x: randomXEnd, y: randomYEnd, scale: randomScale, opacity: 0 }}
            transition={{ duration: randomDuration, ease: 'easeOut' }}
        />
    );
};

// PERUBAHAN: Prop 'changeAmount' dihapus
const ReceiptModal = ({ isOpen, onClose, onPrint }) => {
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delay: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative text-center p-6 flex flex-col items-center overflow-hidden min-w-md"
      >
        <AnimatePresence>
            {isOpen && (
                <div className="absolute top-1/2 left-1/2 w-1 h-1">
                    {Array.from({ length: 20 }).map((_, i) => <ConfettiPiece key={i} i={i}/>)}
                </div>
            )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="bg-success/10 p-4 rounded-full">
            <CheckCircle className="h-10 w-10 text-success" strokeWidth={2.5}/>
        </motion.div>

        <motion.h3 variants={itemVariants} className="text-3xl font-bold text-primary mt-4">Transaksi Berhasil!</motion.h3>
        <motion.p variants={itemVariants} className="text-text-secondary mt-1">Transaksi berhasil disimpan.</motion.p>
        
        {/* PERUBAHAN: Tampilan kembalian dihapus dari sini */}
        
        <motion.div variants={itemVariants} className="mt-8 w-full space-y-3 sm:space-y-0 sm:flex sm:flex-row-reverse sm:gap-3">
          <button 
            onClick={onClose} 
            className="w-full font-bold py-3 rounded-xl text-white bg-secondary shadow-md shadow-primary/30 hover:bg-primary transition-all flex items-center justify-center gap-2"
          >
            Transaksi Berikutnya <ChevronsRight size={20}/>
          </button>
          <button 
            onClick={onPrint} 
            className="w-full font-bold py-3 rounded-lg text-primary bg-secondary/15 hover:bg-primary/20 border-light-gray transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={18} /> Cetak Struk
          </button>
        </motion.div>
      </motion.div>
    </Modal>
  );
};

export default ReceiptModal;