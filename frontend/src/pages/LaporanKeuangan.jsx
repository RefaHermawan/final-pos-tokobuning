import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, BarChart2, Inbox, PieChart, FileText, Download } from 'lucide-react';
import apiClient from '../api/axios';
import { toast } from 'react-toastify';
import ArusKasTab from '../components/laporankeuangan/ArusKasTab';
import LabaRugiTab from '../components/laporankeuangan/LabaRugiTab';

// Helper function untuk kalkulasi tanggal
const getDateRange = (range) => {
    const today = new Date();
    let startDate = new Date();
    const endDate = new Date().toISOString().substring(0, 10);

    if (range === 'today') {
        startDate = today;
    } else if (range === 'week') {
        startDate.setDate(today.getDate() - 6);
    } else if (range === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    return { startDate: startDate.toISOString().substring(0, 10), endDate };
};


const LaporanKeuangan = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('arus_kas');

    const fetchReport = useCallback(async () => {
        if (!startDate || !endDate) return;
        setLoading(true);
        setReportData(null);
        
        const endpoint = activeTab === 'arus_kas'
            ? `/transactions/laporan/arus-kas/`
            : `/transactions/laporan/laba-rugi/`;
            
        try {
            const response = await apiClient.get(`${endpoint}?start_date=${startDate}&end_date=${endDate}`);
            setReportData(response.data);
        } catch (err) {
            toast.error("Gagal memuat laporan.");
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, activeTab]);
    
    // Set tanggal default & fetch data saat komponen dimuat
    useEffect(() => {
        const { startDate, endDate } = getDateRange('month');
        setStartDate(startDate);
        setEndDate(endDate);
    }, []);

    const handleQuickFilter = (range) => {
        const { startDate, endDate } = getDateRange(range);
        setStartDate(startDate);
        setEndDate(endDate);
    };

    const handleExport = () => {
        if (!reportData) {
            toast.warn("Tidak ada data untuk diekspor.");
            return;
        }
        // Logika sederhana untuk export CSV dari data yang ada
        const headers = Object.keys(reportData.details || reportData);
        const values = Object.values(reportData.details || reportData);
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + values.join(",");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `laporan_${activeTab}_${startDate}_sd_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-surface/80 backdrop-blur-md border rounded-2xl shadow-lg p-5 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl"><BarChart2 size={28} className="text-primary" /></div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-title">Laporan Keuangan</h1>
                        <p className="text-sm text-text-secondary mt-1">Analisis kinerja keuangan bisnis Anda.</p>
                    </div>
                </div>

                {/* Tombol Tab */}
                <div className="flex border-b border-border-color">
                    <button onClick={() => setActiveTab('arus_kas')} className={`flex items-center gap-2 py-2 px-4 font-semibold ${activeTab === 'arus_kas' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}><PieChart size={16} /> Arus Kas</button>
                    <button onClick={() => setActiveTab('laba_rugi')} className={`flex items-center gap-2 py-2 px-4 font-semibold ${activeTab === 'laba_rugi' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}><FileText size={16} /> Laba Rugi</button>
                </div>
                
                {/* Panel Kontrol */}
                <div className="flex flex-wrap items-end gap-3 pt-2">
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleQuickFilter('today')} className="btn-chip">Hari Ini</button>
                        <button onClick={() => handleQuickFilter('week')} className="btn-chip">7 Hari</button>
                        <button onClick={() => handleQuickFilter('month')} className="btn-chip">Bulan Ini</button>
                    </div>
                    <div className="flex-grow min-w-[150px]"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-style" /></div>
                    <div className="flex-grow min-w-[150px]"><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} className="input-style" /></div>
                    <button onClick={fetchReport} disabled={loading} className="btn-primary"><BarChart2 size={16} />{loading ? 'Memuat...' : 'Tampilkan'}</button>
                    <button onClick={handleExport} className="btn-secondary"><Download size={16} /> Export</button>
                </div>
            </div>
                
                {/* Konten Laporan Utama (Layout Fokus Tunggal) */}
                <motion.div variants={itemVariants}>
                    {loading ? (
                        <div className="w-full min-h-[400px] bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg flex justify-center items-center">
                            <p className="flex items-center gap-3 text-text-secondary"><motion.div initial={{rotate:0}} animate={{rotate:360}} transition={{duration:1, repeat:Infinity, ease:'linear'}}><BarChart2 size={24} className="text-primary"/></motion.div> Memuat detail laporan...</p>
                        </div>
                    ) : reportData ? (
                        activeTab === 'arus_kas' 
                                ? <ArusKasTab data={reportData} loading={loading} />
                                : <LabaRugiTab data={reportData} loading={loading} />
                        ) : (   
                        <div className="w-full min-h-[400px] bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg flex flex-col justify-center items-center text-center text-text-secondary p-4">
                           <Inbox size={48} className="text-primary/50 mb-4"/>
                           <h3 className="font-bold text-lg text-text-title">Laporan Kosong</h3>
                           <p>Tidak ada data untuk ditampilkan. Silakan pilih rentang tanggal dan klik "Tampilkan Laporan".</p>
                       </div>
                    )}
                </motion.div>
            </motion.div>
    );
};

export default LaporanKeuangan;
