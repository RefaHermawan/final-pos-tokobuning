// src/components/header/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-full hover:bg-secondary/10 transition-colors relative w-10 h-10 flex items-center justify-center" 
      title="Ganti Tema"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme === 'light' ? 'moon' : 'sun'}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'light' ? <Moon size={20} className="text-blue-950" /> : <Sun size={20} className="text-yellow-400" />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};
export default ThemeToggle;