import { Link } from 'react-router-dom';
import { ArrowRight, Navigation } from 'lucide-react';
import SplitText from './ui/SplitText';
import BlurText from './ui/BlurText';
import { motion } from 'framer-motion';

export default function Hero() {
  const handleScrollToExplore = () => {
    const element = document.getElementById('platform-intro');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section style={{
      position: 'relative',
      padding: '80px 0 100px 0',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-warm-white)',
    }}>
      {/* Background soft ambient glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--color-blue-glow) 0%, transparent 70%)',
        filter: 'blur(40px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '0%',
        left: '-10%',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--color-lavender-glow) 0%, transparent 75%)',
        filter: 'blur(50px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid-2 hero-grid" style={{ gap: '60px' }}>
          
          {/* Hero Left Content */}
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <div className="badge" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span className="badge-pulse-dot" />
              TransitOps Live Platform v1.0
            </div>

            <h1 className="hero-title" style={{
              fontSize: '4.25rem',
              lineHeight: '1.1',
              marginBottom: '24px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em'
            }}>
              <SplitText text="Move Smarter." delay={0.1} />
              <br />
              <SplitText text="Operate Faster." delay={0.4} />
            </h1>

            <p style={{
              fontSize: '1.2rem',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              marginBottom: '40px',
              maxWidth: '520px'
            }}>
              <BlurText 
                text="One intelligent command center for your fleet, drivers, dispatch, maintenance, and operational costs." 
                delay={0.8}
              />
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <Link to="/login" className="btn btn-primary" style={{ padding: '16px 32px' }}>
                Launch Operations
                <ArrowRight size={18} />
              </Link>
              <button 
                onClick={handleScrollToExplore} 
                className="btn btn-secondary" 
                style={{ padding: '16px 32px' }}
              >
                Explore Platform
              </button>
            </div>
          </div>

          {/* Hero Right Visuals */}
          <div className="hero-visual-wrapper" style={{
            position: 'relative',
            width: '100%',
            height: '480px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Animated Gradient Glow Behind Card */}
            <div className="glow-backdrop" />

            {/* Main Interactive Map Card with Video Underlay */}
            <div className="map-canvas" style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--bg-cream)',
              borderRadius: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-soft)',
              overflow: 'hidden',
              zIndex: 2,
            }}>
              
              {/* Subtle Autoplay Loop Video Background Layer */}
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0,
                  opacity: 0.18,
                  filter: 'saturate(0.4)',
                }}
              >
                <source src="/videos/logistics_hero.mp4" type="video/mp4" />
                {/* Fallback layout is handled by parent container's styles */}
              </video>

              {/* Translucent Warm Cream Overlay to soften the video */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(246, 244, 238, 0.72)',
                backdropFilter: 'blur(1px)',
                zIndex: 1,
              }} />

              {/* Dot Grid Layer */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(var(--text-light) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                opacity: 0.12,
                zIndex: 1,
              }} />

              {/* Tiny LIVE OPERATIONS Indicator */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: 5,
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(12px)',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: '1px solid rgba(27, 36, 48, 0.08)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}>
                <span className="live-dot" />
                LIVE OPERATIONS
              </div>

              {/* Animated Map Route SVG */}
              <svg 
                viewBox="0 0 500 400" 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 3,
                }}
              >
                {/* Connection line underlay */}
                <path 
                  d="M 80 320 C 180 280, 150 120, 280 180 C 350 210, 390 100, 420 80" 
                  fill="none" 
                  stroke="rgba(27, 36, 48, 0.04)" 
                  strokeWidth="6" 
                  strokeLinecap="round"
                />

                {/* Animated Route Line */}
                <path 
                  id="route-line"
                  d="M 80 320 C 180 280, 150 120, 280 180 C 350 210, 390 100, 420 80" 
                  fill="none" 
                  stroke="var(--color-blue-dark)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeDasharray="8,8"
                  className="dash-animate"
                />

                {/* Nodes */}
                {/* Node 1: Origin */}
                <circle cx="80" cy="320" r="8" fill="var(--color-peach)" stroke="#fff" strokeWidth="2" />
                <circle cx="80" cy="320" r="16" fill="var(--color-peach-glow)" stroke="none" className="pulse-animate" />

                {/* Node 2: Hub */}
                <circle cx="280" cy="180" r="6" fill="var(--color-lavender)" stroke="#fff" strokeWidth="2" />
                
                {/* Node 3: Destination */}
                <circle cx="420" cy="80" r="8" fill="var(--color-mint)" stroke="#fff" strokeWidth="2" />
                <circle cx="420" cy="80" r="16" fill="var(--color-mint-glow)" stroke="none" className="pulse-animate-delayed" />
              </svg>

              {/* Route labels */}
              <div className="map-label" style={{ top: '345px', left: '60px', zIndex: 3 }}>
                <span className="label-dot">●</span> Origin (VAN-05)
              </div>
              <div className="map-label" style={{ top: '200px', left: '260px', zIndex: 3 }}>
                Hub Station
              </div>
              <div className="map-label" style={{ top: '45px', left: '360px', zIndex: 3 }}>
                <span className="label-dot" style={{ color: 'var(--color-mint-dark)' }}>●</span> Dest (Completed)
              </div>

              {/* Animated Vehicle Indicator */}
              <div className="vehicle-dot" style={{
                position: 'absolute',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--text-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-hover)',
                zIndex: 4,
                offsetPath: `path("M 80 320 C 180 280, 150 120, 280 180 C 350 210, 390 100, 420 80")`,
                animation: 'move-vehicle 12s infinite linear'
              }}>
                <Navigation size={14} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>

            {/* Floating operational cards with glass blur and customized slow floating loops */}
            {/* Card 1: Fleet Utilization */}
            <motion.div 
              className="floating-card"
              animate={{ y: [0, -12, 0] }}
              transition={{
                y: { repeat: Infinity, duration: 6, ease: "easeInOut" }
              }}
              style={{
                position: 'absolute',
                top: '40px',
                left: '-30px',
                backgroundColor: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                borderLeft: '4px solid var(--color-lavender-dark)',
                borderRadius: '12px',
                padding: '12px 18px',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                zIndex: 4,
              }}
            >
              <span className="float-card-title">Fleet Utilization</span>
              <span className="float-card-value" style={{ color: 'var(--color-lavender-dark)' }}>87%</span>
            </motion.div>

            {/* Card 2: Active Trips */}
            <motion.div 
              className="floating-card"
              animate={{ y: [0, 12, 0] }}
              transition={{
                y: { repeat: Infinity, duration: 7, ease: "easeInOut" }
              }}
              style={{
                position: 'absolute',
                bottom: '50px',
                right: '-20px',
                backgroundColor: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                borderLeft: '4px solid var(--color-blue-dark)',
                borderRadius: '12px',
                padding: '12px 18px',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                zIndex: 4,
              }}
            >
              <span className="float-card-title">Active Trips</span>
              <span className="float-card-value" style={{ color: 'var(--color-blue-dark)' }}>18</span>
            </motion.div>

            {/* Card 3: Vehicles Online */}
            <motion.div 
              className="floating-card"
              animate={{ y: [0, -8, 0] }}
              transition={{
                y: { repeat: Infinity, duration: 5.5, ease: "easeInOut" }
              }}
              style={{
                position: 'absolute',
                top: '180px',
                right: '-40px',
                backgroundColor: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                borderLeft: '4px solid var(--color-mint-dark)',
                borderRadius: '12px',
                padding: '12px 18px',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                zIndex: 4,
              }}
            >
              <span className="float-card-title">Vehicles Online</span>
              <span className="float-card-value" style={{ color: 'var(--color-mint-dark)' }}>53</span>
            </motion.div>

            {/* Card 4: On-Time Delivery */}
            <motion.div 
              className="floating-card"
              animate={{ y: [0, 10, 0] }}
              transition={{
                y: { repeat: Infinity, duration: 6.5, ease: "easeInOut" }
              }}
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '-20px',
                backgroundColor: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                borderLeft: '4px solid var(--color-yellow-dark)',
                borderRadius: '12px',
                padding: '12px 18px',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                zIndex: 4,
              }}
            >
              <span className="float-card-title">On-Time Delivery</span>
              <span className="float-card-value" style={{ color: 'var(--color-yellow-dark)' }}>94%</span>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Styled Embed for Keyframe Animations */}
      <style>{`
        .hero-title span {
          display: inline-block;
        }

        .badge-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--color-mint-dark);
          animation: badge-pulse 2s infinite ease-in-out;
        }

        @keyframes badge-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        /* Glowing backdrop element */
        .glow-backdrop {
          position: absolute;
          width: 102%;
          height: 102%;
          border-radius: 26px;
          background: linear-gradient(135deg, var(--color-blue-glow), var(--color-lavender-glow), var(--color-peach-glow));
          filter: blur(20px);
          z-index: 1;
          opacity: 0.8;
          animation: glow-rotate 10s infinite alternate ease-in-out;
        }

        @keyframes glow-rotate {
          0% { transform: scale(0.98) translate(-1%, -1%); }
          100% { transform: scale(1.01) translate(1%, 1%); }
        }

        /* LIVE OPERATIONS Blinking Indicator */
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #ef4444;
          animation: live-blink 1.2s infinite ease-in-out;
        }

        @keyframes live-blink {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* Route Dash Animation */
        .dash-animate {
          animation: route-dash 30s infinite linear;
        }
        @keyframes route-dash {
          to {
            stroke-dashoffset: -1000;
          }
        }

        /* Map Node pulse animation */
        .pulse-animate {
          animation: pulse 2.5s infinite ease-out;
          transform-origin: center;
        }
        .pulse-animate-delayed {
          animation: pulse 2.5s infinite ease-out;
          animation-delay: 1.25s;
          transform-origin: center;
        }
        @keyframes pulse {
          0% { r: 6px; opacity: 0.8; }
          100% { r: 18px; opacity: 0; }
        }

        /* Vehicle Movement Animation along SVG OffsetPath */
        @keyframes move-vehicle {
          0% {
            offsetDistance: 0%;
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(-15deg);
          }
          40% {
            transform: rotate(10deg);
          }
          70% {
            transform: rotate(-25deg);
          }
          90% {
            transform: rotate(5deg);
          }
          100% {
            offsetDistance: 100%;
            transform: rotate(0deg);
          }
        }

        .map-label {
          position: absolute;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
          background-color: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid var(--border-light);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          pointer-events: none;
        }
        
        .label-dot {
          color: var(--color-peach-dark);
          margin-right: 4px;
        }

        .float-card-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .float-card-value {
          font-size: 1.2rem;
          font-weight: 800;
          font-family: var(--font-heading);
        }

        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-title {
            font-size: 3.25rem !important;
          }
          .hero-visual-wrapper {
            height: 380px !important;
          }
          .floating-card {
            transform: scale(0.9) !important;
          }
        }

        @media (max-width: 576px) {
          .hero-title {
            font-size: 2.75rem !important;
          }
          .floating-card {
            display: none !important; /* Hide floating cards on small mobile screens */
          }
        }
      `}</style>
    </section>
  );
}
