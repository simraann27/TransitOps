import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function LoginPlaceholder() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-warm-white)',
      fontFamily: 'var(--font-sans)',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: '24px',
        padding: '48px 32px',
        maxWidth: '450px',
        width: '100%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-soft)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Pastel lavender accent background highlight */}
        <div style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, var(--color-lavender-glow) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex',
          padding: '16px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-lavender-gray)',
          color: 'var(--color-lavender-dark)',
          marginBottom: '24px',
          position: 'relative',
          zIndex: 2
        }}>
          <ShieldAlert size={32} />
        </div>

        <h1 style={{
          fontSize: '1.8rem',
          marginBottom: '12px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 600
        }}>
          TransitOps Control Center
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          lineHeight: '1.5',
          marginBottom: '32px'
        }}>
          Authentication and Role-Based Access Control are currently scheduled for development in **Step 2 (Login / RBAC)**. 
          <br /><br />
          The landing page navigation is verified.
        </p>

        <Link to="/" className="btn btn-secondary" style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <ArrowLeft size={18} />
          Return to Platform Overview
        </Link>
      </div>
    </div>
  );
}
