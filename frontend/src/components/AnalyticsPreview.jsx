import AnimatedContent from './ui/AnimatedContent';
import { AreaChart, TrendingUp } from 'lucide-react';

export default function AnalyticsPreview() {
  const cards = [
    { label: "Fleet Utilization", val: "87%", trend: "+2.4% vs last month", color: "var(--color-blue-dark)" },
    { label: "Fuel Efficiency", val: "8.4 km/l", trend: "+0.2 km/l average", color: "var(--color-lavender-dark)" },
    { label: "Operational Cost", val: "₹34,070", trend: "-5.8% cost saved", color: "var(--color-peach-dark)" },
    { label: "Vehicle ROI", val: "14.3%", trend: "+1.5% target return", color: "var(--color-mint-dark)" }
  ];

  return (
    <section id="analytics-preview" className="section-padding" style={{
      backgroundColor: 'var(--bg-light-lavender)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle abstract route-line SVG decoration */}
      <svg style={{
        position: 'absolute',
        top: '20%',
        left: '-10%',
        width: '350px',
        height: '350px',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0
      }} viewBox="0 0 100 100">
        <path d="M0,0 Q50,100 100,0" fill="none" stroke="var(--color-lavender-dark)" strokeWidth="0.8" strokeDasharray="3,3" />
      </svg>
      <div className="container">
        
        {/* Section Header */}
        <AnimatedContent>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge">ANALYTICS PREVIEW</div>
            <h2 style={{
              fontSize: '2.5rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              See the operation<br />
              <span className="highlight-lavender">behind the numbers.</span>
            </h2>
            <p style={{
              maxWidth: '600px',
              margin: '0 auto',
              color: 'var(--text-secondary)',
              fontSize: '1.05rem'
            }}>
              Monitor efficiency and costs inside a dashboard built to track fleet ROI in real-time.
            </p>
          </div>
        </AnimatedContent>

        <div className="grid-2 analytics-grid" style={{ gap: '60px', alignItems: 'center' }}>
          
          {/* Metrics summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }} className="analytics-card-grid">
            {cards.map((card, idx) => (
              <AnimatedContent key={idx} delay={idx * 0.08}>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-soft)',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {card.label}
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)',
                    lineHeight: '1.2',
                    marginBottom: '6px'
                  }}>
                    {card.val}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <TrendingUp size={12} />
                    {card.trend}
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>

          {/* Interactive Chart Preview */}
          <AnimatedContent delay={0.2} style={{ width: '100%' }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: 'var(--shadow-hover)',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Card top banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    Weekly Operating Efficiency
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Aggregated fleet logistics metrics (Mon - Sun)
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--color-blue-dark)',
                    backgroundColor: 'var(--color-blue-glow)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <AreaChart size={12} /> Chart active
                  </span>
                </div>
              </div>

              {/* Styled SVG Line Chart representing telemetry data */}
              <div style={{ position: 'relative', height: '200px', width: '100%', marginBottom: '16px' }}>
                <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="var(--bg-cream)" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="var(--bg-cream)" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="var(--bg-cream)" strokeWidth="1" strokeDasharray="5,5" />

                  {/* Gradient Area under curve */}
                  <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-blue)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--color-blue)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Filled Area */}
                  <path 
                    d="M 0 130 Q 70 80, 150 110 T 300 60 T 420 70 T 500 40 L 500 200 L 0 200 Z" 
                    fill="url(#chart-grad)" 
                  />

                  {/* Chart Line */}
                  <path 
                    d="M 0 130 Q 70 80, 150 110 T 300 60 T 420 70 T 500 40" 
                    fill="none" 
                    stroke="var(--color-blue-dark)" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />

                  {/* Node Circles */}
                  <circle cx="150" cy="110" r="5" fill="var(--color-peach-dark)" stroke="#fff" strokeWidth="2" />
                  <circle cx="300" cy="60" r="5" fill="var(--color-lavender-dark)" stroke="#fff" strokeWidth="2" />
                  <circle cx="500" cy="40" r="5" fill="var(--color-mint-dark)" stroke="#fff" strokeWidth="2" />
                </svg>
              </div>

              {/* Chart labels / timeline */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-light)',
                fontWeight: 600,
                borderTop: '1px solid var(--bg-cream)',
                paddingTop: '12px'
              }}>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </AnimatedContent>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .analytics-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 480px) {
          .analytics-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
