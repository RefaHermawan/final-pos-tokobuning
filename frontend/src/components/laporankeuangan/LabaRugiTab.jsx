// src/components/laporan/LabaRugiTab.jsx
import React from 'react';

const LabaRugiTab = ({ data, loading }) => {
  if (loading) return <p className="text-center p-4">Memuat Laporan...</p>;
  if (!data) return null;

  return (
    <div className="border-t pt-4 grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Kolom Kiri: Ringkasan Laba Rugi */}
      <div className="lg:col-span-3 bg-surface p-6 rounded-2xl shadow-inner border">
        <h3 className="text-xl font-bold mb-4">Ringkasan Laba Rugi</h3>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between"><span>Penjualan Kotor</span><span className="font-semibold">Rp {parseFloat(data.gross_sales).toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between"><span>Harga Pokok Penjualan (HPP)</span><span className="font-semibold">(Rp {parseFloat(data.cogs).toLocaleString('id-ID')})</span></div>
          <hr/>
          <div className="flex justify-between text-base"><span className="font-bold">Laba Kotor</span><span className="font-bold text-lg">Rp {parseFloat(data.gross_profit).toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between"><span>Total Biaya Operasional</span><span className="font-semibold">(Rp {parseFloat(data.operational_expenses).toLocaleString('id-ID')})</span></div>
          <hr className="border-accent border-dashed"/>
          <div className="flex justify-between bg-accent/10 p-4 rounded-lg"><span className="text-xl font-bold text-accent">Laba Bersih</span><span className="text-2xl font-bold text-accent">Rp {parseFloat(data.net_profit).toLocaleString('id-ID')}</span></div>
        </div>
      </div>

      {/* Kolom Kanan: Tabel Rincian Biaya */}
      <div className="lg:col-span-2 bg-surface p-6 rounded-2xl shadow-inner border">
        <h3 className="text-xl font-bold mb-4">Rincian Biaya Operasional</h3>
        <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Tanggal</th>
                        <th className="py-2">Keterangan</th>
                        <th className="py-2 text-right">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    {data.expense_details?.map(expense => (
                        <tr key={expense.id} className="border-b">
                            <td className="py-2">{expense.tanggal}</td>
                            <td className="py-2">{expense.keterangan}</td>
                            <td className="py-2 text-right">Rp {parseFloat(expense.jumlah).toLocaleString('id-ID')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default LabaRugiTab;