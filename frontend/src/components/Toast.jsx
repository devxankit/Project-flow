import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

const Toast = ({ 
  id, 
  type = 'success', 
  title, 
  message, 
  duration = 5000, 
  onClose, 
  action 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-gradient-to-r from-emerald-50 to-teal-50',
          borderColor: 'border-emerald-200',
          iconColor: 'text-emerald-600',
          titleColor: 'text-emerald-800',
          messageColor: 'text-emerald-700',
          progressColor: 'bg-emerald-500'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-gradient-to-r from-red-50 to-rose-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          progressColor: 'bg-red-500'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-800',
          messageColor: 'text-amber-700',
          progressColor: 'bg-amber-500'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          progressColor: 'bg-blue-500'
        };
      case 'loading':
        return {
          icon: Loader2,
          bgColor: 'bg-gradient-to-r from-primary/10 to-primary/5',
          borderColor: 'border-primary/20',
          iconColor: 'text-primary',
          titleColor: 'text-primary',
          messageColor: 'text-primary/80',
          progressColor: 'bg-primary'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-gradient-to-r from-gray-50 to-slate-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700',
          progressColor: 'bg-gray-500'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3 
      }}
      className={`
        relative max-w-xs w-full ${config.bgColor} ${config.borderColor} 
        border rounded-lg shadow-md backdrop-blur-sm
        overflow-hidden
      `}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <motion.div
          className={`absolute top-0 left-0 h-0.5 ${config.progressColor}`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}

      <div className="p-3">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            {type === 'loading' ? (
              <Loader2 className={`h-4 w-4 ${config.iconColor} animate-spin`} />
            ) : (
              <Icon className={`h-4 w-4 ${config.iconColor}`} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <p className={`text-xs font-semibold ${config.titleColor} mb-0.5`}>
                {title}
              </p>
            )}
            {message && (
              <p className={`text-xs ${config.messageColor}`}>
                {message}
              </p>
            )}
            {action && (
              <div className="mt-1">
                {action}
              </div>
            )}
          </div>

          <button
            onClick={() => onClose(id)}
            className={`
              flex-shrink-0 p-0.5 rounded-full transition-colors
              hover:bg-black/5 ${config.iconColor} hover:${config.iconColor.replace('text-', 'bg-').replace('-600', '-100')}
            `}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Toast;
