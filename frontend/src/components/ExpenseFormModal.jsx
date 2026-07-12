import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpenseFormModal({ isOpen, onClose, onSubmit, initialData = null, isSaving = false, backendError = null }) {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);

  // Helper to format ISO date string to YYYY-MM-DD
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form values state initialized directly from props
  const [formData, setFormData] = useState({
    category: initialData?.category || '',
    description: initialData?.description || '',
    amount: initialData?.amount !== undefined ? initialData.amount : '',
    date: formatDateForInput(initialData?.date) || formatDateForInput(new Date().toISOString()),
    vehicle: initialData?.vehicle?._id || initialData?.vehicle || '',
    trip: initialData?.trip?._id || initialData?.trip || ''
  });

  // Local Validation Errors state
  const [formErrors, setFormErrors] = useState({
    category: '',
    description: '',
    amount: '',
    date: ''
  });

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch options on opening
  useEffect(() => {
    if (isOpen) {
      const fetchOptions = async () => {
        try {
          // Fetch vehicles
          const vResponse = await fetch(`${apiBaseUrl}/api/vehicles`);
          const vData = await vResponse.json();
          if (vData.success) {
            setVehicles(vData.vehicles || []);
          }

          // Fetch trips
          const tResponse = await fetch(`${apiBaseUrl}/api/trips`);
          const tData = await tResponse.json();
          if (tData.success) {
            setTrips(tData.trips || []);
          }
        } catch (error) {
          console.error("Failed to load options for expense form:", error);
        }
      };
      fetchOptions();
    }
  }, [isOpen, apiBaseUrl]);

  // Handle inputs and clear error state dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedVal = value;

    if (name === 'amount') {
      parsedVal = value === '' ? '' : Number(value);
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: parsedVal };
      // If vehicle changes, reset selected trip since it may not belong to the new vehicle
      if (name === 'vehicle') {
        updated.trip = '';
      }
      return updated;
    });

    // Clear validation error on type correction
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      category: '',
      description: '',
      amount: '',
      date: ''
    };

    if (!formData.category) {
      errors.category = 'Please select a category';
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = 'Expense description is required';
      isValid = false;
    }

    if (formData.amount === '') {
      errors.amount = 'Expense amount is required';
      isValid = false;
    } else if (Number(formData.amount) <= 0) {
      errors.amount = 'Expense amount must be greater than 0';
      isValid = false;
    }

    if (!formData.date) {
      errors.date = 'Expense date is required';
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

  // Filter trips based on the chosen vehicle
  const filteredTripsList = trips.filter(t => {
    if (!formData.vehicle) return false;
    const tripVehicleId = t.vehicle?._id || t.vehicle;
    return tripVehicleId.toString() === formData.vehicle.toString();
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
                  {initialData ? 'Edit Expense Entry' : 'Add Expense Item'}
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
                
                {/* Dropdown: Category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Expense Category
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: formErrors.category ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" disabled>Select Category</option>
                    <option value="Toll">Toll</option>
                    <option value="Parking">Parking</option>
                    <option value="Permit">Permit</option>
                    <option value="Fine">Fine</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.category && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <AlertCircle size={12} /> {formErrors.category}
                    </span>
                  )}
                </div>

                {/* Text: Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Expense Description
                  </label>
                  <input 
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g. Pune Highway toll charge payment"
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: formErrors.description ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  {formErrors.description && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <AlertCircle size={12} /> {formErrors.description}
                    </span>
                  )}
                </div>

                {/* Two-Column: Amount & Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Amount */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Expense Amount (₹)
                    </label>
                    <input 
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                      min="0.01"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.amount ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.amount && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.amount}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Expense Date
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

                {/* Dropdown: Vehicle (Optional) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Assigned Vehicle (Optional)
                  </label>
                  <select 
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">No Vehicle Assigned</option>
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.name} • {v.registrationNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dropdown: Trip (Optional) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Assigned Trip (Optional)
                  </label>
                  <select 
                    name="trip"
                    value={formData.trip}
                    onChange={handleChange}
                    disabled={!formData.vehicle}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: !formData.vehicle ? 'var(--bg-cream)' : 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: !formData.vehicle ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="">No Trip Assigned</option>
                    {filteredTripsList.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.tripCode} • {t.origin} ➔ {t.destination}
                      </option>
                    ))}
                  </select>
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
                    {isSaving ? 'Saving...' : initialData ? 'Save Changes' : 'Log Expense'}
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
