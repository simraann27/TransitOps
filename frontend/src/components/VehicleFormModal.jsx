import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VehicleFormModal({ isOpen, onClose, onSubmit, initialData = null, isSaving = false, backendError = null }) {
  // Form values state initialized directly from initialData prop (relies on key-based remounting)
  const [formData, setFormData] = useState({
    registrationNumber: initialData?.registrationNumber || '',
    name: initialData?.name || '',
    type: initialData?.type || '',
    maxLoadCapacity: initialData?.maxLoadCapacity || '',
    odometer: initialData?.odometer || 0,
    acquisitionCost: initialData?.acquisitionCost || '',
    status: initialData?.status || 'Available'
  });

  // Local Validation Errors state
  const [formErrors, setFormErrors] = useState({
    registrationNumber: '',
    name: '',
    type: '',
    maxLoadCapacity: '',
    odometer: '',
    acquisitionCost: '',
    status: ''
  });

  // Handle inputs and clear error state dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedVal = value;

    if (name === 'maxLoadCapacity' || name === 'odometer' || name === 'acquisitionCost') {
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
      registrationNumber: '',
      name: '',
      type: '',
      maxLoadCapacity: '',
      odometer: '',
      acquisitionCost: '',
      status: ''
    };

    if (!formData.registrationNumber.trim()) {
      errors.registrationNumber = 'Registration Number is required';
      isValid = false;
    }

    if (!formData.name.trim()) {
      errors.name = 'Vehicle Name / Model is required';
      isValid = false;
    }

    if (!formData.type) {
      errors.type = 'Please select a vehicle type';
      isValid = false;
    }

    if (formData.maxLoadCapacity === '') {
      errors.maxLoadCapacity = 'Load Capacity is required';
      isValid = false;
    } else if (Number(formData.maxLoadCapacity) <= 0) {
      errors.maxLoadCapacity = 'Load Capacity must be greater than 0';
      isValid = false;
    }

    if (formData.odometer === '') {
      errors.odometer = 'Odometer reading is required';
      isValid = false;
    } else if (Number(formData.odometer) < 0) {
      errors.odometer = 'Odometer reading cannot be negative';
      isValid = false;
    }

    if (formData.acquisitionCost === '') {
      errors.acquisitionCost = 'Acquisition Cost is required';
      isValid = false;
    } else if (Number(formData.acquisitionCost) <= 0) {
      errors.acquisitionCost = 'Acquisition Cost must be greater than 0';
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
                  {initialData ? 'Edit Vehicle Profile' : 'Register New Vehicle'}
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

              {/* Backend API Errors (such as duplicate key values) */}
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
                
                {/* Row: Reg Number */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Registration Number
                  </label>
                  <input 
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g. MH15AB1234"
                    disabled={!!initialData} // Lock reg number on edit
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: formErrors.registrationNumber ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                      backgroundColor: initialData ? 'var(--bg-cream)' : 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      color: initialData ? 'var(--text-secondary)' : 'var(--text-primary)'
                    }}
                  />
                  {formErrors.registrationNumber && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <AlertCircle size={12} /> {formErrors.registrationNumber}
                    </span>
                  )}
                </div>

                {/* Row: Name / Model */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Vehicle Name / Model
                  </label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Van-05"
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

                {/* Two-Column form grids */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Column 1: Vehicle Type */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Vehicle Type
                    </label>
                    <select 
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.type ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="" disabled>Select Type</option>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                      <option value="Mini Truck">Mini Truck</option>
                      <option value="Trailer">Trailer</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.type && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.type}
                      </span>
                    )}
                  </div>

                  {/* Column 2: Load Capacity */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Max Load Capacity (kg)
                    </label>
                    <input 
                      type="number"
                      name="maxLoadCapacity"
                      value={formData.maxLoadCapacity}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                      min="1"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.maxLoadCapacity ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.maxLoadCapacity && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.maxLoadCapacity}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Column 1: Odometer */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Odometer (km)
                    </label>
                    <input 
                      type="number"
                      name="odometer"
                      value={formData.odometer}
                      onChange={handleChange}
                      placeholder="e.g. 12000"
                      min="0"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.odometer ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.odometer && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.odometer}
                      </span>
                    )}
                  </div>

                  {/* Column 2: Cost */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Acquisition Cost
                    </label>
                    <input 
                      type="number"
                      name="acquisitionCost"
                      value={formData.acquisitionCost}
                      onChange={handleChange}
                      placeholder="e.g. 850000"
                      min="1"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.acquisitionCost ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.acquisitionCost && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.acquisitionCost}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row: Status select */}
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
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
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
                    {isSaving ? 'Saving...' : initialData ? 'Save Changes' : 'Register Vehicle'}
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
