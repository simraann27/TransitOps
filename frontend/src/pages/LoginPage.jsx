import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation, Mail, Lock, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Field Validation Errors State
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    role: ''
  });

  // Successful Login State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation RegEx for email
  const validateEmail = (emailStr) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  // Input Change Handlers that clear errors when user corrects the values
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (errors.email) {
      if (val.trim() === '') {
        setErrors(prev => ({ ...prev, email: 'Email address is required' }));
      } else if (!validateEmail(val)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (errors.password) {
      if (val.length >= 6) {
        setErrors(prev => ({ ...prev, password: '' }));
      } else {
        setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      }
    }
  };

  const handleRoleChange = (e) => {
    const val = e.target.value;
    setRole(val);
    if (errors.role && val !== '') {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Perform strict validation checks
    let hasValidationError = false;
    const newErrors = { email: '', password: '', role: '' };

    if (email.trim() === '') {
      newErrors.email = 'Email address is required';
      hasValidationError = true;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      hasValidationError = true;
    }

    if (password.length === 0) {
      newErrors.password = 'Password is required';
      hasValidationError = true;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      hasValidationError = true;
    }

    if (role === '') {
      newErrors.role = 'Please select an operational role';
      hasValidationError = true;
    }

    setErrors(newErrors);

    if (hasValidationError) {
      return;
    }

    // Success state triggering
    setIsSubmitting(true);
    
    setTimeout(() => {
      login(email, password, role);
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 1200);
  };

  // Demo Fast Login click handler
  const handleQuickDemoFill = (selectedRole) => {
    setEmail('simran.tupe@transitops.com');
    setPassword('odoo2026');
    setRole(selectedRole);
    // Clear any active validation errors
    setErrors({ email: '', password: '', role: '' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'var(--font-sans)',
      backgroundColor: 'var(--bg-warm-white)'
    }} className="login-split-page">
      
      {/* LEFT SIDE: Brand Visual Panel */}
      <div className="login-brand-panel" style={{
        flex: 1,
        position: 'relative',
        backgroundColor: 'var(--bg-cream)',
        borderRight: '1px solid var(--border-light)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        textAlign: 'left'
      }}>
        {/* Soft background glows */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, var(--color-blue-glow) 0%, transparent 70%)',
          filter: 'blur(30px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, var(--color-lavender-glow) 0%, transparent 70%)',
          filter: 'blur(35px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Video loop underlay */}
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
            opacity: 0.15,
            filter: 'saturate(0.3)'
          }}
        >
          <source src="/videos/logistics_hero.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(246, 244, 238, 0.75)',
          zIndex: 1
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-blue)',
              color: 'var(--text-primary)',
            }}>
              <Navigation size={18} style={{ transform: 'rotate(45deg)' }} />
            </div>
            <span>Transit<span style={{ color: 'var(--color-lavender-dark)' }}>Ops</span></span>
          </Link>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>
            Smart Transport Operations Platform
          </div>
        </div>

        {/* Brand Core Headlines */}
        <div style={{ position: 'relative', zIndex: 2, margin: '80px 0' }}>
          <h2 style={{
            fontSize: '3rem',
            lineHeight: '1.15',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '20px'
          }}>
            Every operation.<br />
            <span className="highlight-blue">One command center.</span>
          </h2>
          <p style={{
            fontSize: '1.05rem',
            lineHeight: '1.6',
            color: 'var(--text-secondary)',
            maxWidth: '460px'
          }}>
            Coordinate ready vehicles, verified operators, active dispatches, and real-time fuel/maintenance logs under a single dashboard with server-enforced safety compliance.
          </p>
        </div>

        {/* Brand Bottom attribution */}
        <div style={{ position: 'relative', zIndex: 2, fontSize: '0.82rem', color: 'var(--text-light)', fontWeight: 600 }}>
          TransitOps Control Console • Built for Odoo Hackathon 2026
        </div>
      </div>

      {/* RIGHT SIDE: Login form panel */}
      <div className="login-form-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 48px',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto', textAlign: 'left' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Sign in to access your TransitOps command center.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Field: Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <div className="input-group" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-light)' }}>
                  <Mail size={18} />
                </div>
                <input 
                  type="text" 
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="name@company.com"
                  className={errors.email ? 'input-error' : ''}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: errors.email ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                    backgroundColor: errors.email ? '#fef2f2' : 'var(--bg-warm-white)',
                    fontSize: '0.92rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      color: '#b91c1c',
                      backgroundColor: '#fef2f2',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      marginTop: '4px',
                      fontWeight: 500
                    }}
                  >
                    <AlertCircle size={14} />
                    {errors.email}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field: Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Password
              </label>
              <div className="input-group" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-light)' }}>
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={errors.password ? 'input-error' : ''}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 42px',
                    borderRadius: '12px',
                    border: errors.password ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                    backgroundColor: errors.password ? '#fef2f2' : 'var(--bg-warm-white)',
                    fontSize: '0.92rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-light)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      color: '#b91c1c',
                      backgroundColor: '#fef2f2',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      marginTop: '4px',
                      fontWeight: 500
                    }}
                  >
                    <AlertCircle size={14} />
                    {errors.password}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field: Role Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Authorized Role
              </label>
              <div className="input-group" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-light)', pointerEvents: 'none' }}>
                  <Shield size={18} />
                </div>
                <select 
                  value={role}
                  onChange={handleRoleChange}
                  className={errors.role ? 'input-error' : ''}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: errors.role ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                    backgroundColor: errors.role ? '#fef2f2' : 'var(--bg-warm-white)',
                    fontSize: '0.92rem',
                    color: role === '' ? 'var(--text-light)' : 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.3s',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" disabled>Select your operations role</option>
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                </select>
                {/* Custom arrow decoration */}
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  width: '0',
                  height: '0',
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '6px solid var(--text-light)',
                  pointerEvents: 'none'
                }} />
              </div>
              <AnimatePresence>
                {errors.role && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      color: '#b91c1c',
                      backgroundColor: '#fef2f2',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      marginTop: '4px',
                      fontWeight: 500
                    }}
                  >
                    <AlertCircle size={14} />
                    {errors.role}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Extra checks row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem',
              marginTop: '4px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: 'var(--color-blue-dark)',
                    cursor: 'pointer'
                  }}
                />
                Remember me
              </label>
              <span 
                style={{ color: 'var(--color-blue-dark)', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => alert("Demo Password Reset: Any password of 6+ characters will grant access.")}
              >
                Forgot password?
              </span>
            </div>

            {/* Button */}
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                padding: '14px',
                borderRadius: '12px',
                fontSize: '0.95rem',
                marginTop: '10px',
                width: '100%',
                position: 'relative'
              }}
            >
              {isSubmitting ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2.5px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s infinite linear',
                  margin: '0 auto'
                }} />
              ) : "Sign In"}
            </button>
          </form>

          {/* DEMO ACCESS SECTION */}
          <div style={{
            marginTop: '36px',
            backgroundColor: 'var(--bg-cream)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <h4 style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              letterSpacing: '0.05em',
              marginBottom: '10px'
            }}>
              💡 Hackathon Demo Access
            </h4>
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.4',
              marginBottom: '14px'
            }}>
              Select a role below to automatically fill credential details and preview role-specific access permissions:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              <button 
                type="button"
                onClick={() => handleQuickDemoFill('Fleet Manager')}
                style={{
                  padding: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-light-blue)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
              >
                Fleet Manager
              </button>
              <button 
                type="button"
                onClick={() => handleQuickDemoFill('Dispatcher')}
                style={{
                  padding: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-light-blue)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
              >
                Dispatcher
              </button>
              <button 
                type="button"
                onClick={() => handleQuickDemoFill('Safety Officer')}
                style={{
                  padding: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-light-blue)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
              >
                Safety Officer
              </button>
              <button 
                type="button"
                onClick={() => handleQuickDemoFill('Financial Analyst')}
                style={{
                  padding: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-light-blue)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
              >
                Financial Analyst
              </button>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        /* Focus styles for inputs */
        .input-group input:focus, .input-group select:focus {
          border-color: var(--color-blue-dark) !important;
          box-shadow: 0 0 0 4px var(--color-blue-glow) !important;
          background-color: #ffffff !important;
        }

        /* Responsive controls */
        @media (max-width: 992px) {
          .login-brand-panel {
            display: none !important; /* Hide visual brand panel on tablet/mobile for screen economy */
          }
          .login-split-page {
            justify-content: center;
          }
          .login-form-panel {
            flex: none !important;
            max-width: 500px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
