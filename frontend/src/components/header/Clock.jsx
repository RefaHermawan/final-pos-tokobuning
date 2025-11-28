// src/components/header/Clock.jsx
import React, { useState, useEffect } from 'react';

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right hidden sm:block">
      <p className="font-semibold text-accent text-2xl">
        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-xs text-text-secondary">
        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </div>
  );
};
export default Clock;