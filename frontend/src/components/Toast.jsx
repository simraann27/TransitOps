import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#ffffff',
            border: `1px solid ${isSuccess ? 'var(--color-mint-dark)' : '#fca5a5'}`,
            borderLeft: `5px solid ${isSuccess ? 'var(--color-mint-dark)' : '#ef4444'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'left'
          }}
        >
          <div style={{ color: isSuccess ? 'var(--color-mint-dark)' : '#ef4444', display: 'flex', flexShrink: 0 }}>
            {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          </div>
          
          <div style={{ flexGrow: 1, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {message}
          </div>

          <button 
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--text-light)',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
