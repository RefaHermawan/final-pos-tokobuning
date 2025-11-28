// src/components/kasir/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../ui/Modal'; 
import { CreditCard, QrCode, DollarSign, Wallet, CheckCircle } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, totalAmount, onSubmit }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  
  const change = (Number(amountPaid) || 0) - totalAmount;

  useEffect(() => {
    if (isOpen) {
      // PERBAIKAN: Input jumlah bayar dimulai dari kosong (placeholder akan 0)
      setAmountPaid(''); 
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(amountPaid) >= totalAmount) {
      onSubmit({
        jumlah_bayar: Number(amountPaid),
        metode_pembayaran: paymentMethod,
        diskon_nominal: 0 
      });
    }
  };

  const formatCurrency = (value) => `Rp ${parseFloat(value || 0).toLocaleString('id-ID')}`;
  const paymentMethods = [ { name: 'Tunai', icon: DollarSign }, { name: 'QRIS', icon: QrCode }, { name: 'Debit', icon: CreditCard } ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Proses Pembayaran">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Total Belanja */}
        <div className="bg-gradient-to-br from-primary to-secondary/70 p-5 rounded-xl text-white text-center shadow-lg">
          <p className="text-sm opacity-80 font-semibold pb-3">Total Belanja</p>
          <p className="text-5xl font-extrabold tracking-tight font-mono">{formatCurrency(totalAmount)}</p>
        </div>

        {/* Metode Pembayaran */}
        <div>
          <label className="block text-sm font-semibold text-text-main mb-2">Metode Pembayaran</label>
          <div className="flex items-center gap-2 p-1 bg-background rounded-lg border border-light-gray/50">
            {paymentMethods.map(method => (
                <button key={method.name} type="button" onClick={() => setPaymentMethod(method.name)} 
                    className="relative w-full px-3 py-2 text-sm font-bold rounded-md transition-colors text-text-secondary hover:text-primary">
                    {paymentMethod === method.name && <motion.div layoutId="paymentPill" className="absolute inset-0 bg-secondary shadow" style={{borderRadius: '0.375rem'}}/>}
                    <span className={`relative z-10 flex items-center justify-center gap-2 ${paymentMethod === method.name && 'text-white'}`}>
                        <method.icon size={16}/> {method.name}
                    </span>
                </button>
            ))}
          </div>
        </div>

        {/* Jumlah Uang Diterima */}
        <div>
          <label htmlFor="amountPaid" className="block text-sm font-semibold text-text-main mb-1">Jumlah Uang Diterima</label>
          <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-2xl text-text-secondary">Rp</span>
              <input id="amountPaid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} 
                  className="w-full pl-14 pr-4 py-3 bg-secondary/10 border-2 border-light-gray rounded-lg text-text-title focus:ring-2 focus:ring-accent font-mono font-bold text-3xl text-center" 
                  placeholder="0" required autoFocus/>
          </div>
        </div>

        {/* Tombol Cepat */}
        <div className="flex flex-wrap justify-center gap-2">
          {[10000, 20000, 50000, 100000].map(value => (
            <motion.button type="button" key={value} onClick={() => setAmountPaid(value)} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}
              className="px-3 py-1 bg-background text-text-main  rounded-full text-sm hover:bg-primary/10 hover:text-primary font-semibold border border-light-gray/80">
              {value.toLocaleString('id-ID')}
            </motion.button>
          ))}
          {/* PERBAIKAN: Tombol Uang Pas dengan Gaya Khusus */}
          <motion.button type="button" onClick={() => setAmountPaid(totalAmount)} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}
            className="px-4 py-1 bg-accent/10 text-accent rounded-full text-sm hover:bg-accent/20 font-bold border border-accent/50">
            Uang Pas
          </motion.button>
        </div>

        {/* Kembalian */}
        <AnimatePresence>
        {amountPaid && change >= 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-success/10 text-success p-4 rounded-lg text-center overflow-hidden border border-success/20"
          >
            <p className="text-sm font-bold flex items-center justify-center gap-2"><Wallet size={16}/> Kembalian</p>
            <p className="text-3xl font-bold font-mono">{formatCurrency(change)}</p>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Tombol Final */}
        <div className="pt-2">
          <motion.button type="submit" disabled={!amountPaid || change < 0} 
            whileHover={{ scale: 1.03, y: 0 }} whileTap={{ scale: 0.98, y: 0 }}
            className="w-full font-bold py-3.5 rounded-xl text-white bg-gradient-to-r from-primary to-secondary/70 shadow-md hover:shadow-secondary/40 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
          >
            <div className="flex items-center justify-center gap-2">
                <CheckCircle size={20} /> Selesaikan Pembayaran
            </div>
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;