// src/pages/Supplier.jsx
import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../api/axios";
import { useToast } from "../hooks/useToast";
import Pagination from "../components/ui/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Truck,
  Edit,
  Trash2,
  LoaderCircle,
  Inbox,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import SupplierFormModal from "../components/supplier/SupplierFormModal";

const ITEMS_PER_PAGE = 5;

// Komponen helper untuk Loading dan Empty State (lebih bersih)
const StatusDisplay = ({ isLoading, isEmpty, forMobile, onAdd }) => {
  const content = isLoading ? (
    <div className="flex flex-col items-center gap-3">
      <LoaderCircle size={32} className="animate-spin text-primary" />
      <span>Memuat data supplier...</span>
    </div>
  ) : isEmpty ? (
    <div className="flex flex-col items-center gap-4">
      <Inbox size={48} className="text-primary/50" />
      <div className="text-center">
        <h3 className="font-bold text-lg text-text-title">
          Belum Ada Supplier
        </h3>
        <p className="text-sm">
          Mulai kelola pemasok Anda dengan menambahkan yang baru.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="mt-4 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg shadow-accent/40"
      >
        <Plus size={16} /> Tambah Supplier
      </button>
    </div>
  ) : null;
  if (forMobile) {
    return (
      <div className="col-span-full text-center p-16 text-text-secondary">
        {content}
      </div>
    );
  }
  return (
    <tr>
      <td colSpan={5} className="text-center p-16">
        <div className="flex flex-col items-center justify-center gap-2 text-text-secondary">
          {content}
        </div>
      </td>
    </tr>
  );
};

const Supplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const { addToast } = useToast();

  // Fungsi fetchSuppliers tetap sama, sudah benar
  const fetchSuppliers = useCallback(
    (page) => {
      setLoading(true);
      const params = new URLSearchParams({ page, page_size: ITEMS_PER_PAGE });
      if (searchTerm) params.append("search", searchTerm);
      apiClient
        .get(`/products/pemasok/?${params.toString()}`)
        .then((response) => {
          setSuppliers(response.data.results || []);
          setTotalItems(response.data.count || 0);
        })
        .catch(() => addToast("error", "Gagal memuat data supplier."))
        .finally(() => setLoading(false));
    },
    [searchTerm, addToast]
  );

  // useEffect untuk debounce pencarian dan fetch data
  useEffect(() => {
    const handler = setTimeout(() => {
      // Selalu kembali ke halaman 1 saat pencarian berubah
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchSuppliers(1);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // useEffect untuk fetch saat halaman berubah
  useEffect(() => {
    fetchSuppliers(currentPage);
  }, [currentPage, fetchSuppliers]);

  const handleSuccess = () => {
    setModalOpen(false);
    // Selalu fetch halaman pertama setelah sukses menambah/edit
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchSuppliers(1);
    }
  };

  const handleOpenModal = (supplier = null) => {
    setSelectedSupplier(supplier);
    setModalOpen(true);
  };
  const handleOpenDeleteConfirm = (supplier) => {
    setSupplierToDelete(supplier);
    setConfirmModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    // Pastikan ada supplier yang dipilih untuk dihapus
    if (!supplierToDelete) return;

    try {
      // Kirim permintaan DELETE ke API
      await apiClient.delete(`/products/pemasok/${supplierToDelete.id}/`);

      // Tampilkan notifikasi sukses
      addToast(
        "success",
        <>
          Supplier{" "}
          <span className="font-bold text-accent">
            {supplierToDelete.nama_pemasok}
          </span>{" "}
          berhasil dihapus.
        </>
      );

      // Tutup modal konfirmasi
      setConfirmModalOpen(false);

      // Panggil fungsi untuk mengambil ulang data supplier agar tabel ter-refresh
      fetchSuppliers(currentPage);
    } catch (err) {
      // Tampilkan notifikasi jika terjadi error
      const errorMessage =
        err.response?.data?.detail || "Gagal menghapus supplier.";
      addToast(
        "error",
        <>
          <span className="font-bold">Gagal:</span> {errorMessage}
        </>
      );
    }
  };
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 sm:p-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between sm:items-center gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="bg-surface backdrop-blur-sm border border-light-gray/50 p-3 rounded-2xl shadow-lg">
            <Truck size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-title">
              Manajemen Supplier
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Kelola, cari, dan perbarui semua data pemasok Anda.
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95, y: 0 }}
          onClick={() => handleOpenModal()}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30"
        >
          <Plus size={18} />
          <span>Tambah Supplier</span>
        </motion.button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg"
      >
        <div className="p-4 border-b border-light-gray/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, kontak, atau telepon..."
              className="w-full pl-12 pr-4 py-3 bg-background border border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tampilan Tabel Desktop */}
        <div className="hidden md:block overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left">
            <thead className="bg-secondary/10">
              <tr>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider">
                  SUPPLIER
                </th>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider">
                  KONTAK
                </th>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider">
                  ALAMAT
                </th>
                <th className="p-4 text-center text-sm font-semibold text-text-title tracking-wider">
                  AKSI
                </th>
              </tr>
            </thead>
            <motion.tbody variants={containerVariants}>
              <AnimatePresence>
                {loading || suppliers.length === 0 ? (
                  <StatusDisplay
                    isLoading={loading}
                    isEmpty={suppliers.length === 0}
                    onAdd={() => handleOpenModal()}
                  />
                ) : (
                  suppliers.map((supplier) => (
                    <motion.tr
                      key={supplier.id}
                      layout
                      variants={itemVariants}
                      exit={{ opacity: 0 }}
                      className="group border-b border-light-gray/50 last:border-b-0 even:bg-light-gray/25 odd:bg-transparent hover:!bg-primary/10 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
                            {supplier.nama_pemasok.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-text-main">
                              {supplier.nama_pemasok}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {supplier.email || "Tidak ada email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-sm text-text-main">
                          {supplier.kontak_person || "-"}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {supplier.nomor_telepon || "-"}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-text-secondary truncate max-w-xs">
                        {supplier.alamat || "-"}
                      </td>
                      <td className="p-4">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <button
                            onClick={() => handleOpenModal(supplier)}
                            title="Edit Supplier"
                            className="p-2 rounded-full text-accent hover:bg-accent/10"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteConfirm(supplier)}
                            title="Hapus Supplier"
                            className="p-2 rounded-full text-error hover:bg-error/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>

        {/* Tampilan Kartu Mobile */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:hidden"
        >
          <AnimatePresence>
            {loading || suppliers.length === 0 ? (
              <StatusDisplay
                isLoading={loading}
                isEmpty={suppliers.length === 0}
                forMobile={true}
                onAdd={() => handleOpenModal()}
              />
            ) : (
              suppliers.map((supplier) => (
                <motion.div
                  key={supplier.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-background/80 rounded-xl p-4 space-y-3 border border-light-gray/50 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-text-title">
                      {supplier.nama_pemasok}
                    </p>
                  </div>
                  <div className="space-y-2 text-xs pt-3 border-t border-light-gray/30">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <User size={14} /> {supplier.kontak_person || "-"}
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Phone size={14} /> {supplier.nomor_telepon || "-"}
                    </div>
                    <div className="flex items-start gap-2 text-text-secondary">
                      <MapPin size={14} className="flex-shrink-0 mt-0.5" />{" "}
                      {supplier.alamat || "-"}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-light-gray/30">
                    <button
                      onClick={() => handleOpenModal(supplier)}
                      className="w-full flex justify-center items-center gap-2 py-2 text-sm font-bold bg-accent/10 text-accent hover:bg-accent/20 rounded-lg"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleOpenDeleteConfirm(supplier)}
                      className="w-full flex justify-center items-center gap-2 py-2 text-sm font-bold bg-error/10 text-error hover:bg-error/20 rounded-lg"
                    >
                      <Trash2 size={16} /> Hapus
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-light-gray/30 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </motion.div>

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        supplier={selectedSupplier}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Supplier"
      >
        <p className="text-text-secondary">
          Anda yakin ingin menghapus supplier{" "}
          <strong className="text-text-main">
            {supplierToDelete?.nama_pemasok}
          </strong>
          ?
        </p>
        <p className="text-sm mt-2 text-error">
          Aksi ini tidak dapat dibatalkan.
        </p>
      </ConfirmationModal>
    </motion.div>
  );
};

export default Supplier;
