import { memo } from 'react';

function PageBackgroundComponent({ variant }) {
  const containerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  };

  // Hide on mobile for performance and clean responsive views
  const mobileHideClass = "hide-on-mobile-bg";

  switch (variant) {
    case 'dashboard':
      return (
        <div style={containerStyle} className={mobileHideClass}>
          {/* Ambient Glows */}
          <div style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-blue-glow) 0%, transparent 70%)',
            opacity: 0.4,
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-lavender-glow) 0%, transparent 70%)',
            opacity: 0.3,
          }} />

          {/* SVG Route lines & Telemetry */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.05 }}>
            {/* Grid Dots */}
            <defs>
              <pattern id="dot-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="var(--text-light)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid)" />

            {/* Dotted paths */}
            <path d="M100 200 C300 150, 400 350, 600 250" fill="none" stroke="var(--color-blue-dark)" strokeWidth="2.5" strokeDasharray="6,6" />
            <path d="M500 100 C700 250, 800 50, 1000 150" fill="none" stroke="var(--color-lavender-dark)" strokeWidth="2" strokeDasharray="5,5" />
            
            {/* Telemetry Ring */}
            <circle cx="200" cy="150" r="45" fill="none" stroke="var(--color-blue-dark)" strokeWidth="1.5" strokeDasharray="3,6" style={{ transformOrigin: '200px 150px', animation: 'spin-bg 24s infinite linear' }} />
            <circle cx="200" cy="150" r="3" fill="var(--color-blue-dark)" />
            <circle cx="200" cy="150" r="8" fill="none" stroke="var(--color-blue-dark)" strokeWidth="1" />

            <circle cx="800" cy="300" r="60" fill="none" stroke="var(--color-lavender-dark)" strokeWidth="1.5" strokeDasharray="4,8" style={{ transformOrigin: '800px 300px', animation: 'spin-bg-reverse 30s infinite linear' }} />
            <circle cx="800" cy="300" r="3" fill="var(--color-lavender-dark)" />
          </svg>

          <style>{`
            @keyframes spin-bg {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes spin-bg-reverse {
              from { transform: rotate(360deg); }
              to { transform: rotate(0deg); }
            }
            @media (max-width: 768px) {
              .hide-on-mobile-bg {
                display: none !important;
              }
            }
          `}</style>
        </div>
      );

    case 'fleet':
      return (
        <div style={containerStyle} className={mobileHideClass}>
          {/* Ambient Glows */}
          <div style={{
            position: 'absolute',
            top: '10%',
            right: '-5%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-blue-glow) 0%, transparent 70%)',
            opacity: 0.45,
          }} />

          {/* SVG Road curves & vehicles */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.055 }}>
            {/* Wavy Road Line */}
            <path d="M-100 100 C150 150, 200 450, 600 380 S900 150, 1200 200" fill="none" stroke="var(--color-blue-dark)" strokeWidth="12" strokeOpacity="0.4" strokeLinecap="round" />
            <path d="M-100 100 C150 150, 200 450, 600 380 S900 150, 1200 200" fill="none" stroke="var(--bg-cream)" strokeWidth="2" strokeDasharray="8,8" strokeLinecap="round" />

            {/* Truck Icon 1 (abstract line art) */}
            <g transform="translate(150, 110) scale(0.65)" stroke="var(--color-blue-dark)" strokeWidth="2" fill="none" strokeLinecap="round">
              <rect x="5" y="15" width="22" height="15" rx="2" />
              <path d="M27 20 L37 20 L40 25 L40 30 L27 30 Z" />
              <circle cx="12" cy="33" r="3.5" />
              <circle cx="32" cy="33" r="3.5" />
            </g>

            {/* Van Icon 2 (abstract line art) */}
            <g transform="translate(800, 220) scale(0.65)" stroke="var(--color-blue-dark)" strokeWidth="2" fill="none" strokeLinecap="round">
              <rect x="5" y="15" width="30" height="15" rx="4" />
              <circle cx="12" cy="33" r="3.5" />
              <circle cx="28" cy="33" r="3.5" />
              <line x1="20" y1="15" x2="20" y2="30" />
            </g>
          </svg>
        </div>
      );

    case 'drivers':
      return (
        <div style={containerStyle} className={mobileHideClass}>
          {/* Ambient Glows */}
          <div style={{
            position: 'absolute',
            bottom: '5%',
            right: '10%',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-mint-glow) 0%, transparent 70%)',
            opacity: 0.4,
          }} />

          {/* SVG Shields & Credentials wheel line patterns */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.05 }}>
            {/* Steering Wheel Outline */}
            <g transform="translate(150, 250) scale(0.85)" stroke="var(--color-mint-dark)" strokeWidth="2" fill="none">
              <circle cx="50" cy="50" r="40" />
              <circle cx="50" cy="50" r="10" />
              <line x1="50" y1="10" x2="50" y2="40" />
              <line x1="15" y1="65" x2="42" y2="55" />
              <line x1="85" y1="65" x2="58" y2="55" />
            </g>

            {/* Verification Shield */}
            <g transform="translate(850, 120) scale(0.8)" stroke="var(--color-lavender-dark)" strokeWidth="2" fill="none">
              <path d="M30 10 L60 20 L60 50 C60 70, 45 85, 30 90 C15 85, 0 70, 0 50 L0 20 Z" />
              <path d="M15 45 L25 55 L45 35" strokeWidth="2.5" />
            </g>
          </svg>
        </div>
      );

    case 'trips':
      return (
        <div style={containerStyle} className={mobileHideClass}>
          {/* Ambient Glows */}
          <div style={{
            position: 'absolute',
            top: '5%',
            left: '10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-blue-glow) 0%, transparent 70%)',
            opacity: 0.35,
          }} />

          {/* Dispatch route accent curves & dots */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.06 }}>
            {/* Origin & Dest telemetry paths */}
            <path d="M150 350 C300 200, 500 450, 750 220" fill="none" stroke="var(--color-blue-dark)" strokeWidth="3" strokeDasharray="1,8" strokeLinecap="round" />
            
            {/* Node A */}
            <circle cx="150" cy="350" r="8" fill="var(--color-peach)" stroke="#fff" strokeWidth="2" />
            <circle cx="150" cy="350" r="16" fill="none" stroke="var(--color-peach)" strokeWidth="1" opacity="0.5" style={{ animation: 'pulse-bg 2s infinite ease-out' }} />
            
            {/* Node B */}
            <circle cx="750" cy="220" r="8" fill="var(--color-mint-dark)" stroke="#fff" strokeWidth="2" />
            <circle cx="750" cy="220" r="16" fill="none" stroke="var(--color-mint-dark)" strokeWidth="1" opacity="0.5" style={{ animation: 'pulse-bg 2s infinite ease-out', animationDelay: '1s' }} />

            {/* Direct Link Line */}
            <path d="M150 350 Q 450 150, 750 220" fill="none" stroke="var(--color-blue-dark)" strokeWidth="2" strokeDasharray="8,8" />
          </svg>

          <style>{`
            @keyframes pulse-bg {
              0% { transform: scale(0.9) translate(0px, 0px); opacity: 0.7; }
              100% { transform: scale(1.6) translate(-13px, -19px); opacity: 0; }
            }
          `}</style>
        </div>
      );

    case 'maintenance':
      return (
        <div style={containerStyle} className={mobileHideClass}>
          {/* Ambient Glows */}
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '5%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-peach-glow) 0%, transparent 70%)',
            opacity: 0.45,
          }} />

          {/* SVG Gears / Spanners */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.05 }}>
            {/* Gear 1 */}
            <g transform="translate(180, 150) scale(0.7)" stroke="var(--color-peach-dark)" strokeWidth="2.5" fill="none" style={{ transformOrigin: '50px 50px', animation: 'spin-bg 40s infinite linear' }}>
              <circle cx="50" cy="50" r="25" />
              <circle cx="50" cy="50" r="12" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                <line key={idx} x1="50" y1="10" x2="50" y2="20" style={{ transformOrigin: '50px 50px', transform: `rotate(${angle}deg)` }} />
              ))}
            </g>

            {/* Wrench Symbol */}
            <g transform="translate(780, 260) scale(0.85) rotate(-30)" stroke="var(--color-peach-dark)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 0 0 L 60 60" strokeWidth="4" />
              {/* Head */}
              <circle cx="0" cy="0" r="10" />
              <path d="M -7 -7 L 0 0 L 7 -7" strokeWidth="2" fill="var(--bg-warm-white)" />
              {/* Tail */}
              <circle cx="60" cy="60" r="6" fill="var(--color-peach-dark)" />
            </g>
          </svg>
        </div>
      );

    case 'fuel-expenses':
      return (
        <div style={containerStyle} className={mobileHideClass}>
          {/* Ambient Glows */}
          <div style={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-mint-glow) 0%, transparent 70%)',
            opacity: 0.45,
          }} />

          {/* SVG Rupee and Trend-lines */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.055 }}>
            {/* Indian Rupee Symbol (abstract) */}
            <g transform="translate(180, 180) scale(0.95)" stroke="var(--color-mint-dark)" strokeWidth="2.5" fill="none" strokeLinecap="round">
              <path d="M10 10 L40 10 M10 22 L36 22 M10 10 C35 10, 35 34, 10 34 L35 56" />
            </g>

            {/* Trend / Cost Chart Line */}
            <path d="M100 380 Q 300 250, 450 310 T 800 120 T 1100 160" fill="none" stroke="var(--color-mint-dark)" strokeWidth="3" />
            <circle cx="800" cy="120" r="4" fill="var(--color-mint-dark)" />
            <circle cx="800" cy="120" r="12" fill="none" stroke="var(--color-mint-dark)" strokeWidth="1" strokeDasharray="3,3" />
          </svg>
        </div>
      );

    case 'analytics':
      return (
        <div style={containerStyle} className={mobileHideClass}>
          {/* Ambient Glows */}
          <div style={{
            position: 'absolute',
            top: '-5%',
            right: '10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--color-blue-glow) 0%, transparent 70%)',
            opacity: 0.35,
          }} />

          {/* SVG charts axes, grid points, donut arcs */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.06 }}>
            {/* Concentric grid lines */}
            <circle cx="850" cy="180" r="90" fill="none" stroke="var(--color-blue-dark)" strokeWidth="1" strokeDasharray="4,4" />
            <circle cx="850" cy="180" r="60" fill="none" stroke="var(--color-lavender-dark)" strokeWidth="1.5" strokeDasharray="2,6" />
            
            {/* Grid coordinates */}
            <line x1="50" y1="50" x2="300" y2="50" stroke="var(--text-light)" strokeWidth="1" strokeDasharray="2,4" />
            <line x1="50" y1="50" x2="50" y2="250" stroke="var(--text-light)" strokeWidth="1" strokeDasharray="2,4" />
            
            {/* Wave curve */}
            <path d="M50 250 C120 180, 180 80, 250 120 S 320 20, 400 40" fill="none" stroke="var(--color-blue-dark)" strokeWidth="2.5" />
          </svg>
        </div>
      );

    default:
      return null;
  }
}

// Use React.memo to prevent unnecessary component updates during render ticks
export const PageBackground = memo(PageBackgroundComponent);
export default PageBackground;
