// src/components/kasir/ProductSearch.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Search, LayoutGrid, Soup, GlassWater, Cookie, Coffee, Package } from 'lucide-react';

// Pemetaan ikon tetap sama
const categoryIcons = {
  'Makanan': Soup,
  'Minuman': GlassWater,
  'Snack': Cookie,
  'Kopi': Coffee,
  'default': Package
};

const ProductSearch = ({ categories, selectedCategory, onSearchChange, onCategoryChange }) => {
  
  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || categoryIcons['default'];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="bg-surface backdrop-blur-md border border-light-gray rounded-2xl shadow-lg mb-6"
    >
      {/* Search Input dengan padding lebih kecil */}
      <div className="relative p-3 border-b border-light-gray/50">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Cari nama atau SKU produk..."
          // PERUBAHAN: Padding vertikal (py) dikurangi
          className="w-full pl-11 pr-4 py-2.5 bg-background border-1 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
          onChange={onSearchChange}
        />
      </div>

      {/* Navigasi Kategori dengan ukuran lebih kecil */}
      <div className="flex items-center gap-2 overflow-x-auto p-2">
        {/* Tombol "Semua" dibuat terpisah */}
        <button
            key="all-categories"
            onClick={() => onCategoryChange(null)}
            // PERUBAHAN: Padding (px, py) & font-weight dikurangi
            className={`relative flex-shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-300
                ${selectedCategory === null 
                    ? 'text-white' 
                    : 'text-text-secondary hover:bg-secondary/10 hover:text-primary'}`
            }
        >
            {selectedCategory === null && (
              <motion.div
                layoutId="categoryPill"
                className="absolute inset-0 bg-primary/80 shadow-md shadow-primary/40"
                style={{ borderRadius: '0.5rem' }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10"><LayoutGrid size={16} /></span>
            <span className="relative z-10">Semua</span>
        </button>

        {/* PERUBAHAN: Menambahkan .filter() untuk mencegah duplikasi */}
        {categories
          .filter(cat => cat.nama_kategori.toLowerCase() !== 'semua')
          .map(category => {
            const Icon = getCategoryIcon(category.nama_kategori);
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                // PERUBAHAN: Padding (px, py) & font-weight dikurangi
                className={`relative flex-shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-300
                    ${selectedCategory === category.id 
                        ? 'text-white' 
                        : 'text-text-secondary hover:bg-secondary/10 hover:text-primary'}`
                }
              >
                {selectedCategory === category.id && (
                  <motion.div
                    layoutId="categoryPill"
                    className="absolute inset-0 bg-primary/80 shadow-md shadow-primary/40"
                    style={{ borderRadius: '0.5rem' }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10"><Icon size={16} /></span>
                <span className="relative z-10">{category.nama_kategori}</span>
              </button>
            )
        })}
      </div>
    </motion.div>
  );
};

export default ProductSearch;