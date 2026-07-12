import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({ isOpen, title, message, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(27, 36, 48, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 9990,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '480px',
                width: '90%',
                boxShadow: '0 20px 40px -10px rgba(27, 36, 48, 0.1)',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <div style={{
                display: 'inline-flex',
                padding: '16px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-peach-glow)',
                color: 'var(--color-peach-dark)',
                marginBottom: '20px'
              }}>
                <AlertTriangle size={32} />
              </div>

              <h3 style={{
                fontSize: '1.35rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '12px'
              }}>
                {title}
              </h3>

              <p style={{
                fontSize: '0.92rem',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                marginBottom: '32px'
              }}>
                {message}
              </p>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button 
                  onClick={onCancel}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirm}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                >
                  Delete Vehicle
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
