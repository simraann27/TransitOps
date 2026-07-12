import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

export default function SignupPage() {
  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setBackendError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setBackendError(err.message || 'Google registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setBackendError('Google Sign-In was unsuccessful. Please try again.');
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [backendError, setBackendError] = useState('');

  // Field Validation Errors State
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation RegEx for email
  const validateEmail = (emailStr) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  // Change Handlers
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (errors.name && val.trim() !== '') {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

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
      if (val.length >= 8) {
        setErrors(prev => ({ ...prev, password: '' }));
      } else {
        setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (errors.confirmPassword) {
      if (val === password) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');

    // Perform strict validation checks
    let hasValidationError = false;
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };

    if (name.trim() === '') {
      newErrors.name = 'Full Name is required';
      hasValidationError = true;
    }

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
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      hasValidationError = true;
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
      hasValidationError = true;
    }

    setErrors(newErrors);

    if (hasValidationError) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setBackendError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
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
            <img 
              src="/transitops-logo.svg" 
              alt="TransitOps Logo" 
              style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
            />
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
            Create your<br />
            <span className="highlight-blue">TransitOps Account</span>
          </h2>
          <p style={{
            fontSize: '1.05rem',
            lineHeight: '1.6',
            color: 'var(--text-secondary)',
            maxWidth: '460px'
          }}>
            Begin managing your vehicles, operators, trips and maintenance logs under a secure server-enforced platform.
          </p>
        </div>

        {/* Brand Bottom attribution */}
        <div style={{ position: 'relative', zIndex: 2, fontSize: '0.82rem', color: 'var(--text-light)', fontWeight: 600 }}>
          TransitOps Control Console • Upgrade v1.0
        </div>
      </div>

      {/* RIGHT SIDE: Signup form panel */}
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
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              Register Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Sign up to get access to the dashboard environment.
            </p>
          </div>

          {/* Backend error display */}
          <AnimatePresence>
            {backendError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1.5px solid #f87171',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#b91c1c',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px'
                }}
              >
                <AlertCircle size={16} />
                <span>{backendError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Field: Full Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Full Name
              </label>
              <div className="input-group" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', left: '14px', color: 'var(--text-light)' }}>
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={handleNameChange}
                  placeholder="John Doe"
                  className={errors.name ? 'input-error' : ''}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 42px',
                    borderRadius: '10px',
                    border: errors.name ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                    backgroundColor: errors.name ? '#fef2f2' : 'var(--bg-warm-white)',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                />
              </div>
              {errors.name && <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '2px' }}>{errors.name}</div>}
            </div>

            {/* Field: Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <div className="input-group" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', left: '14px', color: 'var(--text-light)' }}>
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
                    padding: '10px 14px 10px 42px',
                    borderRadius: '10px',
                    border: errors.email ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                    backgroundColor: errors.email ? '#fef2f2' : 'var(--bg-warm-white)',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                />
              </div>
              {errors.email && <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '2px' }}>{errors.email}</div>}
            </div>

            {/* Field: Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Password
              </label>
              <div className="input-group" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', left: '14px', color: 'var(--text-light)' }}>
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
                    padding: '10px 40px 10px 42px',
                    borderRadius: '10px',
                    border: errors.password ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                    backgroundColor: errors.password ? '#fef2f2' : 'var(--bg-warm-white)',
                    fontSize: '0.9rem',
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
                    top: '12px',
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
              {errors.password && <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '2px' }}>{errors.password}</div>}
            </div>

            {/* Field: Confirm Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Confirm Password
              </label>
              <div className="input-group" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', left: '14px', color: 'var(--text-light)' }}>
                  <Lock size={18} />
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="••••••••"
                  className={errors.confirmPassword ? 'input-error' : ''}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 42px',
                    borderRadius: '10px',
                    border: errors.confirmPassword ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                    backgroundColor: errors.confirmPassword ? '#fef2f2' : 'var(--bg-warm-white)',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    top: '12px',
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
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '2px' }}>{errors.confirmPassword}</div>}
            </div>

            {/* Info Message */}
            <div style={{
              backgroundColor: 'var(--color-blue-glow)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.8rem',
              color: 'var(--color-blue-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '4px'
            }}>
              <Info size={14} style={{ flexShrink: 0 }} />
              <span>New accounts start with Dispatcher access.</span>
            </div>

            {/* Button */}
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                padding: '12px',
                borderRadius: '10px',
                fontSize: '0.92rem',
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
              ) : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 600 }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
            <span style={{ padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
          </div>

          {/* Google Sign-in button wrapper */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              shape="rectangular"
              width="324"
            />
          </div>

          {/* Link to Login */}
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-blue-dark)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>

        </div>
      </div>

      <style>{`
        .input-group input:focus {
          border-color: var(--color-blue-dark) !important;
          box-shadow: 0 0 0 4px var(--color-blue-glow) !important;
          background-color: #ffffff !important;
        }

        @media (max-width: 992px) {
          .login-brand-panel {
            display: none !important;
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
