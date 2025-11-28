import React from 'react';
import { motion } from 'framer-motion';
import { PackageX } from 'lucide-react';

// --- Helper Components ---
const MinimalistSkeletonCard = () => (
    <div className="bg-surface border border-light-gray rounded-xl p-4 space-y-3 animate-pulse">
        <div className="h-5 bg-light-gray/50 rounded w-3/4"></div>
        <div className="h-6 bg-light-gray/50 rounded w-1/2"></div>
        <div className="h-3 bg-light-gray/50 rounded w-1/4 mt-2"></div>
    </div>
);

const StockStatusDot = ({ stock }) => {
    const stockLevel = parseFloat(stock);
    let color = 'bg-error';
    if (stockLevel > 10) { color = 'bg-success'; } 
    else if (stockLevel > 0) { color = 'bg-yellow-500'; }
    return <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>;
};

const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-16 text-text-secondary">
        <PackageX size={48} className="mb-4 text-secondary" />
        <h3 className="text-lg font-bold text-text-title">Produk Tidak Ditemukan</h3>
        <p>Tidak ada produk yang cocok dengan pencarian atau filter Anda.</p>
    </div>
);


const ProductGrid = ({ products, loading, onProductClick }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, index) => <MinimalistSkeletonCard key={index} />)}
            </div>
        );
    }
    
    if (!products || products.length === 0) {
        return <EmptyState />;
    }

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    
    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 200
            }
        }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
            {products.map((product) => {
                const isOutOfStock = parseFloat(product.stok) <= 0;

                return (
                    <motion.div
                        key={product.id}
                        variants={itemVariants}
                        layout
                        onClick={() => !isOutOfStock && onProductClick(product)}
                        whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
                        whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
                        className={`bg-background border border-light-gray rounded-xl p-4 flex flex-col justify-between transition-colors duration-200
                            ${isOutOfStock 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer hover:border-primary hover:bg-primary/5'}`
                        }
                    >
                        <div>
                            <h4 className="font-bold text-text-main text-sm mb-2 break-words">
                                {product.nama_produk_induk}<span className='text-primary'> {product.nama_varian}</span>
                            </h4>
                            <p className="text-accent font-semibold text-base">
                                Rp {parseFloat(product.harga_jual_normal).toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-secondary pt-3 mt-3 border-t border-light-gray/50">
                            <div className="flex items-center gap-1.5">
                                <StockStatusDot stock={product.stok} />
                                <span>Stok: {parseFloat(product.stok).toFixed(0)}</span>
                            </div>
                            <span>{product.kategori}</span>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default ProductGrid;
