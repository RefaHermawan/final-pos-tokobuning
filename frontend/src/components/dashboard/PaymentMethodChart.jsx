import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { CreditCard, Inbox } from 'lucide-react';

// Warna-warna ini akan diambil dari palet tema Anda
const COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-secondary)', 'var(--color-text-secondary)'];

const SkeletonLoader = () => (
    <div className="flex justify-center items-center h-full animate-pulse">
        <div className="w-48 h-48 bg-light-gray/50 rounded-full"></div>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
        <Inbox size={32} className="mb-2 text-secondary" />
        <p className="text-sm font-semibold">Tidak ada data pembayaran.</p>
    </div>
);

const PaymentMethodChart = ({ data, loading }) => {
  return (
    <div className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg h-full flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-light-gray/50">
        <CreditCard className="text-primary" size={20} />
        <h3 className="text-lg font-bold text-text-title">Metode Pembayaran</h3>
      </div>
      <div className="w-full h-64 flex-grow p-4">
        {loading ? <SkeletonLoader /> : !data || data.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer>
            <PieChart>
              <Pie 
                data={data} 
                dataKey="total" 
                nameKey="name" 
                cx="50%" cy="50%" 
                innerRadius={60} outerRadius={80} 
                fill="#8884d8" 
                paddingAngle={5}
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`Rp ${value.toLocaleString('id-ID')}`, name]}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '0.75rem' }}
              />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodChart;