// src/components/kasbon/PiutangTab.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Eye,
  CircleDollarSign,
  BadgeCheck,
  BadgeAlert,
  Check,
  X,
  Inbox,
  LoaderCircle,
  User,
  PlusCircle,
  Search,
  Phone,
  MapPin,
} from "lucide-react";
import apiClient from "../../api/axios";
import { useToast } from "../../hooks/useToast";
import Pagination from "../ui/Pagination";

// --- Helper Components (Sama seperti HutangTab) ---
const KpiCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg p-5"
  >
    <div className="flex justify-between items-center">
      <h3 className="font-semibold text-text-secondary">{title}</h3>
      <Icon className="text-primary" size={24} />
    </div>
    <p className="text-3xl font-extrabold text-accent mt-2">
      Rp {parseFloat(value || 0).toLocaleString("id-ID")}
    </p>
  </motion.div>
);
const StatusBadge = ({ isPaid }) => {
  const style = isPaid
    ? "bg-light-gray/30 text-success"
    : "bg-light-gray/30 text-error";
  const Icon = isPaid ? Check : X;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${style}`}
    >
      <Icon size={14} /> {isPaid ? "Lunas" : "Belum Lunas"}
    </span>
  );
};
const StatusDisplay = ({ isLoading, isEmpty, forMobile, onAdd, colSpan }) => {
  const content = isLoading ? (
    <div className="flex flex-col items-center gap-3">
      <LoaderCircle size={32} className="animate-spin text-primary" />
      <span>Memuat data piutang...</span>
    </div>
  ) : isEmpty ? (
    <div className="flex flex-col items-center gap-4">
      <Inbox size={48} className="text-secondary" />
      <div className="text-center">
        <h3 className="font-bold text-lg text-text-title">
          Belum Ada Data Piutang
        </h3>
        <p className="text-sm">
          Klik tombol di bawah untuk mencatat piutang baru.
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        className="mt-4 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30"
      >
        <Plus size={16} /> Tambah Piutang
      </motion.button>
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
      <td colSpan={colSpan || 6} className="text-center p-16">
        <div className="flex flex-col items-center justify-center gap-2 text-text-secondary">
          {content}
        </div>
      </td>
    </tr>
  );
};

const PiutangTab = ({
  summary,
  onAddClick,
  onDetailClick,
  onEditClick,
  onAddTransactionClick,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLunas, setFilterLunas] = useState("");
  const { addToast } = useToast();

    const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage,
      page_size: ITEMS_PER_PAGE,
      tipe: "PIUTANG",
    });
    if (searchTerm) params.append("search", searchTerm);
    if (filterLunas !== "") params.append("lunas", filterLunas);

    apiClient
      .get(`/transactions/hutang-piutang/?${params.toString()}`)
      .then((res) => {
        setData(res.data.results || []);
        setTotalItems(res.data.count || 0);
      })
      .catch(() => addToast("error", "Gagal memuat data piutang."))
      .finally(() => setLoading(false));
  }, [currentPage, searchTerm, filterLunas, addToast]);


  // Satu useEffect yang memanggil fetchData saat dependency berubah
  useEffect(() => {
    const handler = setTimeout(() => {
        fetchData();
    }, 300); // Debounce untuk search
    return () => clearTimeout(handler);
  }, [fetchData]);


  // Handler baru untuk filter yang juga mereset halaman
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleFilterChange = (value) => {
    setFilterLunas(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchData();
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
  const filterOptions = [
    { id: "", label: "Semua" },
    { id: "false", label: "Belum Lunas" },
    { id: "true", label: "Lunas" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
             
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
                   
        <KpiCard
          title="Total Piutang"
          value={summary.total_awal}
          icon={CircleDollarSign}
        />
                   
        <KpiCard
          title="Total Diterima"
          value={summary.total_dibayar}
          icon={BadgeCheck}
        />
                   
        <KpiCard
          title="Sisa Tagihan"
          value={summary.sisa_tagihan}
          icon={BadgeAlert}
        />
               
      </motion.div>
             
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between sm:items-center gap-4"
      >
                   
        <div>
          <h2 className="text-xl font-bold text-text-title">
            Daftar Piutang Pelanggan
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Rincian piutang dari semua pelanggan.
          </p>
        </div>
                   
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddClick}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg"
        >
          <Plus size={18} />
          <span>Tambah Piutang</span>
        </motion.button>
               
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-xl shadow-lg p-3 flex flex-col sm:flex-row items-center gap-3"
      >
                   
        <div className="relative flex-grow w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Cari pelanggan..."
            onChange={handleSearchChange} 
            className="input-style-modern w-full pl-10"
          />
        </div>
                   
        <div className="flex items-center gap-2 p-1 bg-background border border-light-gray/50 rounded-lg">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleFilterChange(opt.id)}
              className="relative px-3 py-1 text-sm font-semibold rounded-md transition-colors text-text-secondary hover:text-primary"
            >
              {filterLunas === opt.id && (
                <motion.div
                  layoutId="piutangFilterPill"
                  className="absolute inset-0 bg-primary text-white shadow"
                  style={{ borderRadius: "0.375rem" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  filterLunas === opt.id && "text-white"
                }`}
              >
                {opt.label}
              </span>
            </button>
          ))}
                     
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
                  PELANGGAN
                </th>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider">
                  TANGGAL
                </th>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-right">
                  TOTAL PIUTANG
                </th>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-right">
                  SISA TAGIHAN
                </th>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-center">
                  STATUS
                </th>
                <th className="p-4 text-sm font-semibold text-text-title tracking-wider text-center">
                  AKSI
                </th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={`${searchTerm}-${filterLunas}-${currentPage}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {loading || data.length === 0 ? (
                  <StatusDisplay
                    isLoading={loading}
                    isEmpty={data.length === 0}
                    onAdd={onAddClick}
                  />
                ) : (
                  data.map((item) => (
                    <motion.tr
                      key={item.id}
                      variants={itemVariants}
                      exit="exit"
                      className="group border-b border-light-gray/50 last:border-b-0 even:bg-light-gray/25 odd:bg-transparent hover:!bg-primary/10 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
                            {item.pelanggan_nama.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-text-main">
                            {item.pelanggan_nama}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 font-mono text-right text-text-secondary">
                        Rp {item.total_awal.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 font-mono font-bold text-right text-error">
                        Rp {item.sisa_tagihan.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge isPaid={item.lunas} />
                      </td>
                      <td className="p-4">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <button
                            onClick={() => onAddTransactionClick(item)}
                            title="Tambah Piutang Lagi"
                            className="p-2 rounded-full text-error hover:bg-error/10"
                          >
                            <PlusCircle size={16} />
                          </button>
                          <button
                            onClick={() => onEditClick(item)}
                            title="Edit"
                            className="p-2 rounded-full text-accent hover:bg-accent/10"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => onDetailClick(item)}
                            title="Lihat Detail"
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
                onAdd={onAddClick}
              />
            ) : (
              data.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-background/80 rounded-xl p-4 space-y-3 border border-light-gray/50 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-text-title">
                        {item.pelanggan_nama}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <StatusBadge isPaid={item.lunas} />
                  </div>
                  <div className="pt-2 border-t border-light-gray/30">
                    <p className="text-xs text-text-secondary">Sisa Tagihan</p>
                    <p className="font-bold text-2xl text-error">
                      Rp {item.sisa_tagihan.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-light-gray/30">
                    <button
                      onClick={() => onAddTransactionClick(item)}
                      className="w-full flex justify-center items-center gap-2 py-2 text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg"
                    >
                      <PlusCircle size={16} /> Tambah
                    </button>
                    <button
                      onClick={() => onEditClick(item)}
                      className="w-full flex justify-center items-center gap-2 py-2 text-sm font-bold bg-accent/10 text-accent hover:bg-accent/20 rounded-lg"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => onDetailClick(item)}
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
export default PiutangTab;

