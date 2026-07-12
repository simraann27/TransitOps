import { useEffect, useState, useRef } from 'react';
import AnimatedContent from './ui/AnimatedContent';

function Counter({ targetValue, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime = null;

          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Cubic ease-out
            const easeOutVal = 1 - Math.pow(1 - percentage, 3);
            setCount(Math.floor(easeOutVal * targetValue));

            if (percentage < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(targetValue);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [targetValue, duration]);

  return <span ref={elementRef}>{count}{suffix}</span>;
}

export default function OperationsMetrics() {
  const metrics = [
    { target: 53, label: 'Active Vehicles', suffix: '+' },
    { target: 18, label: 'Live Trips', suffix: '' },
    { target: 87, label: 'Fleet Utilization', suffix: '%' },
    { target: 94, label: 'On-Time Operations', suffix: '%' },
  ];

  return (
    <section style={{
      backgroundColor: 'var(--bg-cream)',
      borderTop: '1px solid var(--border-light)',
      borderBottom: '1px solid var(--border-light)',
      padding: '40px 0',
      position: 'relative',
      zIndex: 2,
    }}>
      <div className="container">
        <AnimatedContent>
          <div className="grid-4 metrics-grid" style={{ gap: '30px', textAlign: 'center' }}>
            {metrics.map((metric, idx) => (
              <div key={idx} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
              }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-primary)',
                  lineHeight: '1.2',
                  marginBottom: '4px',
                }}>
                  <Counter targetValue={metric.target} suffix={metric.suffix} />
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.02em',
                }}>
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </AnimatedContent>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
