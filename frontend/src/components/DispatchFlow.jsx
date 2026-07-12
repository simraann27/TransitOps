import { useEffect, useState } from 'react';
import AnimatedContent from './ui/AnimatedContent';
import { Truck, Compass, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DispatchFlow() {
  const [activeStep, setActiveStep] = useState(0);

  // Automatically cycle through progress steps for demo feel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const flowSteps = [
    { title: "Vehicle Ready", desc: "Inspection complete", color: "var(--color-blue)", icon: Truck },
    { title: "Driver Assigned", desc: "Credentials checked", color: "var(--color-lavender)", icon: UserCheck },
    { title: "Dispatched", desc: "Manifest locked", color: "var(--color-yellow)", icon: Compass },
    { title: "On Trip", desc: "Live GPS active", color: "var(--color-peach)", icon: Compass },
    { title: "Completed", desc: "Signed at delivery", color: "var(--color-mint)", icon: CheckCircle2 }
  ];

  return (
    <section id="dispatch-flow" className="section-padding" style={{
      backgroundColor: 'var(--bg-warm-white)',
      position: 'relative'
    }}>
      <div className="container">
        
        {/* Section Header */}
        <AnimatedContent>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge">SMART DISPATCH EXPERIENCE</div>
            <h2 style={{
              fontSize: '2.5rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              From ready to delivered.<br />
              <span className="highlight-blue">Every step visible.</span>
            </h2>
            <p style={{
              maxWidth: '600px',
              margin: '0 auto',
              color: 'var(--text-secondary)',
              fontSize: '1.05rem'
            }}>
              TransitOps guides your operations through structured, fail-safe statuses, ensuring complete visibility from start to finish.
            </p>
          </div>
        </AnimatedContent>

        <div className="grid-2 flow-grid" style={{ gap: '60px', alignItems: 'stretch' }}>
          
          {/* Dispatch Timeline Node Progress */}
          <AnimatedContent style={{ flexGrow: 1 }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: 'var(--shadow-soft)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '32px', fontFamily: 'var(--font-heading)' }}>
                Trips Lifecycle Tracker
              </h3>

              {/* Steps Timeline Wrapper */}
              <div className="flow-steps-container" style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: '10px'
              }}>
                {/* Connecting Line Underlay */}
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  left: '10%',
                  right: '10%',
                  height: '4px',
                  backgroundColor: 'var(--bg-cream)',
                  zIndex: 0,
                }} className="timeline-line-desktop" />

                {/* Connecting Line Progress */}
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  left: '10%',
                  width: `${(activeStep / 4) * 80}%`,
                  height: '4px',
                  backgroundColor: 'var(--color-blue-dark)',
                  zIndex: 1,
                  transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }} className="timeline-line-desktop-progress" />

                {/* Traveling Glow Dot Indicator */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: `calc(10% + ${(activeStep / 4) * 80}% - 6px)`,
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-blue-dark)',
                  boxShadow: '0 0 12px var(--color-blue-dark)',
                  zIndex: 2,
                  transition: 'left 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }} className="timeline-line-desktop-glow-dot" />

                {flowSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= activeStep;
                  const isActive = idx === activeStep;

                  return (
                    <div 
                      key={idx} 
                      className={`flow-step-item ${isActive ? 'active' : ''}`}
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '18%',
                        cursor: 'pointer'
                      }}
                      onClick={() => setActiveStep(idx)}
                    >
                      {/* Node circle */}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? 'var(--text-primary)' : isCompleted ? 'var(--color-blue-dark)' : '#ffffff',
                        border: isCompleted ? 'none' : '2px solid var(--border-light)',
                        color: isCompleted ? '#ffffff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.4s ease',
                        boxShadow: isActive ? '0 0 0 6px var(--color-blue-glow)' : 'none',
                        marginBottom: '12px'
                      }}>
                        <Icon size={20} />
                      </div>
                      
                      <div className="flow-step-labels" style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          marginBottom: '4px'
                        }}>
                          {step.title}
                        </div>
                        <div style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-light)',
                          lineHeight: '1.2'
                        }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AnimatedContent>

          {/* Mini Dispatch Detail Card */}
          <AnimatedContent delay={0.2} style={{ flexGrow: 1 }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: 'var(--shadow-soft)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}>
              {/* Highlight background blob */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '150px',
                height: '150px',
                background: 'radial-gradient(circle, var(--color-blue-glow) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-light)'
                  }}>
                    Active Dispatch Manifest
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--color-blue-dark)',
                    backgroundColor: 'var(--color-blue-glow)',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}>
                    VAN-05 Manifest
                  </span>
                </div>

                {/* Details Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-cream)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Vehicle Assigned</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>VAN-05 (Heavy Cargo)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-cream)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Operator / Driver</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Alex Mercer (Class A)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-cream)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Transit Route</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Nashik → Pune Hub</span>
                  </div>
                  
                  {/* Capacity Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Cargo Utilization</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>450 / 500 kg (90%)</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-cream)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <motion.div 
                        initial={{ width: '0%' }}
                        whileInView={{ width: '90%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          backgroundColor: 'var(--color-peach-dark)',
                          borderRadius: '4px',
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status footer with CTA placeholder */}
              <div style={{
                backgroundColor: 'var(--bg-cream)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-mint-dark)' }} />
                  Rule validation passed
                </div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: 'var(--text-primary)',
                  padding: '6px 12px',
                  borderRadius: '8px'
                }}>
                  Ready to Dispatch
                </span>
              </div>
            </div>
          </AnimatedContent>

        </div>
      </div>

      <style>{`
        /* Mobile Timeline Adjustments */
        @media (max-width: 768px) {
          .flow-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          
          .flow-steps-container {
            flex-direction: column !important;
            gap: 24px !important;
            align-items: flex-start !important;
            padding-left: 20px !important;
          }

          .timeline-line-desktop, .timeline-line-desktop-progress, .timeline-line-desktop-glow-dot {
            display: none !important; /* Hide horizontal desktop layout components */
          }

          /* Show a vertical line underlay on mobile */
          .flow-steps-container::before {
            content: '';
            position: absolute;
            top: 24px;
            left: 44px;
            bottom: 24px;
            width: 4px;
            backgroundColor: var(--bg-cream);
            z-index: 0;
          }

          .flow-step-item {
            flex-direction: row !important;
            width: 100% !important;
            gap: 20px !important;
            align-items: center !important;
          }

          .flow-step-item div {
            margin-bottom: 0 !important;
          }

          .flow-step-labels {
            text-align: left !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .timeline-line-desktop-glow-dot {
            transition: none !important;
            left: calc(10% + 80% - 6px) !important;
          }
        }
      `}</style>
    </section>
  );
}
