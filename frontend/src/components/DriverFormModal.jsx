import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DriverFormModal({ isOpen, onClose, onSubmit, initialData = null, isSaving = false, backendError = null }) {
  // Helper to format ISO date string to YYYY-MM-DD for date input
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form values state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    licenseNumber: initialData?.licenseNumber || '',
    licenseCategory: initialData?.licenseCategory || '',
    licenseExpiryDate: formatDateForInput(initialData?.licenseExpiryDate),
    contact: initialData?.contact || '',
    tripCompletionPercentage: initialData?.tripCompletionPercentage !== undefined ? initialData.tripCompletionPercentage : 100,
    safetyScore: initialData?.safetyScore !== undefined ? initialData.safetyScore : 100,
    status: initialData?.status || 'Available'
  });

  // Local Validation Errors state
  const [formErrors, setFormErrors] = useState({
    name: '',
    licenseNumber: '',
    licenseCategory: '',
    licenseExpiryDate: '',
    contact: '',
    tripCompletionPercentage: '',
    safetyScore: '',
    status: ''
  });

  // Handle inputs and clear error state dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedVal = value;

    if (name === 'tripCompletionPercentage' || name === 'safetyScore') {
      parsedVal = value === '' ? '' : Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: parsedVal }));

    // Clear validation error on type correction
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      licenseNumber: '',
      licenseCategory: '',
      licenseExpiryDate: '',
      contact: '',
      tripCompletionPercentage: '',
      safetyScore: '',
      status: ''
    };

    if (!formData.name.trim()) {
      errors.name = 'Full Name is required';
      isValid = false;
    }

    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = 'License Number is required';
      isValid = false;
    }

    if (!formData.licenseCategory) {
      errors.licenseCategory = 'Please select a license category';
      isValid = false;
    }

    if (!formData.licenseExpiryDate) {
      errors.licenseExpiryDate = 'License Expiry Date is required';
      isValid = false;
    }

    if (!formData.contact.trim()) {
      errors.contact = 'Contact Number is required';
      isValid = false;
    }

    if (formData.tripCompletionPercentage === '') {
      errors.tripCompletionPercentage = 'Trip Completion is required';
      isValid = false;
    } else if (Number(formData.tripCompletionPercentage) < 0 || Number(formData.tripCompletionPercentage) > 100) {
      errors.tripCompletionPercentage = 'Percentage must be between 0 and 100';
      isValid = false;
    }

    if (formData.safetyScore === '') {
      errors.safetyScore = 'Safety Score is required';
      isValid = false;
    } else if (Number(formData.safetyScore) < 0 || Number(formData.safetyScore) > 100) {
      errors.safetyScore = 'Score must be between 0 and 100';
      isValid = false;
    }

    if (!formData.status) {
      errors.status = 'Status is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(27, 36, 48, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 9990,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '550px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 40px -10px rgba(27, 36, 48, 0.1)',
                position: 'relative',
                textAlign: 'left'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: '16px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '1.35rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--text-primary)'
                }}>
                  {initialData ? 'Edit Driver Profile' : 'Register New Driver'}
                </h3>
                <button 
                  onClick={onClose}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-light)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Backend API Errors (such as duplicate license keys) */}
              {backendError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  {backendError}
                </div>
              )}

              {/* Form Grid */}
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Row: Full Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Full Name
                  </label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Aarav Sharma"
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: formErrors.name ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  {formErrors.name && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <AlertCircle size={12} /> {formErrors.name}
                    </span>
                  )}
                </div>

                {/* Two-Column: License Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Column 1: License Number */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      License Number
                    </label>
                    <input 
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="e.g. MH15DRV001"
                      disabled={!!initialData} // Lock license on Edit
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.licenseNumber ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: initialData ? 'var(--bg-cream)' : 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        color: initialData ? 'var(--text-secondary)' : 'var(--text-primary)'
                      }}
                    />
                    {formErrors.licenseNumber && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.licenseNumber}
                      </span>
                    )}
                  </div>

                  {/* Column 2: License Category */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      License Category
                    </label>
                    <select 
                      name="licenseCategory"
                      value={formData.licenseCategory}
                      onChange={handleChange}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.licenseCategory ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="" disabled>Select Category</option>
                      <option value="LMV">LMV (Light Motor Vehicle)</option>
                      <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                      <option value="HGMV">HGMV (Heavy Goods Motor Vehicle)</option>
                      <option value="Transport">Transport</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.licenseCategory && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.licenseCategory}
                      </span>
                    )}
                  </div>
                </div>

                {/* Two-Column: Contact & Expiry */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Column 1: Expiry Date */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      License Expiry Date
                    </label>
                    <input 
                      type="date"
                      name="licenseExpiryDate"
                      value={formData.licenseExpiryDate}
                      onChange={handleChange}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.licenseExpiryDate ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.licenseExpiryDate && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.licenseExpiryDate}
                      </span>
                    )}
                  </div>

                  {/* Column 2: Contact */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Contact Number
                    </label>
                    <input 
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.contact ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.contact && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.contact}
                      </span>
                    )}
                  </div>
                </div>

                {/* Two-Column: Performance statistics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Column 1: Trip Completion */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Trip Completion (%)
                    </label>
                    <input 
                      type="number"
                      name="tripCompletionPercentage"
                      value={formData.tripCompletionPercentage}
                      onChange={handleChange}
                      placeholder="e.g. 100"
                      min="0"
                      max="100"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.tripCompletionPercentage ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.tripCompletionPercentage && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.tripCompletionPercentage}
                      </span>
                    )}
                  </div>

                  {/* Column 2: Safety Score */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Safety Score (/100)
                    </label>
                    <input 
                      type="number"
                      name="safetyScore"
                      value={formData.safetyScore}
                      onChange={handleChange}
                      placeholder="e.g. 100"
                      min="0"
                      max="100"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.safetyScore ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.safetyScore && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.safetyScore}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row: Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Operational Status
                  </label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: formErrors.status ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                  {formErrors.status && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <AlertCircle size={12} /> {formErrors.status}
                    </span>
                  )}
                </div>

                {/* Buttons controls */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '24px',
                  justifyContent: 'flex-end'
                }}>
                  <button 
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                    style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="btn btn-primary"
                    style={{ 
                      padding: '10px 20px', 
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : initialData ? 'Save Changes' : 'Register Driver'}
                  </button>
                </div>

              </form>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
