import { useEffect, useRef, useState } from 'react';
import { X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductTourModal({ isOpen, onClose }) {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // Lock background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Pressing Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(27, 36, 48, 0.65)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-warm-white)',
              borderRadius: '24px',
              border: '1px solid var(--border-light)',
              width: '100%',
              maxWidth: '800px',
              boxShadow: 'var(--shadow-hover)',
              padding: '32px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-light)',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--bg-cream)';
                e.target.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'var(--text-light)';
              }}
            >
              <X size={20} />
            </button>

            {/* Header Text */}
            <div style={{ paddingRight: '40px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                See TransitOps in Action
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                From fleet registration to dispatch, maintenance and operational analytics — explore the complete logistics workflow.
              </p>
            </div>

            {/* Video Container (16:9 Aspect Ratio) */}
            <div style={{
              width: '100%',
              position: 'relative',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-cream)',
              border: '1px solid var(--border-light)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
            }}>
              {!videoError ? (
                <video
                  ref={videoRef}
                  src="https://1drv.ms/v/c/5b2f135f08e32784/IQCmfqeqEBQqQ4A_RRIcUVE-Adr-FXUN_eb9xcVnA-nsPQI?e=PfWh0r"
                  controls
                  autoPlay
                  muted
                  playsInline
                  onError={() => setVideoError(true)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                /* Video Placeholder View */
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  backgroundColor: 'var(--bg-cream)',
                  color: 'var(--text-secondary)',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    color: 'var(--color-blue-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.1)',
                  }}>
                    <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      TransitOps Product Tour
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
                      To view the full high-quality interactive demo walkthrough, please click the button below to watch the tour hosted on OneDrive.
                    </p>
                    <a
                      href="https://1drv.ms/v/c/5b2f135f08e32784/IQCmfqeqEBQqQ4A_RRIcUVE-Adr-FXUN_eb9xcVnA-nsPQI?e=PfWh0r"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 28px',
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                        borderRadius: '10px',
                        fontWeight: 600
                      }}
                    >
                      <Play size={16} fill="currentColor" />
                      Watch Full Product Tour
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Workflow Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px', justifyContent: 'flex-start' }}>
              {[
                { name: 'Fleet Registry', color: 'var(--color-blue-dark)', bg: 'var(--color-blue-glow)' },
                { name: 'Driver Safety', color: 'var(--color-peach-dark)', bg: 'var(--color-peach-glow)' },
                { name: 'Smart Dispatch', color: 'var(--color-lavender-dark)', bg: 'var(--color-lavender-glow)' },
                { name: 'Maintenance', color: 'var(--color-yellow-dark)', bg: 'var(--color-yellow-glow)' },
                { name: 'Cost Tracking', color: 'var(--text-primary)', bg: 'var(--bg-cream)' },
                { name: 'Analytics', color: 'var(--color-mint-dark)', bg: 'var(--color-mint-glow)' }
              ].map((pill, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: pill.bg,
                    color: pill.color,
                    border: '1px solid rgba(27, 36, 48, 0.04)',
                  }}
                >
                  {pill.name}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
