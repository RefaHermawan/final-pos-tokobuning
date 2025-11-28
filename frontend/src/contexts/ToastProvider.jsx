import React, { useState, useCallback } from 'react';
import ToastContext from './ToastContext';
import Toast from '../components/ui/Toast';
import { AnimatePresence } from 'framer-motion';

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // PERUBAHAN: addToast kini menerima argumen ketiga opsional
    const addToast = useCallback((type, message, fullMessageText = '') => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, type, message, fullMessageText }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] space-y-2">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <Toast 
                            key={toast.id}
                            id={toast.id}
                            type={toast.type}
                            message={toast.message}
                            fullMessageText={toast.fullMessageText} // Teruskan prop baru
                            onClose={removeToast}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;