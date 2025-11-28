import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

const DifferenceDisplay = ({ value }) => {
    if (value === null || value === undefined || value === 0) {
        return <div className="text-sm font-medium text-text-secondary h-8 flex items-center justify-center">-</div>;
    }

    const isPositive = value > 0;
    const formattedValue = (isPositive ? '+' : '') + (Number.isInteger(value) ? value : value.toFixed(2));
    const style = isPositive ? "text-success" : "text-error";
    const Icon = isPositive ? ArrowUp : ArrowDown;

    return (
        <motion.div
            key={formattedValue}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`flex items-center justify-center gap-2 font-bold text-lg ${style}`}
        >
            <Icon size={20} />
            <span>{formattedValue}</span>
        </motion.div>
    );
};

export default DifferenceDisplay; // <-- JANGAN LUPA INI!