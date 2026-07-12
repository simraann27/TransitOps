import { Link } from 'react-router-dom';
import AnimatedContent from './ui/AnimatedContent';
import { ArrowRight, Compass } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section style={{
      backgroundColor: 'var(--bg-warm-white)',
      padding: '100px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Soft Glows */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--color-peach-glow) 0%, transparent 70%)',
        filter: 'blur(50px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--color-blue-glow) 0%, transparent 70%)',
        filter: 'blur(50px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <AnimatedContent>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '32px',
            padding: '80px 40px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-hover)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Soft lavender center aura */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, var(--color-lavender-glow) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
              <div style={{
                display: 'inline-flex',
                padding: '12px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-lavender-gray)',
                color: 'var(--color-lavender-dark)',
                marginBottom: '24px'
              }}>
                <Compass size={28} />
              </div>

              <h2 style={{
                fontSize: '3rem',
                lineHeight: '1.15',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                marginBottom: '20px'
              }}>
                Your fleet.<br />
                <span className="highlight-blue">One command center.</span>
              </h2>

              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                marginBottom: '40px'
              }}>
                Turn vehicles, drivers, trips, maintenance, and costs into one connected operation. 
                Deploy TransitOps for your business operations today.
              </p>

              <div>
                <Link to="/login" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }}>
                  Launch TransitOps
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
