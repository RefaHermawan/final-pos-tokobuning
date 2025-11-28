// src/components/ui/StockBadge.jsx
import React from 'react';

const StockBadge = ({ quantity, lowStockThreshold = 10 }) => {
  let bgColor, textColor, text;

  const stock = parseFloat(quantity);

  if (stock > lowStockThreshold) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    text = 'Cukup';
  } else if (stock > 0) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    text = 'Menipis';
  } else {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    text = 'Habis';
  }

  return (
    <span className={`px-2 py-1 text-xs font-semibold leading-none rounded-full ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
};

export default StockBadge;