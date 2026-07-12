import AnimatedContent from './ui/AnimatedContent';
import { ShieldCheck, Truck, Users, Compass, Eye } from 'lucide-react';

export default function PlatformIntro() {
  return (
    <section id="platform-intro" className="section-padding" style={{
      backgroundColor: 'var(--bg-light-blue)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle abstract route-line SVG decoration */}
      <svg style={{
        position: 'absolute',
        top: '10%',
        left: '-5%',
        width: '300px',
        height: '400px',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0
      }} viewBox="0 0 100 100">
        <path d="M0,20 Q40,40 10,70 T100,90" fill="none" stroke="var(--color-blue-dark)" strokeWidth="0.8" strokeDasharray="3,3" />
      </svg>
      <div className="container">
        <div className="grid-2 intro-grid" style={{ gap: '80px' }}>
          
          {/* Left Text Column */}
          <AnimatedContent>
            <div style={{ textAlign: 'left' }}>
              <div className="badge" style={{
                backgroundColor: 'var(--color-blue-glow)',
                color: 'var(--color-blue-dark)',
                borderColor: 'rgba(165, 196, 247, 0.3)'
              }}>
                ONE OPERATIONS PLATFORM
              </div>
              
              <h2 style={{
                fontSize: '2.5rem',
                lineHeight: '1.2',
                color: 'var(--text-primary)',
                marginBottom: '20px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700
              }}>
                Everything your fleet needs.<br />
                <span className="highlight-blue">Finally connected.</span>
              </h2>
              
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                marginBottom: '30px'
              }}>
                Spreadsheets, manual dispatch lists, and isolated maintenance logs slow down your logistics. 
                TransitOps integrates your vehicles, driver credentials, live trip dispatcher, and cost logs into a unified workspace. 
                Every validation rule is checked automatically so errors never reach the highway.
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    backgroundColor: 'var(--color-mint-glow)',
                    color: 'var(--color-mint-dark)',
                    padding: '8px',
                    borderRadius: '8px',
                    marginTop: '2px'
                  }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Eliminate Double Allocation
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Trips and maintenance systems communicate in real-time. In-shop vehicles cannot be assigned.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    backgroundColor: 'var(--color-lavender-glow)',
                    color: 'var(--color-lavender-dark)',
                    padding: '8px',
                    borderRadius: '8px',
                    marginTop: '2px'
                  }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Automatic Driver Guardrails
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Prevent dispatching drivers with expired licenses or active safety suspensions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedContent>

          {/* Right Interface Preview Column */}
          <AnimatedContent delay={0.2}>
            <div className="preview-card-outer" style={{
              position: 'relative',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-hover)',
              padding: '24px',
              overflow: 'hidden'
            }}>
              {/* Window Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF605C' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-light)',
                  backgroundColor: 'var(--bg-cream)',
                  padding: '4px 12px',
                  borderRadius: '10px'
                }}>
                  live-dispatch-console.ops
                </div>
                <div style={{ width: '32px' }} />
              </div>

              {/* Mock Dashboard Widgets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Widget 1: Vehicle Status */}
                <div style={{
                  backgroundColor: 'var(--bg-cream)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      color: 'var(--color-peach-dark)',
                      padding: '10px',
                      borderRadius: '10px',
                    }}>
                      <Truck size={18} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>VAN-05 (Heavy Cargo)</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Capacity: 500 kg max load</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-peach-glow)',
                    color: 'var(--color-peach-dark)',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}>
                    Available
                  </span>
                </div>

                {/* Widget 2: Driver Status */}
                <div style={{
                  backgroundColor: 'var(--bg-cream)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-lavender)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      AM
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Alex Mercer</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>License Class A • Verified</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-lavender-glow)',
                    color: 'var(--color-lavender-dark)',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}>
                    Active
                  </span>
                </div>

                {/* Widget 3: Live Route */}
                <div style={{
                  backgroundColor: 'var(--bg-cream)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      color: 'var(--color-blue-dark)',
                      padding: '10px',
                      borderRadius: '10px',
                    }}>
                      <Compass size={18} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Route: Nashik ➜ Pune</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Est. Duration: 4 hrs 12 mins</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-blue-glow)',
                    color: 'var(--color-blue-dark)',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}>
                    Ready
                  </span>
                </div>
              </div>

              {/* Bottom Glow / Preview Indicator */}
              <div style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                color: 'var(--text-light)'
              }}>
                <Eye size={14} />
                Live Dispatch Control Center Interface Preview
              </div>
            </div>
          </AnimatedContent>

        </div>
      </div>
    </section>
  );
}
