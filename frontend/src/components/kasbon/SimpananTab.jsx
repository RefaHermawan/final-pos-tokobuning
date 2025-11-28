// src/components/kasbon/SimpananTab.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Eye,
  PlusCircle,
  Edit,
  Wallet,
  Users,
  Inbox,
  LoaderCircle,
  Phone,
  MapPin,
  Search,
} from "lucide-react";
import apiClient from "../../api/axios";
import { useToast } from "../../hooks/useToast";
import Pagination from "../ui/Pagination";

// --- Helper Components ---
const KpiCard = ({ title, value, icon: Icon, isCurrency = true }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg p-5"
  >

    <div className="flex justify-between items-center">
      <h3 className="font-semibold text-text-secondary">{title}</h3>
      <Icon className="text-primary" size={24} />
    </div>
    <p className="text-3xl font-extrabold text-accent mt-2">
      {isCurrency
        ? `Rp ${parseFloat(value || 0).toLocaleString("id-ID")}`
        : value || 0}
    </p>
  </motion.div>
);
const StatusDisplay = ({ isLoading, isEmpty, forMobile, onAdd, colSpan }) => {
  const content = isLoading ? (
    <div className="flex flex-col items-center gap-3">
      <LoaderCircle size={32} className="animate-spin text-primary" />
      <span>Memuat data simpanan...</span>
    </div>
  ) : isEmpty ? (
    <div className="flex flex-col items-center gap-4">
      <Inbox size={48} className="text-secondary" />
      <div className="text-center">
        <h3 className="font-bold text-lg text-text-title">
          Belum Ada Pelanggan
        </h3>
        <p className="text-sm">
          Tambahkan pelanggan baru untuk mulai mencatat simpanan.
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        className="mt-4 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg shadow-accent/20"
      >
        <UserPlus size={16} /> Tambah Pelanggan
      </motion.button>
    </div>
  ) : null;
  if (forMobile) {
    return (
      <div className="w-full col-span-full text-center p-16 text-text-secondary">
        {content}
      </div>
    );
  }
  return (
    <tr>
      <td colSpan={colSpan || 5} className="text-center p-16">
        <div className="flex flex-col items-center justify-center gap-2 text-text-secondary">
          {content}
        </div>
      </td>
    </tr>
  );
};

// --- Komponen Utama ---
const SimpananTab = ({
  summary,
  onAddCustomerClick,
  onAddDepositClick,
  onDetailClick,
  onEditClick,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const { addToast } = useToast();

  const fetchData = useCallback(
    (page) => {
      setLoading(true);
      const params = new URLSearchParams({ page, page_size: ITEMS_PER_PAGE });
      if (searchTerm) params.append("search", searchTerm);
      apiClient
        .get(`/transactions/pelanggan/?${params.toString()}`)
        .then((res) => {
          setData(res.data.results || []);
          setTotalItems(res.data.count || 0);
        })
        .catch(() => addToast("error", "Gagal memuat data pelanggan."))
        .finally(() => setLoading(false));
    },
    [searchTerm, addToast]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchData(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);
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
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >

        <KpiCard
          title="Total Simpanan Aktif"
          value={summary.total_simpanan_aktif}
          icon={Wallet}
        />

        <KpiCard
          title="Jumlah Pelanggan"
          value={summary.jumlah_pelanggan}
          icon={Users}
          isCurrency={false}
        />

      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between sm:items-center gap-4"
      >

        <div>
          <h2 className="text-xl font-bold text-text-title">
            Daftar Simpanan Pelanggan
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Kelola semua simpanan dari pelanggan Anda.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddCustomerClick}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg shadow-accent/30 hover:shadow-accent/50"
        >
          <UserPlus size={18} />
          <span>Pelanggan Baru</span>
        </motion.button>

      </motion.div>
      <motion.div
        variants={itemVariants}
        className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-xl shadow-lg p-3"
      >
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Cari nama pelanggan..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-style-modern w-full pl-10"
          />
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/10">
              <tr>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider">
                  NAMA PELANGGAN
                </th>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider">
                  KONTAK
                </th>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-center">
                  ALAMAT
                </th> 
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-right">
                  SALDO SIMPANAN
                </th>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-center">
                  AKSI
                </th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={`${searchTerm}-${currentPage}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {loading || data.length === 0 ? (
                  <StatusDisplay
                    isLoading={loading}
                    isEmpty={data.length === 0}
                    onAdd={onAddCustomerClick}
                  />
                ) : (
                  data.map((p) => (
                    <motion.tr
                      key={p.id}
                      variants={itemVariants}
                      exit="exit"
                      className="group border-b border-light-gray/50 last:border-b-0 even:bg-light-gray/25 odd:bg-transparent hover:!bg-primary/10 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-lg text-primary">
                            {p.nama_pelanggan.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-text-main">
                            {p.nama_pelanggan}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        {p.nomor_telepon || "-"}
                      </td>
                      <td className="p-4 text-sm text-text-secondary text-center">
                        {p.alamat || "-"}
                      </td>
                      <td className="p-4 font-mono font-bold text-text-secondary text-right">
                        Rp {parseFloat(p.saldo_simpanan).toLocaleString("id-ID")}
                      </td>
                      <td className="p-4">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <button
                            onClick={() => onAddDepositClick(p)}
                            title="Tambah Setoran"
                            className="p-2 rounded-full text-error hover:bg-error/10"
                          >
                            <PlusCircle size={16} />
                          </button>
                          <button
                            onClick={() => onEditClick(p)}
                            title="Edit Pelanggan"
                            className="p-2 rounded-full text-accent hover:bg-accent/10"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => onDetailClick(p)}
                            title="Lihat Riwayat"
                            className="p-2 rounded-full text-primary hover:bg-primary/10"
                          >
                            <Eye size={16} />
                          </button>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:hidden"
        >
          <AnimatePresence>
            {loading || data.length === 0 ? (
              <StatusDisplay
                isLoading={loading}
                isEmpty={data.length === 0}
                forMobile={true}
                onAdd={onAddCustomerClick}
              />
            ) : (
              data.map((p) => (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-background/80 rounded-xl p-4 space-y-3 border border-light-gray/50 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
                        {p.nama_pelanggan.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-bold text-text-title">
                        {p.nama_pelanggan}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-light-gray/30">
                    <p className="text-xs text-text-secondary">
                      Saldo Simpanan
                    </p>
                    <p className="font-bold text-2xl text-success">
                      Rp {parseFloat(p.saldo_simpanan).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-xs pt-2 border-t border-light-gray/30">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Phone size={14} /> {p.nomor_telepon || "-"}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-light-gray/30">
                    <button
                      onClick={() => onAddDepositClick(p)}
                      className="w-full flex justify-center items-center gap-2 py-2 text-sm font-bold bg-success/10 text-success hover:bg-success/20 rounded-lg"
                    >
                      <PlusCircle size={16} /> Setoran
                    </button>
                    <button
                      onClick={() => onEditClick(p)}
                      className="w-full flex justify-center items-center gap-2 py-2 text-sm font-bold bg-accent/10 text-accent hover:bg-accent/20 rounded-lg"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => onDetailClick(p)}
                      className="w-full flex justify-center items-center gap-2 py-2 text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg"
                    >
                      <Eye size={16} /> Detail
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
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SimpananTab;
