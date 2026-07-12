import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MaintenanceFormModal({ isOpen, onClose, onSubmit, initialData = null, isSaving = false, backendError = null }) {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Helper to format ISO date string to YYYY-MM-DD for date input
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form values state initialized directly from props (key-based remount resets this automatically)
  const [formData, setFormData] = useState({
    vehicle: initialData?.vehicle?._id || initialData?.vehicle || '',
    serviceType: initialData?.serviceType || '',
    description: initialData?.description || '',
    cost: initialData?.cost !== undefined ? initialData.cost : '',
    date: formatDateForInput(initialData?.date) || formatDateForInput(new Date().toISOString()),
    status: initialData?.status || 'Active'
  });

  // Local Validation Errors state
  const [formErrors, setFormErrors] = useState({
    vehicle: '',
    serviceType: '',
    cost: '',
    date: ''
  });

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch vehicles on opening
  useEffect(() => {
    if (isOpen) {
      const fetchVehicles = async () => {
        setLoadingVehicles(true);
        try {
          const response = await fetch(`${apiBaseUrl}/api/vehicles`);
          const data = await response.json();
          if (data.success) {
            setVehicles(data.vehicles || []);
          }
        } catch (error) {
          console.error("Failed to load vehicles for maintenance schedule form:", error);
        } finally {
          setLoadingVehicles(false);
        }
      };
      fetchVehicles();
    }
  }, [isOpen, apiBaseUrl]);

  // Handle inputs and clear error state dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedVal = value;

    if (name === 'cost') {
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
      vehicle: '',
      serviceType: '',
      cost: '',
      date: ''
    };

    if (!formData.vehicle) {
      errors.vehicle = 'Please select a vehicle';
      isValid = false;
    }

    if (!formData.serviceType) {
      errors.serviceType = 'Please select a service type';
      isValid = false;
    }

    if (formData.cost === '') {
      errors.cost = 'Service cost is required';
      isValid = false;
    } else if (Number(formData.cost) < 0) {
      errors.cost = 'Cost cannot be negative';
      isValid = false;
    }

    if (!formData.date) {
      errors.date = 'Service date is required';
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

  // Filter vehicles that are NOT On Trip, Retired, or In Shop (unless editing and it's the current vehicle)
  const filteredVehiclesList = vehicles.filter(v => {
    const isExcludingStatus = v.status === 'On Trip' || v.status === 'Retired' || v.status === 'In Shop';
    if (!isExcludingStatus) return true;
    if (initialData && (initialData.vehicle?._id === v._id || initialData.vehicle === v._id)) return true;
    return false;
  });

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
                maxWidth: '500px',
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
                  {initialData ? 'Edit Service Record' : 'Schedule Vehicle Service'}
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

              {/* Backend API Errors */}
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
                
                {/* Dropdown: Vehicle */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Assigned Vehicle
                  </label>
                  <select 
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    disabled={!!initialData} // Lock on Edit
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: formErrors.vehicle ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                      backgroundColor: initialData ? 'var(--bg-cream)' : 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: initialData ? 'not-allowed' : 'pointer',
                      color: initialData ? 'var(--text-secondary)' : 'var(--text-primary)'
                    }}
                  >
                    <option value="" disabled>
                      {loadingVehicles ? 'Syncing vehicles...' : 'Select Available Vehicle'}
                    </option>
                    {filteredVehiclesList.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.name} • {v.registrationNumber} • {v.status}
                      </option>
                    ))}
                  </select>
                  {formErrors.vehicle && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <AlertCircle size={12} /> {formErrors.vehicle}
                    </span>
                  )}
                </div>

                {/* Dropdown: Service Type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Service Type
                  </label>
                  <select 
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: formErrors.serviceType ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" disabled>Select Service Type</option>
                    <option value="Routine Service">Routine Service</option>
                    <option value="Oil Change">Oil Change</option>
                    <option value="Tire Service">Tire Service</option>
                    <option value="Brake Service">Brake Service</option>
                    <option value="Engine Repair">Engine Repair</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.serviceType && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <AlertCircle size={12} /> {formErrors.serviceType}
                    </span>
                  )}
                </div>

                {/* Two-Column: Cost & Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Cost */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Service Cost (₹)
                    </label>
                    <input 
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      placeholder="e.g. 5000"
                      min="0"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.cost ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.cost && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.cost}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Service Date
                    </label>
                    <input 
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.date ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.date && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.date}
                      </span>
                    )}
                  </div>
                </div>

                {/* Textarea: Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Service Description
                  </label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g. Regular 10,000 km general inspection check..."
                    rows={3}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Modal Footer Controls */}
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
                    {isSaving ? 'Saving...' : initialData ? 'Save Changes' : 'Schedule Service'}
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
