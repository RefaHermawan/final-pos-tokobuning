// src/components/ui/Pagination.jsx
import React from 'react';
import { usePagination, DOTS } from '../../hooks/usePagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Pagination = ({ onPageChange, totalPages, currentPage }) => {
  const paginationRange = usePagination({
    currentPage,
    totalPages,
    siblingCount: 1,
  });

  // Jika halaman kurang dari 2, tidak perlu menampilkan pagination
  if (currentPage === 0 || !paginationRange || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => onPageChange(currentPage + 1);
  const onPrevious = () => onPageChange(currentPage - 1);
  const lastPage = totalPages;

  return (
    // 1. Tampilan 'Glassmorphism' pada kontainer utama
    <ul className="flex items-center gap-1 bg-surface backdrop-blur-md border border-light-gray/50 p-1 rounded-xl shadow-lg">
      
      {/* Tombol Previous */}
      <li>
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="h-9 w-9 flex items-center justify-center rounded-lg text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft size={18} />
        </button>
      </li>

      {paginationRange.map((pageNumber, index) => {
        // Tampilan untuk ... (DOTS)
        if (pageNumber === DOTS) {
          return <li key={`dots-${index}`} className="h-9 w-9 flex items-center justify-center text-text-secondary text-sm font-bold">...</li>;
        }

        const isActive = pageNumber === currentPage;
        return (
          <li key={pageNumber}>
            <button
              onClick={() => onPageChange(pageNumber)}
              // 2. Interaksi yang lebih jelas
              className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors relative
                ${isActive ? 'text-white' : 'text-text-secondary hover:bg-primary/10 hover:text-primary'}
              `}
            >
              {/* 3. Indikator aktif dengan animasi 'spring' */}
              {isActive && (
                <motion.div
                  layoutId="pagination-active-indicator"
                  className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/20 z-0"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{pageNumber}</span>
            </button>
          </li >
        );
      })}

      {/* Tombol Next */}
      <li>
        <button
          onClick={onNext}
          disabled={currentPage === lastPage}
          className="h-9 w-9 flex items-center justify-center rounded-lg text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors"
          title="Halaman Berikutnya"
        >
          <ChevronRight size={18} />
        </button>
      </li>
    </ul>
  );
};

export default Pagination;