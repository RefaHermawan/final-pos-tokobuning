import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../api/axios";
import {
  Wallet,
  ShoppingCart,
  Package,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../hooks/useToast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Impor semua komponen yang sudah dipisah
import KpiCard from "../components/dashboard/KPICard";
import TimeRangeFilter from "../components/dashboard/TimeRangeFilter";
import RevenueChart from "../components/dashboard/RevenueChart";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import BestSellersWidget from "../components/dashboard/BestSellersWidget";
import RecentActivityWidget from "../components/dashboard/RecentActivityWidget";
import PaymentMethodChart from "../components/dashboard/PaymentMethodChart"; // <-- IMPOR KOMPONEN BARU

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("today");
  const { addToast } = useToast();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(
          `/transactions/dashboard-stats/?range=${timeRange}`
        );
        setStats(res.data);
      } catch (err) {
        setError("Gagal memuat data dashboard.");
        addToast("error", "Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [timeRange]);

  const paymentChartData = useMemo(() => {
    if (!stats?.payment_method_summary) return [];

    // API mengembalikan 'metode_pembayaran', chart butuh 'name'
    return stats.payment_method_summary.map((item) => ({
      name: item.metode_pembayaran,
      total: parseFloat(item.total),
    }));
  }, [stats]);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  if (loading && !stats) return <DashboardSkeleton />;
  if (error) return <div className="text-center text-error p-10">{error}</div>;

  return (
    <div className="relative min-h-screen">
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
          <div>
            <h1 className="text-3xl font-bold text-text-title">
              Selamat Datang Kembali!
            </h1>
            <p className="mt-1 text-text-secondary">
              Ringkasan aktivitas toko Anda pada{" "}
              <span className="text-accent">{today}</span>.
            </p>
          </div>
          <TimeRangeFilter
            selectedRange={timeRange}
            onRangeChange={setTimeRange}
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <KpiCard
            title="Pendapatan"
            value={stats?.revenue?.value ?? 0}
            icon={Wallet}
            trend={stats?.revenue?.trend ?? 0}
            trendText={stats?.revenue?.trend_text ?? "-"}
            isCurrency={true}
          />
          <KpiCard
            title="Transaksi"
            value={stats?.total_transactions?.value ?? 0}
            icon={ShoppingCart}
            trend={stats?.total_transactions?.trend ?? 0}
            trendText={stats?.total_transactions?.trend_text ?? "-"}
          />
          <KpiCard
            title="Item Terjual"
            value={stats?.items_sold?.value ?? 0}
            icon={Package}
            trend={stats?.items_sold?.trend ?? 0}
            trendText={stats?.items_sold?.trend_text ?? "-"}
          />
          <KpiCard
            title="Stok Kritis"
            value={stats?.low_stock_items?.value ?? 0}
            icon={AlertCircle}
            trend={stats?.low_stock_items?.trend ?? 0}
            trendText={stats?.low_stock_items?.trend_text ?? "-"}
          />
        </motion.div>

        {/* --- STRUKTUR LAYOUT BARU DIMULAI DI SINI --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Kolom Kiri (Besar): Tumpukan Grafik */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            <motion.div variants={itemVariants}>
              <RevenueChart
                data={stats?.revenue_chart_data ?? []}
                totalRevenue={stats?.revenue?.value ?? 0}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <PaymentMethodChart
                data={paymentChartData}
                loading={loading}
              />
            </motion.div>
          </div>

          {/* Kolom Kanan (Kecil): Tumpukan Widget yang Meregang */}
          <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
            <motion.div variants={itemVariants} className="flex-1">
              <BestSellersWidget
                items={stats?.best_sellers ?? []}
                loading={loading}
                className="h-full"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex-1">
              <RecentActivityWidget
                activities={stats?.recent_activities ?? []}
                loading={loading}
                className="h-full"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
