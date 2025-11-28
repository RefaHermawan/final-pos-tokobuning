// src/components/ui/LoginFooter.jsx
import React from 'react';

const LoginFooter = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = "1.0.0"; // Anda bisa update ini nanti

  return (
    <footer className="absolute bottom-4 text-center w-full text-xs text-text-secondary/50">
      <div>
        &copy; {currentYear} Toko Bu Ning. All Rights Reserved. - v{appVersion}
        <div className="mt-1">
          Created by <span className="text-text-secondary">Refa Hermawan</span>
        </div>
      </div>
    </footer>
  );
};

export default LoginFooter;