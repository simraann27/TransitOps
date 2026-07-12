import { Link } from 'react-router-dom';
import { Navigation } from 'lucide-react';

export default function Footer() {
  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer style={{
      backgroundColor: 'var(--bg-warm-white)',
      borderTop: '1px solid var(--border-light)',
      padding: '60px 0 30px 0',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      zIndex: 2,
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '40px',
          marginBottom: '40px',
          textAlign: 'left'
        }}>
          {/* Logo & Tagline */}
          <div style={{ maxWidth: '320px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '1.2rem',
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-blue)',
                color: 'var(--text-primary)',
              }}>
                <Navigation size={14} style={{ transform: 'rotate(45deg)' }} />
              </div>
              <span>TransitOps</span>
            </div>
            
            <p style={{
              fontSize: '0.88rem',
              lineHeight: '1.5',
              color: 'var(--text-secondary)'
            }}>
              Smart Transport Operations Platform. Integrating fleets, dispatch logs, driver safety profiles, and cost metrics.
            </p>
          </div>

          {/* Navigation Links Column */}
          <div style={{ display: 'flex', gap: '60px' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Platform
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                <li>
                  <span 
                    onClick={() => handleScrollToSection('platform-intro')} 
                    style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                  >
                    Overview
                  </span>
                </li>
                <li>
                  <span 
                    onClick={() => handleScrollToSection('features')} 
                    style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                  >
                    Solutions
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Operations
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                <li>
                  <span 
                    onClick={() => handleScrollToSection('dispatch-flow')} 
                    style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                  >
                    Dispatcher
                  </span>
                </li>
                <li>
                  <span 
                    onClick={() => handleScrollToSection('analytics-preview')} 
                    style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                  >
                    Analytics
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Get Started
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                <li>
                  <Link to="/login" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/login" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                    Launch Console
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', marginBottom: '30px' }} />

        {/* Attribution Row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          fontSize: '0.8rem',
          color: 'var(--text-light)',
          fontWeight: 600
        }}>
          <span>© {new Date().getFullYear()} TransitOps. All rights reserved.</span>
          <span style={{
            backgroundColor: 'var(--bg-cream)',
            padding: '4px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)'
          }}>
            Built for Odoo Hackathon 2026
          </span>
        </div>
      </div>
    </footer>
  );
}
