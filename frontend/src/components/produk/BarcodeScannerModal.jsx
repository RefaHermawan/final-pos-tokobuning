import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Modal from '../ui/Modal';
import { motion } from 'framer-motion';
import clsx from 'clsx'; // 1. Import clsx

const BarcodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let scannerInstance = null;
    if (isOpen && isScanning) {
      const timeoutId = setTimeout(() => {
        if (document.getElementById('barcode-reader-container') && !scannerInstance) {
          scannerInstance = new Html5QrcodeScanner(
            'barcode-reader-container', 
            { fps: 10, qrbox: { width: 330, height: 180 }, rememberLastUsedCamera: true, supportedScanTypes: [0] },
            false
          );
          const successCallback = (decodedText) => {
            if (scannerInstance) {
              scannerInstance.clear().catch(error => { console.error("Gagal membersihkan scanner setelah sukses.", error); });
              scannerInstance = null;
            }
            onScanSuccess(decodedText);
          };
          const errorCallback = (error) => { /* Abaikan */ };
          scannerInstance.render(successCallback, errorCallback);
        }
      }, 100);
      return () => { clearTimeout(timeoutId); };
    }
    return () => {
      if (scannerInstance) {
        scannerInstance.clear().catch(error => { console.warn("Peringatan saat cleanup scanner:", error); });
        scannerInstance = null;
      }
    };
  }, [isOpen, isScanning, onScanSuccess]);

  const toggleScanning = () => {
    setIsScanning(!isScanning);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Barcode" className="max-w-md">
      <div className="mx-auto p-5 bg-surface backdrop-blur-sm border border-light-gray/50 rounded-2xl shadow-lg">
        <div className="relative">
          {/* 2. Gunakan clsx untuk menggabungkan kelas secara dinamis */}
          <div 
            id="barcode-reader-container" 
            className={clsx(
                "relative w-full h-full rounded-lg overflow-hidden transition-all duration-300 shadow-lg",
                isScanning ? 'ring-2 ring-light-gray/50' : 'ring-1 ring-light-gray/50'
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
              <div className="absolute w-56 h-32 border-2 border-light-gray/50 rounded-lg shadow-lg"></div>
              {isScanning && (
                <motion.div
                  className="absolute w-56 h-0.5 bg-success rounded-full z-10"
                  initial={{ y: -60 }}
                  animate={{ y: 60 }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                />
              )}
            </div>

            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-sm"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-sm"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl-sm"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white rounded-br-sm"></div>

            {!isScanning && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                <div className="text-white text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full">
                  Scanning Paused
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={clsx(
                  "w-2 h-2 rounded-full",
                  isScanning ? 'bg-success animate-pulse' : 'bg-light-gray'
              )}></div>
              <span className="text-xs text-text-secondary font-medium">
                {isScanning ? 'Kamera Aktif' : 'Kamera Dijeda'}
              </span>
            </div>

            <button
              onClick={toggleScanning}
              className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  isScanning 
                        ? 'bg-error/10 text-error hover:bg-error/20 border border-light-gray/50' 
                        : 'bg-success/10 text-success hover:bg-success/20 border border-light-gray/50'
              )}
            >
              {isScanning ? 'Jeda' : 'Lanjutkan'}
            </button>
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-xs text-text-secondary">
            Arahkan barcode ke dalam bingkai untuk memindai secara otomatis.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default BarcodeScannerModal;