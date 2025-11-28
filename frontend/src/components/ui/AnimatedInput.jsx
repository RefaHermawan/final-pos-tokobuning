// src/components/ui/AnimatedInput.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedInput = ({ id, label, value, onChange, type = 'text', icon: Icon, required = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.length > 0;

    const labelVariants = {
        inactive: { 
            y: 0, 
            scale: 1, 
            color: 'var(--color-text-secondary)',
            x: '2.75rem' // 44px, untuk berada di kanan ikon
        },
        active: { 
            y: -24, 
            scale: 0.85, 
            color: 'var(--color-primary)',
            x: 0,
            backgroundColor: 'var(--color-surface)',
            paddingLeft: '0.25rem',
            paddingRight: '0.25rem',
        }
    };

    return (
        <div className="relative">
            <div className="relative">
                <AnimatePresence>
                    <motion.label
                        htmlFor={id}
                        variants={labelVariants}
                        initial="inactive"
                        animate={isFocused || hasValue ? 'active' : 'inactive'}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="absolute top-1/2 -translate-y-1/2 pointer-events-none origin-left"
                    >
                        {label}
                    </motion.label>
                </AnimatePresence>

                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary z-10" />}

                <input
                    id={id}
                    name={id}
                    type={type}
                    required={required}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full pl-12 pr-4 py-3 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                />
            </div>
        </div>
    );
};

export default AnimatedInput;