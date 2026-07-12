import AnimatedContent from './ui/AnimatedContent';
import { ShieldAlert, UserCheck, CalendarDays, RefreshCw, Check } from 'lucide-react';

export default function Intelligence() {
  const rules = [
    {
      title: "Capacity Protected",
      description: "Cargo weight or volume exceeding vehicle limits is flagged and blocked automatically during load manifest generation.",
      color: "var(--color-peach-dark)",
      bgColor: "var(--color-peach-glow)",
      icon: ShieldAlert
    },
    {
      title: "Eligible Drivers Only",
      description: "Expired commercial licenses, medical certificate lapses, or active safety incidents freeze driver dispatch eligibility.",
      color: "var(--color-lavender-dark)",
      bgColor: "var(--color-lavender-glow)",
      icon: UserCheck
    },
    {
      title: "Live Fleet Status",
      description: "Vehicles undergoing maintenance or currently checked out on active trips are restricted from double assignment.",
      color: "var(--color-blue-dark)",
      bgColor: "var(--color-blue-glow)",
      icon: CalendarDays
    },
    {
      title: "Automatic Transitions",
      description: "Statuses cascade instantly: finishing a trip automatically marks the vehicle and driver available for matching.",
      color: "var(--color-mint-dark)",
      bgColor: "var(--color-mint-glow)",
      icon: RefreshCw
    }
  ];

  return (
    <section id="intelligence" className="section-padding" style={{
      backgroundColor: 'var(--bg-light-blue)',
      borderTop: '1px solid var(--border-light)',
      borderBottom: '1px solid var(--border-light)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle abstract route-line SVG decoration */}
      <svg style={{
        position: 'absolute',
        top: '5%',
        right: '-5%',
        width: '300px',
        height: '400px',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0
      }} viewBox="0 0 100 100">
        <path d="M0,50 Q50,0 100,50 T0,50" fill="none" stroke="var(--color-blue-dark)" strokeWidth="0.8" strokeDasharray="3,3" />
      </svg>
      <div className="container">
        
        {/* Section Header */}
        <AnimatedContent>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge">SYSTEM INTELLIGENCE</div>
            <h2 style={{
              fontSize: '2.5rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              Built to prevent<br />
              <span className="highlight-peach">operational mistakes.</span>
            </h2>
            <p style={{
              maxWidth: '650px',
              margin: '0 auto',
              color: 'var(--text-secondary)',
              fontSize: '1.05rem'
            }}>
              TransitOps enforces real-time logistical validation rules at the server level, keeping invalid schedules off the road.
            </p>
          </div>
        </AnimatedContent>

        {/* Validation Cards Grid */}
        <div className="grid-2 rules-grid" style={{ gap: '30px' }}>
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <AnimatedContent key={idx} delay={idx * 0.1}>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: '20px',
                  padding: '28px',
                  boxShadow: 'var(--shadow-soft)',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Subtle checkmark overlay top right */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: rule.bgColor,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    padding: '8px'
                  }}>
                    <Check size={16} style={{ color: rule.color }} />
                  </div>

                  <div style={{
                    backgroundColor: rule.bgColor,
                    color: rule.color,
                    padding: '12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={24} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-heading)'
                    }}>
                      {rule.title}
                    </h3>
                    <p style={{
                      fontSize: '0.92rem',
                      lineHeight: '1.6',
                      color: 'var(--text-secondary)'
                    }}>
                      {rule.description}
                    </p>
                  </div>
                </div>
              </AnimatedContent>
            );
          })}
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .rules-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
