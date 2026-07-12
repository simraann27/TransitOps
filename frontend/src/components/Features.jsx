import SpotlightCard from './ui/SpotlightCard';
import AnimatedContent from './ui/AnimatedContent';
import { Truck, Navigation, Wrench, TrendingUp } from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      title: "Fleet Control",
      description: "Track vehicle availability, capacity, odometer data, and operational status from one place.",
      icon: Truck,
      color: "var(--color-blue-dark)",
      bgColor: "var(--color-blue-glow)",
      accentLight: "rgba(165, 196, 247, 0.12)",
      className: "feature-card-blue"
    },
    {
      title: "Smart Dispatch",
      description: "Assign available vehicles and eligible drivers while preventing capacity and availability conflicts.",
      icon: Navigation,
      color: "var(--color-lavender-dark)",
      bgColor: "var(--color-lavender-glow)",
      accentLight: "rgba(212, 197, 249, 0.12)",
      className: "feature-card-lavender"
    },
    {
      title: "Maintenance Intelligence",
      description: "Move vehicles into maintenance workflows and keep unavailable vehicles out of dispatch.",
      icon: Wrench,
      color: "var(--color-peach-dark)",
      bgColor: "var(--color-peach-glow)",
      accentLight: "rgba(249, 213, 197, 0.12)",
      className: "feature-card-peach"
    },
    {
      title: "Cost Analytics",
      description: "Understand fuel, maintenance, and operational expenses through clear fleet insights.",
      icon: TrendingUp,
      color: "var(--color-mint-dark)",
      bgColor: "var(--color-mint-glow)",
      accentLight: "rgba(197, 249, 215, 0.12)",
      className: "feature-card-mint"
    }
  ];

  return (
    <section id="features" className="section-padding" style={{
      backgroundColor: 'var(--bg-light-lavender)',
      borderTop: '1px solid var(--border-light)',
      borderBottom: '1px solid var(--border-light)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle abstract route-line SVG decoration */}
      <svg style={{
        position: 'absolute',
        bottom: '5%',
        right: '-5%',
        width: '350px',
        height: '350px',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0
      }} viewBox="0 0 100 100">
        <path d="M100,80 Q60,40 90,10 T0,20" fill="none" stroke="var(--color-lavender-dark)" strokeWidth="0.8" strokeDasharray="3,3" />
      </svg>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Section Header */}
        <AnimatedContent>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge">POWERFUL UTILITIES</div>
            <h2 style={{
              fontSize: '2.5rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              Operational integrity.<br />
              <span className="highlight-lavender">Engineered into every layer.</span>
            </h2>
            <p style={{
              maxWidth: '600px',
              margin: '0 auto',
              color: 'var(--text-secondary)',
              fontSize: '1.05rem'
            }}>
              Explore the critical feature pillars that allow TransitOps to power your fleet without operational friction.
            </p>
          </div>
        </AnimatedContent>

        {/* Feature Cards Grid */}
        <div className="grid-4 features-card-grid" style={{ gap: '24px' }}>
          {featuresList.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <AnimatedContent key={idx} delay={idx * 0.1}>
                <SpotlightCard 
                  spotlightColor={feature.accentLight}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    padding: '32px 24px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease'
                  }}
                  className={`feature-card-hover ${feature.className}`}
                >
                  <div className="feature-icon-wrapper" style={{
                    backgroundColor: feature.bgColor,
                    color: feature.color,
                    padding: '12px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}>
                    <Icon size={24} />
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {feature.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '0.92rem',
                    lineHeight: '1.6',
                    color: 'var(--text-secondary)'
                  }}>
                    {feature.description}
                  </p>
                </SpotlightCard>
              </AnimatedContent>
            );
          })}
        </div>

      </div>

      {/* Subtle hover lift, glows and icon transformations */}
      <style>{`
        .feature-card-hover:hover {
          transform: translateY(-6px) !important;
        }

        .feature-card-hover:hover .feature-icon-wrapper {
          transform: scale(1.12) rotate(6deg);
        }

        /* Specific card hover glows matching branding */
        .feature-card-blue:hover {
          box-shadow: 0 20px 40px -15px var(--color-blue-glow) !important;
          border-color: var(--color-blue-dark) !important;
        }
        .feature-card-lavender:hover {
          box-shadow: 0 20px 40px -15px var(--color-lavender-glow) !important;
          border-color: var(--color-lavender-dark) !important;
        }
        .feature-card-peach:hover {
          box-shadow: 0 20px 40px -15px var(--color-peach-glow) !important;
          border-color: var(--color-peach-dark) !important;
        }
        .feature-card-mint:hover {
          box-shadow: 0 20px 40px -15px var(--color-mint-glow) !important;
          border-color: var(--color-mint-dark) !important;
        }
      `}</style>
    </section>
  );
}
