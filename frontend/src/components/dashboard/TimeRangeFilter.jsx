import React from 'react';
import { motion } from 'framer-motion';

const TimeRangeFilter = ({ selectedRange, onRangeChange }) => {
    const timeRanges = [
        { id: 'today', label: 'Hari Ini' },
        { id: 'week', label: '7 Hari' },
        { id: 'month', label: 'Bulan Ini' }
    ];

    return (
        <div className="bg-surface backdrop-blur-sm border border-light-gray/50 rounded-lg p-1 flex items-center space-x-1">
            {timeRanges.map(range => (
                <button 
                    key={range.id} 
                    onClick={() => onRangeChange(range.id)}
                    className={`relative px-3 py-1.5 text-sm font-bold rounded-md transition-colors duration-300 ${selectedRange === range.id ? 'text-white' : 'text-text-secondary hover:text-primary hover:bg-secondary/10'}`}
                >
                    {selectedRange === range.id && (
                        <motion.div 
                            layoutId="timeRangePill" 
                            className="absolute inset-0 bg-primary shadow" 
                            style={{ borderRadius: '0.375rem' }}
                        />
                    )}
                    <span className="relative z-10">{range.label}</span>
                </button>
            ))}
        </div>
    );
};

export default TimeRangeFilter;