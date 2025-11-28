import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Save, Package, ArrowUp, ArrowDown, Plus, Minus, Search, Inbox } from 'lucide-react';
import apiClient from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import Pagination from '../ui/Pagination';
import DifferenceDisplay from "../stok/ui/DifferenceDisplay";

const StockOpname = ({ products, onSuccess }) => {
  const [counts, setCounts] = useState({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // State baru untuk pencarian
  const ITEMS_PER_PAGE = 6; // Lebih sedikit item per halaman untuk layout kartu
  const { addToast } = useToast();

  const handleCountChange = (varianId, value) => {
    const newCount = value === "" ? "" : parseFloat(value);
    // Batasi nilai minimal 0
    if (newCount < 0) return;
    setCounts((prev) => ({ ...prev, [varianId]: newCount }));
  };

  const resetForm = () => {
    setCounts({});
    // addToast("info", <>Input stok fisik telah <span className="font-bold text-primary">direset</span>.</>);
  };

  const handleSubmit = async () => {
    // ... (Logika handleSubmit tetap sama)
    setSubmitting(true);
    const items_to_adjust = Object.entries(counts)
      .filter(([, count]) => count !== "" && count !== null)
      .map(([id, count]) => ({
        varian_id: parseInt(id),
        physical_count: count,
      }));
    if (items_to_adjust.length === 0) {
      addToast("error", <>Harap isi setidaknya <span className="font-bold text-accent">satu jumlah fisik</span> produk.</>);
      setSubmitting(false);
      return;
    }
    try {
      await apiClient.post("/transactions/stock-opname/", {
        items: items_to_adjust,
      });

      const adjustedProductNames = items_to_adjust.map(item => {
        const product = products.find(p => p.id === item.varian_id);
        return product ? `${product.nama_produk_induk} ${product.nama_varian}` : null;
      }).filter(Boolean);

      let successMessage;
      if (adjustedProductNames.length === 1) {
        successMessage = <>Penyesuaian untuk <span className="font-bold text-accent">{adjustedProductNames[0]}</span> berhasil disimpan!</>;
      } else if (adjustedProductNames.length > 1) {
        successMessage = <>Penyesuaian untuk <span className="font-bold text-accent">{adjustedProductNames.length} produk</span> berhasil disimpan!</>;
      } else {
        successMessage = <>Penyesuaian stok berhasil <span className="font-bold text-success">disimpan!</span></>;
      }

      addToast("success", successMessage);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      const fullError = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
      addToast("error", <><span className="font-bold">Gagal:</span> {errorMessage}</>, fullError);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(
      (p) =>
        p.nama_produk_induk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nama_varian.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-2xl font-bold text-text-title">
          Penyesuaian Stok Fisik
        </h2>
        <p className="text-text-secondary mt-1">
          Masukkan jumlah stok nyata di lapangan untuk setiap produk di bawah
          ini.
        </p>
      </motion.div>

      {/* 1. Fitur Pencarian Produk Telah Ditambahkan */}
      <motion.div
        variants={itemVariants}
        className="relative w-full max-w-lg mx-auto"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary z-10" />
        <input
          type="text"
          placeholder="Cari nama produk atau varian..."
          className="w-full pl-12 pr-4 py-3 bg-surface backdrop-blur-md border border-light-gray/50 rounded-xl text-text-main shadow-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all"
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset ke halaman 1 saat mencari
          }}
        />
      </motion.div>

      <div className="min-h-[400px]">
        {currentItems.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {currentItems.map((p) => {
              const physicalCount = counts[p.id] ?? "";
              const systemStock = parseFloat(p.stok);
              const selisih =
                physicalCount !== "" && physicalCount !== undefined
                  ? physicalCount - systemStock
                  : null;

              return (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  layout
                  className="relative bg-background backdrop-blur-md border border-light-gray rounded-2xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-primary/20"
                >
                  <div
                    className={`absolute top-0 left-0 h-1.5 w-full ${
                      selisih !== null
                        ? "bg-gradient-to-r from-primary/50 to-secondary/50"
                        : "bg-transparent"
                    }`}
                  />

                  <div className="p-5 space-y-4">
                    {/* Product Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-md text-text-title leading-tight">
                          {p.nama_produk_induk} {p.nama_varian}
                        </p>
                        {/* <p className="text-sm font-semibold text-accent">
                          {p.nama_varian}
                        </p> */}
                      </div>
                    </div>

                    {/* Stock Info & Input */}
                    <div className="grid grid-cols-3 gap-4 text-center bg-surface border border-light-gray p-3 rounded-xl">
                      <div>
                        <p className="text-xs font-semibold text-text-secondary">
                          Stok Sistem
                        </p>
                        <p className="font-bold text-lg text-accent">
                          {systemStock.toFixed(2)}
                        </p>
                      </div>
                      <div className="relative">
                        <p className="text-xs font-bold text-primary">
                          Stok Fisik
                        </p>
                        {/* 2. 'Stepper' Input yang Taktil */}
                        <div className="mt-1 flex items-center justify-center rounded-lg bg-background shadow-inner border border-light-gray/50">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleCountChange(p.id, (physicalCount || 0) - 1)
                            }
                            className="p-1 text-text-secondary hover:text-primary"
                          >
                            <Minus size={16} />
                          </motion.button>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            value={physicalCount}
                            onChange={(e) =>
                              handleCountChange(p.id, e.target.value)
                            }
                            className="w-full text-center bg-transparent font-bold text-lg text-primary focus:outline-none"
                          />
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleCountChange(p.id, (physicalCount || 0) + 1)
                            }
                            className="p-1 text-text-secondary hover:text-primary"
                          >
                            <Plus size={16} />
                          </motion.button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-secondary">
                          Selisih
                        </p>
                        {/* 3. Visualisasi Feedback Langsung */}
                        <DifferenceDisplay value={selisih} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 text-text-secondary">
            <Inbox size={48} className="mb-4 text-secondary" />
            <h3 className="text-lg font-bold text-text-title">
              Produk Tidak Ditemukan
            </h3>
            <p>Tidak ada produk yang cocok dengan pencarian Anda.</p>
          </div>
        )}
      </div>

      {/* 2. Posisi Tombol Aksi & Paginasi Diubah (Statis di Bawah) */}
      <motion.div
        variants={itemVariants}
        className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="w-full sm:w-auto">
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetForm}
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg transition-colors"
          >
            <span className="transition-transform duration-300 group-hover:rotate-[-45deg]">
              <RotateCcw size={16} />
            </span>
            Reset
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: 0 }}
            whileTap={{ scale: 0.95, y: 0 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg hover:shadow-primary/30 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none"
          >
            <Save size={16} /> {isSubmitting ? "Menyimpan..." : "Simpan"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StockOpname;

