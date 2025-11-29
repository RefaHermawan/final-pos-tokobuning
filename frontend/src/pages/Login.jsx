// src/pages/Login.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/authContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  User,
  Lock,
  LogIn,
  ShoppingBasket,
  LoaderCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";
import loginImage from "../assets/Toko-Bu-Ning-2.png";
import LoginFooter from "../components/ui/LoginFooter";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  // State untuk loading dan error, dikelola di dalam komponen ini
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Selalu reset error saat mencoba login lagi

    try {
      await login(username, password);
      // Jika login berhasil, AuthContext akan menangani navigasi
    } catch (err) {
      // Jika login gagal, AuthContext akan melempar error, kita tangkap di sini
      setError(err.message);
      setIsLoading(false); // Hentikan loading saat ada error
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.1, duration: 0.5 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <div className="relative flex items-center justify-center min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 -z-10 login-background-grid"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl m-4 grid md:grid-cols-2 grid-cols-1 bg-surface backdrop-blur-xl border border-light-gray/50 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="absolute top-4 right-4 z-10 border border-light-gray/50 rounded-full">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-surface hover:bg-primary/10 transition-colors shadow-inner shadow-black/15" 
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-slate-700" />
            )}
          </button>
        </div>
        {/* Panel Kiri: Ilustrasi */}
        <div className="hidden md:block relative">
          <img
            src={loginImage}
            alt="Toko Bu Ning"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10 p-8 flex flex-col justify-end">
            <h3 className="text-3xl font-bold text-white leading-tight">
              Selamat Datang Kembali!
            </h3>
            <p className="text-white/80 mt-2">
              Satu platform untuk semua kebutuhan Point of Sale Anda.
            </p>
          </div>
        </div>

        {/* Panel Kanan: Form Login */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <ShoppingBasket className="text-primary" size={32} />
            <h2 className="text-3xl font-extrabold text-text-title">
              Toko Bu Ning
            </h2>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-text-secondary mb-7 text-center"
          >
            Silakan masuk untuk melanjutkan ke dasbor Anda.
          </motion.p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Tampilkan pesan error jika ada */}
            {error && (
              <motion.p
                variants={itemVariants}
                className="text-sm text-error text-center bg-error/10 p-1 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <motion.div variants={itemVariants}>
              <label
                htmlFor="username"
                className="text-sm font-semibold text-text-main"
              >
                Username
              </label>
              <div className="relative mt-2">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  placeholder="Masukkan username"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-text-main"
              >
                Password
              </label>
              {/* --- PERUBAHAN UTAMA DI SINI --- */}
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  id="password"
                  name="password"
                  // Tipe input berubah berdasarkan state showPassword
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  placeholder="Masukkan password"
                />
                {/* Tombol untuk toggle visibilitas password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                  title={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-primary to-primary/80 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin" size={20} />
                ) : (
                  <LogIn size={18} />
                )}
                <span>{isLoading ? "Memproses..." : "Login"}</span>
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
            <LoginFooter />
    </div>
  );
};

export default Login;
