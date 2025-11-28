import React, { useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

// Komponen Angka Animasi
const AnimatedNumber = ({ value }) => {
    const motionValue = useMotionValue(0);
    const rounded = useTransform(motionValue, latest => Math.round(latest));
    const displayText = useTransform(rounded, latest => `Rp ${latest.toLocaleString('id-ID')}`);
    useEffect(() => {
        const controls = animate(motionValue, value, { duration: 1.5, ease: [0.1, 0.7, 0.3, 1] });
        return controls.stop;
    }, [value]);
    return <motion.span>{displayText}</motion.span>;
};

const RevenueChart = ({ data, totalRevenue }) => {
    return (
        <div className="bg-surface backdrop-blur-md border border-light-gray/50 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-text-title">Grafik Pendapatan</h3>
                    <p className="text-sm text-text-secondary">Berdasarkan rentang waktu yang dipilih</p>
                </div>
                <div className="text-right">
                     <h4 className="text-sm font-semibold text-text-secondary">Total Pendapatan</h4>
                     <p className="text-3xl font-extrabold text-accent">
                        <AnimatedNumber value={totalRevenue} />
                     </p>
                </div>
            </div>
            <div style={{ width: '100%', height: 325 }}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${(value/1000)}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem' }}
                            labelStyle={{ color: 'var(--color-text-title)' }}
                            itemStyle={{ color: 'var(--color-text-main)' }}
                        />
                        <Area type="monotone" dataKey="total_pendapatan" stroke="var(--color-primary)" fill="url(#colorRevenue)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;