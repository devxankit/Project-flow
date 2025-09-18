import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ToastContainer from '../components/ToastContainer';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = uuidv4();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const toast = {
    success: (title, message, options = {}) => 
      addToast({ type: 'success', title, message, ...options }),
    
    error: (title, message, options = {}) => 
      addToast({ type: 'error', title, message, duration: 7000, ...options }),
    
    warning: (title, message, options = {}) => 
      addToast({ type: 'warning', title, message, ...options }),
    
    info: (title, message, options = {}) => 
      addToast({ type: 'info', title, message, ...options }),
    
    loading: (title, message, options = {}) => 
      addToast({ type: 'loading', title, message, duration: 0, ...options }),
    
    custom: (toastData) => addToast(toastData),
    
    dismiss: removeToast,
    clear: clearAllToasts
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    toast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};
