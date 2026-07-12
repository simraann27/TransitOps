import { useState } from 'react';

export default function SpotlightCard({ children, className = "", spotlightColor = "rgba(165, 196, 247, 0.15)", style = {} }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  const handleMouseEnter = () => setIsFocused(true);
  const handleMouseLeave = () => setIsFocused(false);

  return (
    <div
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        border: '1px solid var(--border-light)',
        background: '#ffffff',
        padding: '24px',
        transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-soft)',
        ...style,
      }}
    >
      {isFocused && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
            zIndex: 1,
            transition: 'background 0.1s ease',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
