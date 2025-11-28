// src/components/header/NotificationBell.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import apiClient from "../../api/axios";
import { motion } from "framer-motion";

const NotificationBell = () => {
  const [lowStockCount, setLowStockCount] = useState(0);
  useEffect(() => {
    apiClient
      .get("/products/laporan/stok-rendah/count/")
      .then((res) => setLowStockCount(res.data.count))
      .catch((err) => console.error("Gagal fetch low stock count", err));
  }, []);

  return (
    <Link
      to="/stok?tab=laporan"
      className="relative p-2 rounded-full hover:bg-secondary/10 transition-colors"
      title="Laporan Stok Rendah"
    >
      <motion.div
        whileHover={{ rotate: [0, 15, -10, 15, 0] }}
        transition={{ duration: 0.5 }}
      >
        <Bell size={24} className="text-primary" />
      </motion.div>
      {lowStockCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
            {lowStockCount}
          </span>
        </span>
      )}
    </Link>
  );
};
export default NotificationBell;
