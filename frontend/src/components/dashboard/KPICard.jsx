import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AnimatedNumber = ({ value, isCurrency = false }) => {
    const motionValue = useMotionValue(0);
    const rounded = useTransform(motionValue, latest => Math.round(latest));
    const displayText = useTransform(rounded, latest => 
        isCurrency ? `Rp ${latest.toLocaleString('id-ID')}` : latest.toLocaleString('id-ID')
    );

    useEffect(() => {
        const controls = animate(motionValue, value, { duration: 1.5, ease: [0.1, 0.7, 0.3, 1] });
        return controls.stop;
    }, [value]);

    return <motion.span>{displayText}</motion.span>;
};

const KpiCard = ({ title, value, icon: Icon, trend, trendText, isCurrency }) => {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
    };

    return (
        <motion.div 
            variants={itemVariants} 
            className="bg-surface backdrop-blur-sm border border-light-gray/50 p-4 rounded-xl shadow-lg h-full flex flex-col justify-between"
        >
            <div>
                <div className="flex justify-between items-center text-text-secondary">
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <Icon className="text-primary" size={18} />
                </div>
                <p className="text-accent text-2xl font-extrabold mt-2">
                    <AnimatedNumber value={value} isCurrency={isCurrency} />
                </p>
            </div>
            <p className={`flex items-center text-xs mt-1 ${trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-text-secondary'}`}>
                {trend !== 0 && (trend > 0 ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>)}
                <span>{trendText}</span>
            </p>
        </motion.div>
    );
};

export default KpiCard;