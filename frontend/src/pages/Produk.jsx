// src/pages/Produk.jsx

import React, { useState, useEffect, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Transition } from "@headlessui/react";
import {
  Plus,
  Edit,
  Trash2,
  Filter,
  ChevronDown,
  RotateCcw,
  Search,
  PlusSquare,
  Package,
  PackageCheck,
  LayoutGrid,
  List,
  Tag,
  DollarSign,
  Warehouse,
  Truck,
  ChevronsUpDown,
  Eye,
  Download,
  Upload,
  ScanBarcode,
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import apiClient from "../api/axios";
import AddProductForm from "../components/produk/AddProductForm";
import AddVariantForm from "../components/produk/AddVariantForm";
import Pagination from "../components/ui/Pagination";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import StockBadge from "../components/ui/StockBadge";
import EditVariantForm from "../components/produk/EditVariantForm";
import ImportProdukModal from "../components/produk/ImportProdukModal";
import BarcodeScannerModal from "../components/produk/BarcodeScannerModal";
import Modal from "../components/ui/Modal";

// Helper Functions & Components
const formatCurrency = (value) =>
  "Rp " + parseFloat(value || 0).toLocaleString("id-ID");

const StatusDisplay = ({
  isLoading,
  isError,
  error,
  isEmpty,
  onAddClick,
  viewMode,
}) => {
  const content = isLoading ? (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Package size={32} className="text-primary" />
      </motion.div>
      <span>Memuat data produk...</span>
    </div>
  ) : isError ? (
    <div className="text-error">{error}</div>
  ) : isEmpty ? (
    <div className="flex flex-col items-center gap-4">
      {" "}
      <PackageCheck size={48} className="text-primary/50" />{" "}
      <h3 className="font-bold text-lg text-text-title">Belum Ada Produk</h3>{" "}
      <p className="text-sm">Tidak ada data produk yang ditemukan.</p>{" "}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddClick}
        className="mt-2 flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-accent rounded-lg shadow-lg shadow-accent/30"
      >
        <Plus size={16} /> Tambah Produk
      </motion.button>{" "}
    </div>
  ) : null;

  if (viewMode === "table") {
    return (
      <tr>
        <td colSpan={7} className="text-center p-16">
          {content}
        </td>
      </tr>
    );
  }
  return (
    <div className="col-span-full text-center p-16 text-text-secondary">
      {content}
    </div>
  );
};

const Produk = () => {
  const [parentProducts, setParentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState("table"); // 'card' atau 'table'
  const ITEMS_PER_PAGE = viewMode === "table" ? 6 : 8;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterPemasok, setFilterPemasok] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [parentProductForVariant, setParentProductForVariant] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [showInactive, setShowInactive] = useState(false); // State baru untuk filter
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const { addToast } = useToast();

  const fetchProducts = useCallback(
    (page, pageSize) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page,
        page_size: pageSize,
        status: "all",
      });
      if (searchTerm) params.append("search", searchTerm);
      if (filterKategori) params.append("kategori", filterKategori);
      if (filterPemasok) params.append("varian__pemasok", filterPemasok);
      apiClient
        .get(`/products/produk/?${params.toString()}`)
        .then((res) => {
          setParentProducts(res.data.results || []);
          setTotalProducts(res.data.count || 0);
        })
        .catch((err) => {
          setError("Gagal memuat data produk.");
          console.error(err);
        })
        .finally(() => setLoading(false));
    },
    [searchTerm, filterKategori, filterPemasok]
  );

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [catRes, supRes] = await Promise.all([
          apiClient.get("/products/kategori/"),
          apiClient.get("/products/pemasok/"),
        ]);
        setCategories(catRes.data);
        setSuppliers(supRes.data.results || supRes.data);
      } catch (err) {
        console.error("Gagal memuat data filter", err);
        addToast("error", "Gagal memuat data filter.");
      }
    };
    fetchFilterData();
  }, []);

  // Effect untuk me-trigger fetch ulang saat filter berubah
  useEffect(() => {
    // Kembali ke halaman 1 setiap kali filter berubah
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      // Jika sudah di halaman 1, langsung fetch
      const handler = setTimeout(() => {
        fetchProducts(1, ITEMS_PER_PAGE);
      }, 300); // Debounce
      return () => clearTimeout(handler);
    }
  }, [searchTerm, filterKategori, filterPemasok, viewMode]);

  // Effect untuk fetch saat halaman berubah
  useEffect(() => {
    fetchProducts(currentPage, ITEMS_PER_PAGE);
  }, [currentPage]);

  const groupedProducts = {};
  parentProducts.forEach((prod) => {
    groupedProducts[prod.id] = {
      ...prod,
      kategori: prod.kategori?.nama_kategori || "Tanpa Kategori",
      variants: prod.varian || [],
    };
  });

  const handleOpenEditModal = (variant) => {
    setEditingVariant(variant);
    setIsEditModalOpen(true);
  };
  const handleOpenAddVariantModal = (variant) => {
    setParentProductForVariant(variant);
    setIsAddVariantModalOpen(true);
  };
  const handleOpenDeleteConfirm = (variant) => {
    setVariantToDelete(variant);
    setIsConfirmModalOpen(true);
  };
  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddVariantModalOpen(false);
    setEditingVariant(null);
    setParentProductForVariant(null);
    setIsImportModalOpen(false);
    setScannedData(null); 
  };

  const handleConfirmDelete = async () => {
    if (!variantToDelete) return;
    try {
      await apiClient.delete(`/products/varian-produk/${variantToDelete.id}/`);
      addToast(
        "success",
        <>
          varian
          <span className="font-semibold text-accent">
            {" "}
            {variantToDelete.nama_varian}{" "}
          </span>
          berhasil dinonaktifkan.
        </>
      );
      fetchProducts(currentPage, ITEMS_PER_PAGE); // Refresh data
    } catch (err) {
      addToast("error", `Gagal: ${err.response?.data?.detail || "Error"}`);
    } finally {
      // Pastikan modal selalu tertutup, baik berhasil maupun gagal
      setIsConfirmModalOpen(false);
      setVariantToDelete(null);
    }
  };

  const handleReactivate = async (variant) => {
    try {
      await apiClient.post(`/products/varian-produk/${variant.id}/reactivate/`);
      handleSuccess(
        <>
          Varian
          <span className="font-semibold text-accent">
            {" "}
            {variant.nama_varian}{" "}
          </span>
          berhasil diaktifkan kembali.
        </>
      );
    } catch (err) {
      addToast("error", "Gagal mengaktifkan varian.");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterKategori("");
    setFilterPemasok("");
  };

  const onSuccessAction = () => {
    handleCloseModals();
    fetchProducts(currentPage, ITEMS_PER_PAGE);
  };

  const handleSuccess = (message) => {
    addToast("success", message);
    onSuccessAction();
  };

  const handleExport = () => {
    addToast("info", "Mempersiapkan file export...");
    apiClient
      .get("/products/export-produk-csv/", { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "daftar_produk.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
        addToast("success", "Export berhasil diunduh!");
      })
      .catch(() => addToast("error", "Gagal mengekspor data."));
  };

  const handleScanSuccess = async (barcode) => {
    setScannerOpen(false);
    addToast("info", "Mencari info produk...");
    try {
      const res = await apiClient.get(
        `/products/lookup-barcode/?barcode=${barcode}`
      );
      addToast("success", "Info produk ditemukan!");

      setScannedData(res.data); // Simpan data hasil scan
      setIsAddModalOpen(true); // Buka modal tambah produk
    } catch (err) {
      addToast("error", "Produk tidak ditemukan di database.");
    }
  };

  const handleOpenAddModal = () => {
    setScannedData(null); // Pastikan form kosong saat dibuka manual
    setIsAddModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
        <div className="absolute -top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl animate-blob animation-delay-3000"></div>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-4 sm:p-6"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between md:items-center gap-4"
        >
            <div className="text-3xl text-text-title flex items-center gap-3">
              <div className="bg-surface backdrop-blur-sm border border-light-gray/50 p-3 rounded-2xl shadow-lg">
                <Package size={28} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-title"> 
                  Manajemen Produk
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Kelola, cari, dan perbarui semua produk Anda.
                </p>
              </div>
            </div>
          

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-primary bg-secondary/10 hover:bg-secondary/20 rounded-lg"
            >
              <ScanBarcode size={16} /> Scan
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-primary bg-secondary/10 hover:bg-secondary/20 rounded-lg"
            >
              <Upload size={16} /> Impor
            </motion.button>

            {/* Tombol Export Baru */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-primary bg-secondary/10 hover:bg-secondary/20 rounded-lg"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 0 }}
              onClick={() => setIsAddModalOpen(true)}
              className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30"
            >
              <Plus size={18} />
              <span>Tambah Produk</span>
            </motion.button>
          </div>
        </motion.div>

        {/* PERBAIKAN 1: Layout flex-wrap untuk filter agar pas */}
        <motion.div
          variants={itemVariants}
          className="relative z-10 bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg p-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-grow min-w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>

            {/* z-index pada Menu diset lebih tinggi agar dropdown terlihat */}
            <Menu as="div" className="relative z-20">
              <Menu.Button className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-bold text-text-main bg-background border-2 border-light-gray rounded-lg hover:border-accent/50">
                <Filter size={16} />
                <span>
                  {categories.find((i) => i.id === filterKategori)
                    ?.nama_kategori || "Kategori"}
                </span>
                <ChevronsUpDown size={16} />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute mt-2 w-56 origin-top-right rounded-md bg-surface shadow-lg ring-1 ring-light-gray ring-opacity-5 focus:outline-none">
                  <div className="p-1">
                    <Menu.Item>
                      <button
                        onClick={() => setFilterKategori("")}
                        className="w-full text-left rounded-md px-2 py-2 text-sm text-text-main hover:bg-primary/10 hover:text-primary"
                      >
                        Semua Kategori
                      </button>
                    </Menu.Item>
                    {categories.map((item) => (
                      <Menu.Item key={item.id}>
                        <button
                          onClick={() => setFilterKategori(item.id)}
                          className="w-full text-left rounded-md px-2 py-2 text-sm text-text-main hover:bg-primary/10 hover:text-primary"
                        >
                          {item.nama_kategori}
                        </button>
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            <Menu as="div" className="relative z-20">
              <Menu.Button className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-bold text-text-main bg-background border-2 border-light-gray rounded-lg hover:border-accent/50">
                <Filter size={16} />
                <span>
                  {suppliers.find((i) => i.id === filterPemasok)
                    ?.nama_pemasok || "Pemasok"}
                </span>
                <ChevronsUpDown size={16} />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute mt-2 w-56 origin-top-right rounded-md bg-surface shadow-lg ring-1 ring-light-gray ring-opacity-5 focus:outline-none">
                  <div className="p-1">
                    <Menu.Item>
                      <button
                        onClick={() => setFilterPemasok("")}
                        className="w-full text-left rounded-md px-2 py-2 text-sm text-text-main hover:bg-primary/10 hover:text-primary"
                      >
                        Semua Pemasok
                      </button>
                    </Menu.Item>
                    {suppliers.map((item) => (
                      <Menu.Item key={item.id}>
                        <button
                          onClick={() => setFilterPemasok(item.id)}
                          className="w-full text-left rounded-md px-2 py-2 text-sm text-text-main hover:bg-primary/10 hover:text-primary"
                        >
                          {item.nama_pemasok}
                        </button>
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {(filterKategori || filterPemasok) && (
              <button
                onClick={handleResetFilters}
                className="p-3 bg-error/20 hover:bg-error/30 rounded-lg text-error"
              >
                <RotateCcw size={16} />
              </button>
            )}

            <div className="bg-background border border-light-gray shadow-inner rounded-lg p-1 flex items-center ml-auto">
              <button
                onClick={() => setViewMode("card")}
                title="Tampilan Kartu"
                className={`p-1.5 rounded-md ${
                  viewMode === "card"
                    ? "bg-surface shadow-md text-primary border border-light-gray"
                    : "text-text-secondary"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                title="Tampilan Tabel"
                className={`p-1.5 rounded-md ${
                  viewMode === "table"
                    ? "bg-surface shadow-md text-primary border border-light-gray"
                    : "text-text-secondary"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {viewMode === "card" ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {loading || error || parentProducts.length === 0 ? (
                  <StatusDisplay
                    isLoading={loading}
                    isError={!!error}
                    error={error}
                    isEmpty={parentProducts.length === 0}
                    onAddClick={() => setIsAddModalOpen(true)}
                    viewMode="card"
                  />
                ) : (
                  Object.values(groupedProducts).map((group) => (
                    <motion.div
                      key={group.id}
                      layout
                      variants={itemVariants}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg flex flex-col"
                    >
                      <div className="flex justify-between items-center p-4 bg-surface border-b rounded-t-2xl border-light-gray/50">
                        <div>
                          <h3 className="font-bold text-lg text-primary">
                            {group.nama_produk}
                          </h3>
                          <p className="text-xs font-medium text-text-secondary">
                            {group.kategori}
                          </p>
                        </div>
                        <button
                          onClick={() => handleOpenAddVariantModal(group)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-primary bg-secondary/10 hover:bg-secondary/20 rounded-lg"
                        >
                          <PlusSquare size={14} /> Varian
                        </button>
                      </div>
                      <div className="p-4 space-y-3 flex-grow">
                        {group.variants.length > 0 ? (
                          group.variants.map((variant) => (
                            <div
                              key={variant.id}
                              className={`p-3 rounded-lg ${
                                !variant.is_active
                                  ? "bg-error/10"
                                  : "bg-background border border-light-gray/50"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p
                                    className={`font-semibold text-accent ${
                                      !variant.is_active &&
                                      "line-through text-error/80"
                                    }`}
                                  >
                                    {variant.nama_varian}
                                  </p>
                                  <p className="font-mono text-xs text-text-secondary mt-1">
                                    SKU: {variant.sku || "-"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {variant.is_active ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleOpenEditModal(variant)
                                        }
                                        className="p-1.5 text-accent hover:bg-accent/10 rounded-full"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleOpenDeleteConfirm(variant)
                                        }
                                        className="p-1.5 text-error hover:bg-error/10 rounded-full"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleReactivate(variant)}
                                      className="flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary hover:bg-secondary/10 px-3 py-1.5 rounded-lg "
                                    >
                                      <Eye size={14} /> Aktifkan
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-4 text-xs pt-3 mt-3 border-t border-light-gray/30">
                                <div>
                                  <p className="flex items-center gap-1.5 text-text-secondary">
                                    <Warehouse size={14} /> Stok
                                  </p>
                                  <p className="font-bold text-lg text-text-title">
                                    {parseFloat(variant.stok).toFixed(0)}{" "}
                                    <span className="text-xs font-normal">
                                      {variant.satuan}
                                    </span>
                                  </p>
                                </div>
                                <div className="text-center sm:text-left">
                                  <p className="flex items-center gap-1.5 text-text-secondary">
                                    <PackageCheck size={14} /> Status
                                  </p>
                                  <div className="mt-1">
                                    <StockBadge quantity={variant.stok} />
                                  </div>
                                </div>
                                <div>
                                  <p className="flex items-center gap-1.5 text-text-secondary">
                                    <Tag size={14} /> Harga Ecer
                                  </p>
                                  <p className="font-mono font-semibold text-primary">
                                    {formatCurrency(variant.harga_jual_normal)}
                                  </p>
                                </div>
                                <div>
                                  <p className="flex items-center gap-1.5 text-text-secondary">
                                    <Tag size={14} /> Harga Grosir
                                  </p>
                                  <p className="font-mono font-semibold text-accent">
                                    {formatCurrency(
                                      variant.harga_jual_reseller
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-sm text-text-secondary py-4">
                            Belum ada varian untuk produk ini.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-secondary/10">
                      <tr>
                        <th className="p-4 text-sm font-semibold text-text-title tracking-wider">
                          PRODUK / VARIAN
                        </th>
                        <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-right">
                          HARGA BELI
                        </th>
                        <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-right">
                          HARGA ECER
                        </th>
                        {/* PERBAIKAN 3: Header Harga Grosir ditambahkan */}
                        <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-right">
                          HARGA GROSIR
                        </th>
                        <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-center">
                          STOK
                        </th>
                        {/* PERBAIKAN 3: Header Status ditambahkan */}
                        <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-center">
                          STATUS
                        </th>
                        <th className="p-4 text-sm font-semibold text-text-title tracking-wider">
                          PEMASOK
                        </th>
                        <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-center">
                          AKSI
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {loading || error || parentProducts.length === 0 ? (
                          <StatusDisplay
                            isLoading={loading}
                            isError={!!error}
                            error={error}
                            isEmpty={parentProducts.length === 0}
                            onAddClick={() => setIsAddModalOpen(true)}
                            viewMode="table"
                          />
                        ) : (
                          Object.values(groupedProducts).map((group) => (
                            <Fragment key={group.id}>
                              <tr className="bg-surface border-y border-light-gray/50">
                                <td className="p-4 font-bold text-primary text-base flex items-center gap-3">
                                  <Package size={16} />
                                  {group.nama_produk}
                                  <span className="text-xs font-normal text-text-secondary ">
                                    ( {group.kategori} )
                                  </span>
                                </td>
                                <td colSpan={6}></td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() =>
                                      handleOpenAddVariantModal(group)
                                    }
                                    title="Tambah Varian"
                                    className="p-2 rounded-full text-primary hover:bg-primary/20"
                                  >
                                    <PlusSquare size={18} />
                                  </button>
                                </td>
                              </tr>
                              {group.variants.map((variant) => (
                                <motion.tr
                                  layout
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  key={variant.id}
                                  className={`
                              ${
                                !variant.is_active
                                  ? "bg-error/10 text-error/80"
                                  : "odd:bg-transparent even:bg-light-gray/25"
                              } 
                              hover:!bg-primary/10 transition-colors duration-200
                            `}
                                >
                                  <td className="pl-12 pr-4 py-3">
                                    <p
                                      className={`font-semibold text-accent ${
                                        !variant.is_active &&
                                        "line-through text-error/80"
                                      }`}
                                    >
                                      {variant.nama_varian}
                                    </p>
                                    <p className="font-mono text-xs text-text-secondary mt-1">
                                      SKU: {variant.sku || "-"}
                                    </p>
                                  </td>
                                  <td className="p-4 font-mono text-right text-text-secondary">
                                    {formatCurrency(variant.purchase_price)}
                                  </td>
                                  <td className="p-4 font-mono font-semibold text-right text-primary">
                                    {formatCurrency(variant.harga_jual_normal)}
                                  </td>
                                  {/* PERBAIKAN 3: Kolom Harga Grosir ditambahkan */}
                                  <td className="p-4 font-mono font-semibold text-right text-accent">
                                    {formatCurrency(
                                      variant.harga_jual_reseller
                                    )}
                                  </td>
                                  {/* PERBAIKAN 4: Tampilan Stok diubah */}
                                  <td className="p-4 font-mono text-center font-bold text-text-main">
                                    {parseFloat(variant.stok).toFixed(2)}
                                    <span className="ml-1 text-xs font-medium text-text-secondary">
                                      {variant.satuan}
                                    </span>
                                  </td>
                                  {/* PERBAIKAN 3: Kolom Status ditambahkan */}
                                  <td className="p-4 text-center">
                                    <StockBadge quantity={variant.stok} />
                                  </td>
                                  <td className="p-4 text-sm text-text-secondary">
                                    {variant.pemasok_nama || "-"}
                                  </td>
                                  <td className="p-4">
                                    <div className="flex justify-center items-center gap-2">
                                      {variant.is_active ? (
                                        <>
                                          <button
                                            onClick={() =>
                                              handleOpenEditModal(variant)
                                            }
                                            title="Edit Varian"
                                            className="p-2 rounded-full text-accent hover:bg-accent/20"
                                          >
                                            <Edit size={16} />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleOpenDeleteConfirm(variant)
                                            }
                                            title="Hapus Varian"
                                            className="p-2 rounded-full text-error hover:bg-error/20"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleReactivate(variant)
                                          }
                                          className="flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary hover:bg-secondary/10 px-3 py-1.5 rounded-lg "
                                        >
                                          <Eye size={14} /> Aktifkan
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </motion.tr>
                              ))}
                            </Fragment>
                          ))
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {totalProducts > ITEMS_PER_PAGE && (
          <motion.div variants={itemVariants} className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalProducts / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </motion.div>
        )}
      </motion.div>

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
      <ImportProdukModal
        isOpen={isImportModalOpen}
        onClose={handleCloseModals}
        onSuccess={onSuccessAction}
      />
      <AddProductForm
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        onSuccess={onSuccessAction}
        categories={categories}
        suppliers={suppliers}
        initialData={scannedData}
      />
      <EditVariantForm
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        product={editingVariant}
        categories={categories}
        suppliers={suppliers}
        onSuccess={onSuccessAction}
      />
      <AddVariantForm
        isOpen={isAddVariantModalOpen}
        onClose={handleCloseModals}
        parentProduct={parentProductForVariant}
        categories={categories}
        suppliers={suppliers}
        onSuccess={onSuccessAction}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Nonaktifkan"
        confirmText="Ya, Nonaktifkan"
        type="warning"
      >
        {variantToDelete && variantToDelete.varian_count <= 1 ? (
          <div>
            <p>
              Ini varian terakhir dari{" "}
              <strong>{variantToDelete.nama_produk_induk}</strong>.
            </p>
            <p className="mt-2 text-error font-semibold">
              Menonaktifkan ini akan menyembunyikan produk induknya juga. Anda
              yakin?
            </p>
          </div>
        ) : (
          <p>
            Anda yakin ingin menonaktifkan varian{" "}
            <strong>{variantToDelete?.nama_varian}</strong>?
          </p>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default Produk;
