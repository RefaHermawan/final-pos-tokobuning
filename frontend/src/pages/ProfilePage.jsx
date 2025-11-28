import React, {useState , useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'; // Impor LineChart
import apiClient from '../api/axios';
import { useToast } from '../hooks/useToast';
import { User, Lock, Save, UserCircle, Edit, TrendingUp, ShoppingCart, Mail, Shield, ShieldCheck, Eye, EyeOff, Check } from 'lucide-react';

// --- Komponen-komponen ---

// Skeleton Loader yang disesuaikan dengan layout baru yang dramatis
const ProfilePageSkeleton = () => (
    <div className="space-y-6 p-4 sm:p-6 animate-pulse">
        <div className="h-12 bg-light-gray/50 rounded-lg w-1/3"></div>
        <div className="bg-surface/80 rounded-2xl h-72 relative flex flex-col justify-end">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-light-gray/50 border-8 border-surface"></div>
        </div>
        <div className="h-64 bg-surface/80 rounded-2xl"></div>
    </div>
);

// Form Ganti Password (dipisah untuk kebersihan)
const ChangePasswordForm = () => {
    const [formData, setFormData] = useState({ old_password: '', new_password1: '', new_password2: '' });
    const [isSaving, setIsSaving] = useState(false);
    // State baru untuk fitur tampilkan/sembunyikan password
    const [showPassword, setShowPassword] = useState(false);
    const { addToast } = useToast();

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.new_password1 !== formData.new_password2) {
            addToast("error", "Password baru tidak cocok!");
            return;
        }
        setIsSaving(true);
        try {
            await apiClient.post('/auth/password/change/', formData);
            addToast("success", "Password berhasil diubah.");
            setFormData({ old_password: '', new_password1: '', new_password2: '' });
        } catch (err) {
            addToast("error", "Gagal mengubah password. Periksa kembali password lama Anda.");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
            {/* 1. Layout Panel Keamanan (Dua Kolom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kolom Kiri: Panduan Keamanan */}
                <div className="text-text-secondary">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-primary" size={24}/>
                        <h3 className="text-lg font-bold text-text-title">Keamanan Akun Anda</h3>
                    </div>
                    <p className="text-sm mt-4 mb-4">
                        Untuk menjaga keamanan akun, gunakan password yang kuat dan unik.
                    </p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><Check size={16} className="text-success"/> Minimal 8 karakter</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-success"/> Kombinasi huruf & angka</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-success"/> Sertakan huruf besar/kecil</li>
                    </ul>
                </div>

                {/* Kolom Kanan: Form Input */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-text-main mb-1 block">Password Lama</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <input type="password" name="old_password" value={formData.old_password} onChange={handleChange} placeholder="••••••••" required className="input-style-modern pl-11 bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-text-main mb-1 block">Password Baru</label>
                        <div className="relative">
                             <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                             {/* 2. Interaktivitas Tampilkan/Sembunyikan Password */}
                            <input type={showPassword ? 'text' : 'password'} name="new_password1" value={formData.new_password1} onChange={handleChange} placeholder="Password baru yang kuat" required className="input-style-modern pl-11 pr-11 bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"/>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary">
                                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-text-main mb-1 block">Konfirmasi Password Baru</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <input type={showPassword ? 'text' : 'password'} name="new_password2" value={formData.new_password2} onChange={handleChange} placeholder="Ulangi password baru" required className="input-style-modern pl-11 pr-11 bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"/>
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary">
                                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <motion.button type="submit" disabled={isSaving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60">
                            <Save size={16} />{isSaving ? "Menyimpan..." : "Simpan Password"}
                        </motion.button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};


// --- Halaman Utama ---
const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('password');
  const { addToast } = useToast();

  useEffect(() => {
    apiClient.get('/users/profil/')
      .then(res => setProfileData(res.data))
      .catch(() => addToast("error", "Gagal memuat data profil."))
      .finally(() => setLoading(false));
  }, []);
  
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: {type: 'spring', stiffness: 100} } };

  if (loading) return <ProfilePageSkeleton />;
  if (!profileData) return <div className="p-6 text-center text-error">Gagal memuat profil. Silakan coba lagi.</div>;

  // Dummy data untuk mini chart, ganti dengan data asli dari API jika ada
  const weeklyActivity = [
      { day: 'Sen', transaksi: 5 }, { day: 'Sel', transaksi: 8 },
      { day: 'Rab', transaksi: 6 }, { day: 'Kam', transaksi: 10 },
      { day: 'Jum', transaksi: 9 }, { day: 'Sab', transaksi: 15 },
      { day: 'Min', transaksi: 12 },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-accent/10 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tl from-accent/20 to-primary/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 p-4 sm:p-6">
        
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-text-title flex items-center gap-3"><UserCircle className="text-primary"/> Profil Pengguna</h1>
          <p className="mt-1 text-text-secondary">Kelola informasi dan keamanan akun Anda.</p>
        </motion.div>
        
        {/* 1. "Hero Banner" dengan Latar Belakang Kustom & Avatar 3D */}
        <motion.div 
          variants={itemVariants} 
          className="relative rounded-3xl shadow-lg p-6 pt-20 text-center bg-surface backdrop-blur-md border border-light-gray/50"
        >
            {/* Avatar "Melayang" dengan Efek Glow */}
            <motion.div 
                initial={{scale:0.5, y:0}}
                animate={{scale:1, y:-64}}
                transition={{type:'spring', stiffness:120, damping:10, delay: 0.3}}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-6xl shadow-2xl ring-8 ring-background"
            >
                 <div className="absolute inset-0 rounded-full bg-transparent"></div>
                 <span className="z-10">{profileData.user.username.charAt(0).toUpperCase()}</span>
                 {/* Efek Glow */}
                 <div className="absolute inset-0 rounded-full ring-4 ring-primary/20 animate-ping opacity-75"></div>
            </motion.div>

            <h2 className="text-4xl font-bold text-text-title">{profileData.user.username}</h2>
            <p className="text-accent capitalize font-semibold tracking-widest">{profileData.user.role}</p>
            <p className="text-sm text-secondary mt-2 flex items-center justify-center gap-2"><Mail size={14}/> {profileData.user.email || 'Email tidak diatur'}</p>

            {/* Statistik sebagai "Widget Mengambang" & Grafik Aktivitas Personal */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Statistik Penjualan */}
                <div className="bg-background p-4 rounded-xl border border-light-gray/50 shadow-sm">
                    <p className="text-sm font-semibold text-text-secondary flex items-center justify-center gap-2"><TrendingUp size={16}/> Penjualan Bulan Ini</p>
                    <p className="text-3xl font-bold text-success mt-1">Rp {parseFloat(profileData.stats.total_penjualan_bulan_ini || 0).toLocaleString('id-ID')}</p>
                </div>
                {/* Statistik Transaksi */}
                <div className="bg-background p-4 rounded-xl border border-light-gray/50 shadow-sm">
                    <p className="text-sm font-semibold text-text-secondary flex items-center justify-center gap-2"><ShoppingCart size={16}/> Transaksi Bulan Ini</p>
                    <p className="text-3xl font-bold text-accent mt-1">{profileData.stats.jumlah_transaksi_bulan_ini || 0}</p>
                </div>
                 {/* Grafik Aktivitas Mingguan */}
                <div className="md:col-span-1 h-28 bg-background p-2 rounded-xl border border-light-gray/50 shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyActivity} margin={{ top: 15, right: 10, left: -10, bottom: -5 }}>
                            <XAxis className='text-xs' dataKey="day" stroke="var(--color-text-secondary)" /> 
                            <YAxis className='text-xs' stroke="var(--color-text-secondary)" />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border:'1px solid var(--color-light-gray)', borderRadius:'0.5rem' }}/>
                            <Line type="monotone" dataKey="transaksi" className='text-primary' strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <div className="border-b border-light-gray/30 p-2">
                <button className="relative px-4 py-2 text-sm font-bold text-primary rounded-lg">
                    <motion.div layoutId="profileTabPill" className="absolute inset-0 bg-primary/10" style={{borderRadius: '0.5rem'}}/>
                    <span className="relative z-10 flex items-center gap-2"><Lock size={16}/> Keamanan Akun</span>
                </button>
            </div>
            <ChangePasswordForm />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;