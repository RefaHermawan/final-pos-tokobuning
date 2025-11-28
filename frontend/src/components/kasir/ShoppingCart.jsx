// src/components/kasir/ShoppingCart.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingCart as CartIcon, Plus, Minus, CreditCard, Hand, ListChecks } from 'lucide-react';

// Komponen untuk State Keranjang Kosong
const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
        <CartIcon size={48} className="text-secondary mb-4" />
        <h4 className="font-bold text-text-main">Keranjang Anda Kosong</h4>
        <p className="text-sm mt-1">Pilih produk untuk memulai transaksi.</p>
    </div>
);

// PENTING: Untuk logika input yang lebih baik, disarankan mengganti onQuantityChange
// menjadi onUpdateQuantity yang menerima nilai absolut, seperti yang kita diskusikan sebelumnya.
// Namun, untuk menjaga fungsionalitas kode Anda saat ini, saya akan tetap menggunakan onQuantityChange.
const ShoppingCart = ({ cartItems, cartTotal, onQuantityChange, onRemoveItem, onPayClick, onClearCart, customerType, onCustomerTypeChange, getPrice, onHoldClick, onListHeldClick }) => {
    
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } },
        exit: { opacity: 0, x: 50, transition: { duration: 0.3 } }
    };
    
    const handleManualQuantityChange = (itemId, newQtyString) => {
        const currentItem = cartItems.find(item => item.id === itemId);
        if (!currentItem) return;
        if (newQtyString === '') {
            onQuantityChange(itemId, -currentItem.qty); // Anggap jadi 0 untuk dihapus
            return;
        }
        const newQty = parseInt(newQtyString, 10);
        if (!isNaN(newQty) && newQty >= 0) {
            const changeAmount = newQty - currentItem.qty;
            onQuantityChange(itemId, changeAmount);
        }
    };

    const handleFocus = (event) => {
        event.target.select();
    };

    return (
        <div className="w-full lg:w-1/3 flex flex-col bg-surface backdrop-blur-md border border-light-gray p-5 rounded-2xl shadow-lg h-full">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-light-gray/30 pb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <CartIcon className="text-primary" size={24} />
                    <h3 className="text-xl font-bold text-text-title">Keranjang</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onListHeldClick} title="Lihat Transaksi Ditahan" className="p-2 text-text-secondary hover:text-primary rounded-full hover:bg-primary/10 transition-colors"><ListChecks size={18} /></button>
                    <div className="w-px h-5 bg-light-gray/30"></div>
                    {cartItems.length > 0 && (
                        <>
                            <button onClick={onHoldClick} title="Tahan Transaksi" className="p-2 text-text-secondary hover:text-accent rounded-full hover:bg-accent/10 transition-colors"><Hand size={16} /></button>
                            <button onClick={onClearCart} className="p-2 text-text-secondary hover:text-error rounded-full hover:bg-error/10 transition-colors" title="Kosongkan Keranjang"><Trash2 size={16} /></button>
                        </>
                    )}
                </div>
            </div>

            {/* Toggle Tipe Pelanggan */}
            <div className="p-1 my-4 bg-background/50 rounded-lg flex items-center flex-shrink-0 border border-light-gray">
                <button onClick={() => onCustomerTypeChange('normal')} className="relative flex-1 py-1.5 text-sm font-bold rounded-md transition-colors text-text-secondary hover:text-primary">
                    {customerType === 'normal' && <motion.div layoutId="customerTypePill" className="absolute inset-0 bg-secondary/10 shadow" style={{borderRadius: '0.375rem'}}/>}
                    <span className={`relative z-10 ${customerType === 'normal' && 'text-primary'}`}>Biasa</span>
                </button>
                <button onClick={() => onCustomerTypeChange('reseller')} className="relative flex-1 py-1.5 text-sm font-bold rounded-md transition-colors text-text-secondary hover:text-primary">
                    {customerType === 'reseller' && <motion.div layoutId="customerTypePill" className="absolute inset-0 bg-secondary/10 shadow" style={{borderRadius: '0.375rem'}}/>}
                    <span className={`relative z-10 ${customerType === 'reseller' && 'text-primary'}`}>Reseller</span>
                </button>
            </div>

            {/* Daftar Item */}
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                <AnimatePresence>
                    {cartItems.length === 0 ? (
                        <EmptyCart />
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
                            {cartItems.map((item) => {
                                const displayPrice = getPrice(item, item.qty);
                                return (
                                    <motion.div 
                                        key={item.id} layout variants={itemVariants} exit="exit"
                                        className="flex items-center gap-3 bg-background/80 p-2 rounded-xl border border-transparent hover:border-secondary/50 transition-colors"
                                    >
                                        {/* Stepper Kuantitas yang Diperkecil */}
                                        <div className="flex items-center flex-shrink-0">
                                            <motion.button whileTap={{scale: 0.85}} onClick={() => onQuantityChange(item.id, - 1)} className="p-1 w-6 h-6 flex items-center justify-center text-text-secondary hover:text-primary rounded-md hover:bg-secondary/10"><Minus size={14}/></motion.button>
                                            <input
                                                type="number" value={item.qty}
                                                onChange={(e) => handleManualQuantityChange(item.id, e.target.value)}
                                                onFocus={handleFocus}
                                                className="w-7 text-center bg-transparent font-bold text-primary focus:outline-none"
                                            />
                                            <motion.button whileTap={{scale: 0.85}} onClick={() => onQuantityChange(item.id, + 1)} className="p-1 w-6 h-6 flex items-center justify-center text-text-secondary hover:text-primary rounded-md hover:bg-secondary/10"><Plus size={14}/></motion.button>
                                        </div>

                                        {/* Info Produk & Harga */}
                                        <div className="flex-grow overflow-hidden">
                                            <p className="font-semibold text-sm text-text-main truncate">{item.nama_produk_induk} {item.nama_varian}</p>
                                            <p className="text-xs text-accent font-mono ">
                                                Rp {displayPrice.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        
                                        {/* Subtotal & Tombol Hapus */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <p className="font-semibold font-mono text-sm text-accent">
                                                Rp {(item.qty * displayPrice).toLocaleString('id-ID')}
                                            </p>
                                            <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} onClick={() => onRemoveItem(item.id)} className="p-1.5 rounded-full text-text-secondary hover:text-error hover:bg-error/10" title="Hapus Item">
                                                <Trash2 size={15} />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Footer */}
            <div className="border-t border-light-gray/30 pt-4 mt-4 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-text-title">Total</span>
                    <span className="text-2xl font-extrabold text-accent font-mono">Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03, y: 0 }} whileTap={{ scale: 0.98, y: 0 }}
                    disabled={cartItems.length === 0}
                    onClick={onPayClick}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-primary to-secondary text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    <CreditCard size={20} />
                    <span>Bayar Sekarang</span>
                </motion.button>
            </div>
        </div>
    );
};
export default ShoppingCart;