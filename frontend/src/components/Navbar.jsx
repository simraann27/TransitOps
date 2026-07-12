import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Menu, X } from 'lucide-react';

export default function Navbar({ onOpenTour }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease',
      backgroundColor: isScrolled ? 'rgba(253, 251, 247, 0.8)' : 'transparent',
      backdropFilter: isScrolled ? 'blur(16px)' : 'none',
      borderBottom: isScrolled ? '1px solid var(--border-light)' : '1px solid transparent',
      boxShadow: isScrolled ? 'var(--shadow-nav)' : 'none',
      padding: isScrolled ? '14px 0' : '20px 0',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '1.25rem',
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-blue)',
            color: 'var(--text-primary)',
          }}>
            <Navigation size={18} style={{ transform: 'rotate(45deg)' }} />
          </div>
          <span>Transit<span style={{ color: 'var(--color-lavender-dark)' }}>Ops</span></span>
        </Link>

        {/* Desktop nav links */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '32px',
        }} className="desktop-nav-links">
          <span 
            onClick={() => handleScrollToSection('platform-intro')} 
            style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Platform
          </span>
          <span 
            onClick={() => handleScrollToSection('features')} 
            style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Solutions
          </span>
          <span 
            onClick={() => handleScrollToSection('dispatch-flow')} 
            style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Operations
          </span>
          <span 
            onClick={() => handleScrollToSection('analytics-preview')} 
            style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Analytics
          </span>
          <span 
            onClick={onOpenTour} 
            style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Product Tour
          </span>
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '16px',
        }} className="desktop-nav-links">
          <Link to="/login" style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            padding: '8px 16px',
          }}>
            Sign In
          </Link>
          <Link to="/login" className="btn btn-primary" style={{
            padding: '10px 20px',
            fontSize: '0.85rem',
          }}>
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px'
          }}
          className="mobile-menu-btn"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-warm-white)',
          borderBottom: '1px solid var(--border-light)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-hover)',
          zIndex: 999
        }}>
          <span 
            onClick={() => handleScrollToSection('platform-intro')} 
            style={{ padding: '8px 0', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            Platform
          </span>
          <span 
            onClick={() => handleScrollToSection('features')} 
            style={{ padding: '8px 0', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            Solutions
          </span>
          <span 
            onClick={() => handleScrollToSection('dispatch-flow')} 
            style={{ padding: '8px 0', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            Operations
          </span>
          <span 
            onClick={() => handleScrollToSection('analytics-preview')} 
            style={{ padding: '8px 0', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            Analytics
          </span>
          <span 
            onClick={() => { setMobileMenuOpen(false); onOpenTour(); }} 
            style={{ padding: '8px 0', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            Product Tour
          </span>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ width: '100%' }}>
              Sign In
            </Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Embedded CSS for Navbar Responsive Controls */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
