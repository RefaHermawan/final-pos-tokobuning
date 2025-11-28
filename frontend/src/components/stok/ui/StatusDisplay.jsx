import React from "react";
import { AlertTriangle, RotateCcw, Loader, Package, Inbox, Truck } from 'lucide-react';


const StatusDisplay = ({ isLoading, isEmpty, forMobile = false }) => {
    if (!isLoading && !isEmpty) return null;

    const content = isLoading ? (
        <>
            <Loader size={32} className="animate-spin text-primary" />
            <span className="mt-3">Memuat laporan...</span>
        </>
    ) : (
        <>
            <Inbox size={48} className="text-secondary" />
            <h3 className="font-bold text-lg text-text-title mt-4">Semua Stok Aman</h3>
            <p className="text-sm">Tidak ada produk yang berada di bawah batas stok rendah saat ini.</p>
        </>
    );

    if (forMobile) {
        return (
            <div className="w-full col-span-full flex flex-col items-center justify-center gap-2 p-16 text-text-secondary">
                {content}
            </div>
        );
    }

    return (
        <tr>
            <td colSpan="4" className="text-center p-16">
                <div className="flex flex-col items-center justify-center gap-2 text-text-secondary">
                    {content}
                </div>
            </td>
        </tr>
    );
};

export default StatusDisplay;