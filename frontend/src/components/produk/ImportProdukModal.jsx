// src/components/produk/modal/ImportProdukModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, XCircle, LoaderCircle, Download } from 'lucide-react';
import apiClient from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';

const ImportProdukModal = ({ isOpen, onClose, onSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadState, setUploadState] = useState('idle'); 
    const [isUploading, setIsUploading] = useState(false); // State untuk tombol
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setSelectedFile(null);
            setUploadState('idle');
            setIsUploading(false);
        }
    }, [isOpen]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "text/csv") {
            setSelectedFile(file);
        } else {
            addToast('warning', <>Harap pilih file dengan format <span className="font-bold text-accent">.csv</span></>);
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            addToast('warning', <>Harap pilih <span className="font-bold text-accent">file CSV</span> terlebih dahulu.</>);
            return;
        }
        setUploadState('uploading');
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await apiClient.post('/products/import-produk-csv/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addToast('success', <>Produk berhasil <span className="font-bold text-success">diimpor!</span></>);
            onSuccess(); // Langsung panggil onSuccess untuk menutup modal & refresh
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Gagal mengimpor produk. Periksa format file Anda.";
            const fullError = err.response?.data ? JSON.stringify(err.response.data, null, 2) : "Tidak ada detail error."
            addToast('error', <><span className="font-bold">Gagal mengimpor:</span> {errorMessage}</>, fullError);
            setUploadState('idle'); // Reset ke state awal jika gagal
        } finally {
            setIsUploading(false);
        }
    };
    
    const contentVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    const renderContent = () => {
        switch(uploadState) {
            case 'uploading':
                return (
                    <motion.div key="uploading" variants={contentVariants} initial="initial" animate="animate" exit="exit" className="text-center p-8">
                        <LoaderCircle size={48} className="mx-auto text-primary animate-spin" />
                        <h3 className="text-lg font-bold text-text-title mt-4">Mengunggah File...</h3>
                        <p className="text-sm text-text-secondary mt-1">{selectedFile?.name}</p>
                        <div className="w-full bg-light-gray/50 rounded-full h-2 mt-4 overflow-hidden">
                            <motion.div 
                                className="h-2 bg-primary rounded-full"
                                initial={{ x: '-100%' }}
                                animate={{ x: '0%' }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>
                    </motion.div>
                );
            case 'idle':
            default:
                return (
                    <motion.div key="idle" variants={contentVariants} initial="initial" animate="animate" exit="exit" className="space-y-4 p-6">
                        <div className="border-2 border-dashed border-light-gray rounded-lg p-6 text-center bg-background/50 hover:border-primary transition-colors">
                            <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={handleFileChange} />
                            <label htmlFor="csv-upload" className="cursor-pointer">
                                <UploadCloud size={48} className="mx-auto text-primary/70" />
                                <p className="mt-2 text-sm text-text-main font-semibold">
                                    {selectedFile ? 'File siap diunggah:' : 'Klik atau seret file ke sini'}
                                </p>
                                {selectedFile && (
                                    <p className="font-bold text-accent flex items-center justify-center gap-2 mt-1">
                                        <FileText size={16} /> {selectedFile.name}
                                    </p>
                                )}
                            </label>
                        </div>
                        <div className="text-xs text-text-main text-center">
                            <p>Pastikan file CSV Anda memiliki header yang benar.</p>

                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-light-gray/50">
                             <motion.button type="button" onClick={onClose} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}} className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg">
                                Batal
                            </motion.button>
                             <motion.button onClick={handleUpload} disabled={isUploading || !selectedFile} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60">
                                {isUploading ? 'Mengunggah...' : 'Mulai Impor'}
                            </motion.button>
                        </div>
                    </motion.div>
                );
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Impor Produk dari CSV">
            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>
        </Modal>
    );
};

export default ImportProdukModal;