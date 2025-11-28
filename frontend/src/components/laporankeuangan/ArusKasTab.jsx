import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ArusKasTab = ({ data, loading }) => {
  if (loading) return <p className="text-center p-4">Memuat Laporan...</p>;
  // Pengecekan yang lebih aman: pastikan data dan data.details ada
  if (!data || !data.details) return null;

  const chartData = [
    { name: 'Arus Kas', 'Uang Masuk': data.total_cash_in, 'Uang Keluar': data.total_cash_out }
  ];

  return (
    <div className="border-t pt-4">
      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-100 p-4 rounded-lg"><h4 className="font-semibold text-green-800">Total Uang Masuk</h4><p className="text-2xl font-bold text-green-800">Rp {parseFloat(data.total_cash_in || 0).toLocaleString('id-ID')}</p></div>
        <div className="bg-red-100 p-4 rounded-lg"><h4 className="font-semibold text-red-800">Total Uang Keluar</h4><p className="text-2xl font-bold text-red-800">Rp {parseFloat(data.total_cash_out || 0).toLocaleString('id-ID')}</p></div>
        <div className="bg-blue-100 p-4 rounded-lg"><h4 className="font-semibold text-blue-800">Selisih Kas</h4><p className="text-2xl font-bold text-blue-800">Rp {parseFloat(data.net_cash_flow || 0).toLocaleString('id-ID')}</p></div>
      </div>

      {/* Rincian & Grafik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h4 className="font-bold text-lg mb-2">Rincian Arus Kas</h4>
          <div className="space-y-2">
            {/* Gunakan optional chaining (?.) untuk mengakses data dengan aman */}
            <div className="flex justify-between p-2 bg-green-50 rounded"><span>Penjualan Tunai</span><span className="font-semibold">Rp {parseFloat(data.details?.cash_sales || 0).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between p-2 bg-green-50 rounded"><span>Pembayaran Piutang</span><span className="font-semibold">Rp {parseFloat(data.details?.piutang_payments || 0).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between p-2 bg-red-50 rounded"><span>Pembayaran Hutang</span><span className="font-semibold">(Rp {parseFloat(data.details?.hutang_payments || 0).toLocaleString('id-ID')})</span></div>
            <div className="flex justify-between p-2 bg-red-50 rounded"><span>Biaya Operasional</span><span className="font-semibold">(Rp {parseFloat(data.details?.expenses || 0).toLocaleString('id-ID')})</span></div>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-2">Grafik Arus Kas</h4>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="name" hide /><Tooltip /><Legend />
                <Bar dataKey="Uang Masuk" fill="#38A169" />
                <Bar dataKey="Uang Keluar" fill="#E53E3E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArusKasTab;