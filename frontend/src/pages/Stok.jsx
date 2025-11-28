import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from "react-router-dom";
import apiClient from '../api/axios';
import { useToast } from '../hooks/useToast';
import Pagination from '../components/ui/Pagination';
import StockHistoryTable from '../components/stok/StockHistoryTable';
import StockInForm from '../components/stok/StockInForm';
import StockOutForm from '../components/stok/StockOutForm';
import StockOpname from '../components/stok/StockOpname';
import LowStockReport from '../components/stok/LowStockReport';
import { motion, AnimatePresence } from 'framer-motion';
import { Import, ArrowRight, ArrowLeft, Edit, AlertTriangle } from 'lucide-react';

const Stok = () => {
  const [activeTab, setActiveTab] = useState("masuk");
  const [searchParams] = useSearchParams();
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 5;
  const { addToast } = useToast();

  // State untuk filter riwayat
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyFilterReason, setHistoryFilterReason] = useState('');

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const fetchHistory = useCallback((page) => {
    setLoadingHistory(true);
    const params = new URLSearchParams({ page, page_size: ITEMS_PER_PAGE });
    if (historySearchTerm) params.append('search', historySearchTerm);
    if (historyFilterReason) params.append('reason', historyFilterReason);

    apiClient.get(`/transactions/stock-history/?${params.toString()}`)
      .then((res) => {
        setHistory(res.data.results || []);
        setTotalItems(res.data.count || 0);
      })
      .catch(() => addToast("error", "Gagal memuat riwayat stok."))
      .finally(() => setLoadingHistory(false));
  }, [historySearchTerm, historyFilterReason]);

  const fetchFormData = useCallback(() => {
    const productsPromise = apiClient.get("/products/varian-produk/?page_size=1000");
    const suppliersPromise = apiClient.get("/products/pemasok/?page_size=1000");

    Promise.all([productsPromise, suppliersPromise])
      .then(([prodRes, supRes]) => {
        setProducts(prodRes.data.results || prodRes.data);
        setSuppliers(supRes.data.results || supRes.data);
      })
      .catch(() => addToast("error", "Gagal memuat data untuk form."));
  }, []);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  useEffect(() => {
    const handler = setTimeout(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchHistory(1);
        }
    }, 300);
    return () => clearTimeout(handler);
  }, [historySearchTerm, historyFilterReason]);

  useEffect(() => {
    if (activeTab !== "laporan") {
      fetchHistory(currentPage);
    }
  }, [currentPage, fetchHistory, activeTab]);

  const onSuccessAction = () => {
    fetchFormData();
    if (currentPage === 1) {
      fetchHistory(1);
    } else {
      setCurrentPage(1);
    }
  };

  const handleSuccess = (message) => {
    addToast("success", message);
    onSuccessAction();
  };

  const tabs = [
    { id: "masuk", label: "Stok Masuk", icon: ArrowRight },
    { id: "keluar", label: "Stok Keluar", icon: ArrowLeft },
    { id: "opname", label: "Stok Opname", icon: Edit },
    { id: "laporan", label: "Laporan Rendah", icon: AlertTriangle },
  ];

  const renderActionContent = () => {
    switch (activeTab) {
      case "masuk": return <StockInForm products={products} suppliers={suppliers} onSuccess={onSuccessAction} />;
      case "keluar": return <StockOutForm products={products} onSuccess={onSuccessAction} />;
      case "opname": return <StockOpname products={products} onSuccess={onSuccessAction} />;
      case "laporan": return <LowStockReport />;
      default: return null;
    }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="relative minh-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 p-4 sm:p-6"
      >
        {/* Header Halaman */}
        <div className="flex items-center gap-4">
          <div className="bg-surface backdrop-blur-sm border border-light-gray/50 p-3 rounded-2xl shadow-lg">
            <Import size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-title">
              Manajemen Stok
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Catat semua pergerakan stok, lakukan opname, dan lihat laporan.
            </p>
          </div>
        </div>

        {/* Kontainer untuk Form Aksi */}
        <div className="bg-surface backdrop-blur-sm border border-light-gray/50 rounded-2xl shadow-md">
          {/* Navigasi Tab dengan Animasi Geser */}
          <div className="p-1.5 flex items-center justify-start space-x-2 overflow-x-auto border-b border-light-gray/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-300
                                    ${
                                      activeTab === tab.id
                                        ? "text-white"
                                        : "text-text-secondary hover:bg-primary/10 hover:text-primary"
                                    }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-primary shadow-md shadow-primary/40"
                    style={{ borderRadius: "0.5rem" }}
                    transition={{ type: "spring", stiffness: 250, damping: 40 }}
                  />
                )}
                <span className="relative z-10">
                  <tab.icon size={16} />
                </span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
          {/* Konten Aksi Sesuai Tab */}
          <div className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {renderActionContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Kontainer untuk Riwayat Stok & Paginasi (HANYA jika bukan tab laporan) */}
        <AnimatePresence>
          {activeTab !== "laporan" && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
            <StockHistoryTable 
                history={history} 
                loading={loadingHistory}
                onSearchChange={e => setHistorySearchTerm(e.target.value)}
                onReasonChange={e => setHistoryFilterReason(e.target.value)}
            />
              {totalItems > ITEMS_PER_PAGE && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / ITEMS_PER_PAGE)}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Stok;
