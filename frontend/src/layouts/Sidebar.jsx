// src/layouts/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Truck,
  Package,
  Users,
  Settings,
  LogOut,
  Store,
  ChevronsLeft,
  ChevronsRight,
  BookUser,
  Landmark,
  Archive,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuGroups = [
  {
    title: "UTAMA",
    links: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
        exact: true,
        roles: ["admin", "kasir"],
      },
      {
        name: "Kasir",
        path: "/kasir",
        icon: ShoppingCart,
        roles: ["admin", "kasir"],
      },
    ],
  },
  {
    title: "MANAJEMEN",
    links: [
      { name: "Produk", path: "/produk", icon: Package, roles: ["admin"] },
      { name: "Stok", path: "/stok", icon: Archive, roles: ["admin"] },
      { name: "Supplier", path: "/supplier", icon: Truck, roles: ["admin"] },
    ],
  },
  {
    title: "LAPORAN",
    links: [
      {
        name: "Laporan Transaksi",
        path: "/laporan/transaksi",
        icon: BarChart3,
        roles: ["admin"],
      },
      { name: "Kasbon", path: "/kasbon", icon: BookUser, roles: ["admin"] },
    ],
  },
];

const settingsLink = {
  name: "Pengaturan",
  path: "/pengaturan",
  icon: Settings,
  roles: ["admin"],
};

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { logout, user } = useAuth();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? "5.5rem" : "16rem" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative flex-shrink-0 bg-background backdrop-blur-xl border-r border-light-gray flex flex-col shadow-xs z-40"
    >
      <div className="h-20 flex items-center justify-center flex-shrink-0 px-4 border-b border-light-gray overflow-hidden">
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          className="cursor-pointer"
        >
          <Store className="w-9 h-9 text-primary flex-shrink-0" />
        </motion.div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="ml-3 overflow-hidden"
            >
              <h1 className="text-xl font-bold text-text-title tracking-tight whitespace-nowrap">
                Toko Bu Ning
              </h1>
              <p className="text-xs text-text-secondary whitespace-nowrap">
                Point of Sale
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-20 -right-3 bg-surface backdrop-blur-md text-primary w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10 border-2 border-primary hover:border-primary"
        title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
      >
        {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </button>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto overflow-x-hidden">
        {menuGroups.map((group) => {
          // 2. Saring link berdasarkan peran pengguna
          const allowedLinks = group.links.filter(
            (link) => user && link.roles.includes(user.role)
          );

          // Jika tidak ada link yang diizinkan di grup ini, jangan render grupnya sama sekali
          if (allowedLinks.length === 0) {
            return null;
          }

          return (
            <div key={group.title} className={isCollapsed ? "mb-4" : ""}>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-3 mb-2 text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap"
                  >
                    {group.title}
                  </motion.h3>
                )}
              </AnimatePresence>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link.name} title={isCollapsed ? link.name : ""}>
                    <NavLink to={link.path} end={link.exact}>
                      {({ isActive }) => (
                        <div
                          className={`flex items-center gap-3 py-2.5 rounded-lg transition-colors duration-200 relative group ${
                            isCollapsed ? "px-3 justify-center" : "px-4"
                          } ${!isActive && "hover:bg-primary/5"}`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="active-sidebar-indicator"
                              className="absolute inset-0 bg-primary/20 border border-black/10 rounded-lg shadow-inner shadow-black/10"
                            />
                          )}
                          <link.icon
                            className={`w-5 h-5 flex-shrink-0 z-10 transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-text-secondary group-hover:text-primary"
                            }`}
                          />
                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className={`font-semibold text-sm whitespace-nowrap z-10 transition-colors ${
                                  isActive
                                    ? "text-primary"
                                    : "text-text-secondary group-hover:text-primary"
                                }`}
                              >
                                {link.name}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="flex-shrink-0 p-3 mt-auto border-t border-white/5">
        {/* PASTIKAN BAGIAN INI SUDAH BENAR */}
        {user && settingsLink.roles.includes(user.role) && (
          <NavLink to="/pengaturan">
            {({ isActive }) => (
              <div
                className={`flex items-center w-full py-2 rounded-lg transition-colors group mt-2 ${
                  isCollapsed ? "px-2.5 justify-center" : "px-3 gap-3"
                } ${
                  isActive
                    ? "bg-primary/10"
                    : "text-text-secondary hover:bg-primary/5"
                }`}
              >
                <Settings
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-text-secondary group-hover:text-primary"
                  }`}
                />
                {!isCollapsed && (
                  <span
                    className={`font-semibold text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-text-secondary group-hover:text-primary"
                    }`}
                  >
                    Pengaturan
                  </span>
                )}
              </div>
            )}
          </NavLink>
        )}
        {/* Tombol Logout adalah <button>, jadi tidak punya state 'isActive' */}
        <button
          onClick={logout}
          className={`flex items-center w-full py-2 mt-1 rounded-lg text-error hover:bg-error/10 transition-colors ${
            isCollapsed ? "px-2.5 justify-center" : "px-3 gap-3"
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-semibold text-sm whitespace-nowrap">
              Logout
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
