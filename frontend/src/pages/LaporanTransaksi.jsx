// src/pages/LaporanTransaksi.jsx
import React, { useState, useEffect, useCallback, Fragment } from "react";
import apiClient from "../api/axios";
import { useToast } from "../hooks/useToast";
import Pagination from "../components/ui/Pagination";
import TransactionDetailModal from "../components/laporantransaksi/TransactionDetailModal";
import PrintableReceipt from "../components/kasir/PrintableReceipt"; // Import komponen struk
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Transition } from "@headlessui/react";
import {
  Download,
  Filter as FilterIcon,
  RotateCcw,
  FileText,
  DollarSign,
  Printer,
  Hash,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Eye,
  Inbox,
  User,
  MoreHorizontal,
  ChevronsUpDown,
} from "lucide-react";

// --- Helper Components ---
const StatusBadge = ({ status }) => {
  let style = "bg-light-gray/50 text-text-secondary";
  let Icon = Clock;
  switch (status?.toUpperCase()) {
    case "LUNAS":
      style = "bg-success/10 text-success";
      Icon = CheckCircle;
      break;
    case "PENDING":
      style = "bg-yellow-500/10 text-yellow-500";
      Icon = Clock;
      break;
    case "BATAL":
      style = "bg-error/10 text-error";
      Icon = XCircle;
      break;
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${style}`}
    >
      <Icon size={14} /> {status}
    </span>
  );
};
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="p-4">
      <div className="h-4 w-3/4 rounded bg-light-gray/50"></div>
      <div className="h-3 w-1/2 mt-2 rounded bg-light-gray/50"></div>
    </td>
    <td className="p-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-light-gray/50"></div>
        <div className="h-4 w-20 rounded bg-light-gray/50"></div>
      </div>
    </td>
    <td className="p-4">
      <div className="h-4 w-1/2 ml-auto rounded bg-light-gray/50"></div>
    </td>
    <td className="p-4 text-center">
      <div className="h-6 w-20 mx-auto rounded-full bg-light-gray/50"></div>
    </td>
    <td className="p-4 text-center">
      <div className="h-8 w-8 mx-auto rounded-full bg-light-gray/50"></div>
    </td>
  </tr>
);

const LaporanTransaksi = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    total_penjualan: 0,
    jumlah_transaksi: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTrxId, setSelectedTrxId] = useState(null);
  const [filterKasir, setFilterKasir] = useState("");
  const [filterMetode, setFilterMetode] = useState("");
  const [users, setUsers] = useState([]);
  const { addToast } = useToast();

  // State baru untuk data cetak
  const [storeInfo, setStoreInfo] = useState({});
  const [transactionToPrint, setTransactionToPrint] = useState(null);

  useEffect(() => {
    apiClient
      .get("/users/")
      .then((res) => setUsers(res.data.results || res.data));
    apiClient
      .get("/transactions/store-info/")
      .then((res) => setStoreInfo(res.data));
  }, []);

  const fetchTransactions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage,
      page_size: ITEMS_PER_PAGE,
    });
    if (startDate) params.append("created_at__gte", startDate);
    if (endDate) params.append("created_at__lte", endDate);
    if (filterKasir) params.append("kasir", filterKasir);
    if (filterMetode) params.append("metode_pembayaran", filterMetode);

    apiClient
      .get(`/transactions/transaksi/?${params.toString()}`)
      .then((res) => {
        setTransactions(res.data.results || []);
        setTotalItems(res.data.count || 0);
        setSummary(
          res.data.summary || { total_penjualan: 0, jumlah_transaksi: 0 }
        );
      })
      .catch(() => addToast("error", "Gagal memuat laporan transaksi."))
      .finally(() => setLoading(false));
  }, [currentPage, startDate, endDate, filterKasir, filterMetode]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (transactionToPrint) {
      const timer = setTimeout(() => {
        window.print();
        setTransactionToPrint(null); // Reset setelah dialog cetak muncul
      }, 100); // Jeda singkat agar React sempat me-render struk
      return () => clearTimeout(timer);
    }
  }, [transactionToPrint]);

  const handleFilter = () => {
    if (currentPage !== 1) setCurrentPage(1);
    else fetchTransactions();
  };
  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setFilterKasir("");
    setFilterMetode("");
    if (currentPage !== 1) setCurrentPage(1);
  };
  const handleExport = () => {
    const params = new URLSearchParams();
    if (startDate) params.append("created_at__gte", startDate);
    if (endDate) params.append("created_at__lte", endDate);

    apiClient
      .get(`/transactions/export-transaksi-csv/?${params.toString()}`, {
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "laporan_transaksi.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(() => addToast("error", "Gagal mengekspor data."));
  };
  const handleOpenDetail = (trxId) => {
    setSelectedTrxId(trxId);
    setDetailModalOpen(true);
  };

  const handlePrint = (transaction) => {
    setTransactionToPrint(transaction);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const isFilterActive = startDate || endDate || filterKasir || filterMetode;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 sm:p-6"
    >
      {/* PERBAIKAN 1: Header dengan Ikon */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between sm:items-center gap-4"
      >
        <div className="text-3xl text-text-title flex items-center gap-3">
          <div className="bg-surface backdrop-blur-sm border border-light-gray/50 p-3 rounded-2xl shadow-lg">
                <FileText className="text-primary" />
          </div>
          <div>
                <h1 className="text-3xl font-bold text-text-title"> 
                  Laporan Transaksi
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Kelola dan cari semua laporan transaksi Anda.
                </p>
              </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg p-4"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-grow min-w-[150px]">
            <label className="text-sm font-semibold">Dari</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-style-modern w-full mt-1"
            />
          </div>
          <div className="flex-grow min-w-[150px]">
            <label className="text-sm font-semibold">Sampai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-style-modern w-full mt-1"
            />
          </div>
          <div className="flex-grow min-w-[150px]">
            <label className="text-sm font-semibold">Kasir</label>
            <select
              value={filterKasir}
              onChange={(e) => setFilterKasir(e.target.value)}
              className="input-style-modern w-full mt-1"
            >
              <option value="">Semua</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-grow min-w-[150px]">
            <label className="text-sm font-semibold">Metode Bayar</label>
            <select
              value={filterMetode}
              onChange={(e) => setFilterMetode(e.target.value)}
              className="input-style-modern w-full mt-1"
            >
              <option value="">Semua</option>
              <option value="Tunai">Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="Debit">Debit</option>
            </select>
          </div>

          {/* PERBAIKAN 2 & 3: Tombol Reset Kondisional dengan Gaya Baru & Tombol Export */}
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {isFilterActive && (
                <motion.button
                  initial={{ opacity: 0, width: 0 }}
                  animate={{
                    opacity: 1,
                    width: "auto",
                    marginLeft: "0.5rem",
                    marginRight: "0.5rem",
                  }}
                  exit={{ opacity: 0, width: 0, margin: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={handleResetFilter}
                  className="btn-secondary bg-error/10 text-error hover:bg-error/20 p-2.5 rounded-lg"
                  title="Reset Filter"
                >
                  <RotateCcw size={16} />
                </motion.button>
              )}
            </AnimatePresence>
            <button
              onClick={handleFilter}
              className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5"
            >
              <FilterIcon size={16} /> Terapkan
            </button>
            <button
              onClick={handleExport}
              className="btn-secondary p-2.5"
              title="Export ke CSV"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg shadow-primary/30 p-6 text-white">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white/80">Total Penjualan</h3>
            <DollarSign className="text-white/50" />
          </div>
          <p className="text-4xl font-extrabold mt-2">
            Rp{" "}
            {parseFloat(summary.total_penjualan || 0).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-text-secondary">
              Jumlah Transaksi
            </h3>
            <Hash className="text-text-secondary/50" />
          </div>
          <p className="text-4xl font-extrabold mt-2 text-accent">
            {summary.jumlah_transaksi || 0}
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/10">
              <tr>
                <th className="p-4 text-sm font-bold text-text-title tracking-wider">
                  DETAIL TRANSAKSI
                </th>
                <th className="p-4 text-sm font-bold text-text-title tracking-wider">
                  KASIR
                </th>
                <th className="p-4 text-sm font-bold text-text-title tracking-wider text-right">
                  TOTAL
                </th>
                <th className="p-4 text-sm font-bold text-text-title tracking-wider text-center">
                  STATUS
                </th>
                <th className="p-4 text-sm font-bold text-text-title tracking-wider text-center">
                  AKSI
                </th>
              </tr>
            </thead>
            <motion.tbody variants={containerVariants}>
              <AnimatePresence>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="text-center p-16 text-text-secondary">
                        <Inbox
                          size={48}
                          className="mx-auto mb-4 text-primary/50"
                        />
                        <h3 className="font-bold text-lg text-text-title">
                          Tidak Ada Transaksi
                        </h3>
                        <p>Tidak ada data yang cocok dengan filter Anda.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((trx) => {
                    const rowColor =
                      trx.status.toUpperCase() === "LUNAS"
                        ? "bg-success/5"
                        : "bg-transparent";
                    return (
                      <motion.tr
                        key={trx.nomor_transaksi}
                        variants={itemVariants}
                        exit={{ opacity: 0 }}
                        className={`border-b border-light-gray/50 last:border-b-0 odd:bg-transparent even:bg-light-gray/25 hover:bg-primary/10 transition-colors ${rowColor}`}
                      >
                        <td className="p-4">
                          <p className="font-bold font-mono text-text-title">
                            {trx.nomor_transaksi}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {new Date(trx.created_at).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-base">
                              {trx.kasir.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-text-main">
                              {trx.kasir.username}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-semibold font-mono text-right text-text-title">
                          Rp{" "}
                          {parseFloat(trx.total_setelah_diskon).toLocaleString(
                            "id-ID"
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge status={trx.status} />
                        </td>
                        {/* PERBAIKAN: Kolom Aksi dengan tombol terpisah */}
                        <td className="p-4">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleOpenDetail(trx.id)}
                              title="Lihat Detail"
                              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handlePrint(trx)}
                              title="Cetak Struk"
                              className="p-2 text-text-secondary hover:bg-light-gray/50 rounded-full"
                            >
                              <Printer size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
        {totalPages > 1 && !loading && (
          <div className="p-4 border-t border-light-gray/30 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </motion.div>

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        transactionId={selectedTrxId}
      />
      <div className="hidden print:block">
        <PrintableReceipt
          transaction={transactionToPrint}
          storeInfo={storeInfo}
        />
      </div>
    </motion.div>
  );
};

export default LaporanTransaksi;
