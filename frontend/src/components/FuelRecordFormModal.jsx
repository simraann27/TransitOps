import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FuelRecordFormModal({ isOpen, onClose, onSubmit, initialData = null, isSaving = false, backendError = null }) {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

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
    vehicle: initialData?.vehicle?._id || initialData?.vehicle || '',
    trip: initialData?.trip?._id || initialData?.trip || '',
    date: formatDateForInput(initialData?.date) || formatDateForInput(new Date().toISOString()),
    liters: initialData?.liters !== undefined ? initialData.liters : '',
    cost: initialData?.cost !== undefined ? initialData.cost : '',
    odometer: initialData?.odometer !== undefined ? initialData.odometer : '',
    fuelStation: initialData?.fuelStation || '',
    notes: initialData?.notes || ''
  });

  // Local Validation Errors state
  const [formErrors, setFormErrors] = useState({
    vehicle: '',
    date: '',
    liters: '',
    cost: '',
    odometer: ''
  });

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch options on opening
  useEffect(() => {
    if (isOpen) {
      const fetchOptions = async () => {
        setLoadingOptions(true);
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
          console.error("Failed to load options for fuel form:", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [isOpen, apiBaseUrl]);

  // Handle inputs and clear error state dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedVal = value;

    if (name === 'liters' || name === 'cost' || name === 'odometer') {
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

  // Get current selected vehicle details
  const selectedVehicleObj = vehicles.find(v => v._id === formData.vehicle) || 
                             (initialData && initialData.vehicle && (initialData.vehicle._id === formData.vehicle || initialData.vehicle === formData.vehicle) ? initialData.vehicle : null);

  const vehicleOdometer = selectedVehicleObj?.odometer || 0;
  const enteredOdometer = Number(formData.odometer) || 0;
  const isOdometerInvalid = formData.vehicle && formData.odometer !== '' && enteredOdometer < vehicleOdometer;

  const validateForm = () => {
    let isValid = true;
    const errors = {
      vehicle: '',
      date: '',
      liters: '',
      cost: '',
      odometer: ''
    };

    if (!formData.vehicle) {
      errors.vehicle = 'Please select a vehicle';
      isValid = false;
    }

    if (!formData.date) {
      errors.date = 'Fuel date is required';
      isValid = false;
    }

    if (formData.liters === '') {
      errors.liters = 'Liters value is required';
      isValid = false;
    } else if (Number(formData.liters) <= 0) {
      errors.liters = 'Liters must be greater than 0';
      isValid = false;
    }

    if (formData.cost === '') {
      errors.cost = 'Total cost is required';
      isValid = false;
    } else if (Number(formData.cost) <= 0) {
      errors.cost = 'Total cost must be greater than 0';
      isValid = false;
    }

    if (formData.odometer === '') {
      errors.odometer = 'Odometer reading is required';
      isValid = false;
    } else if (Number(formData.odometer) < 0) {
      errors.odometer = 'Odometer cannot be negative';
      isValid = false;
    } else if (isOdometerInvalid) {
      errors.odometer = 'Odometer reading cannot be lower than the current vehicle odometer.';
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
                maxWidth: '520px',
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
                  {initialData ? 'Edit Fuel Entry' : 'Add Fuel Log'}
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
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: formErrors.vehicle ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" disabled>
                      {loadingOptions ? 'Syncing vehicles...' : 'Select Vehicle'}
                    </option>
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.name} • {v.registrationNumber} • {v.odometer} km
                      </option>
                    ))}
                  </select>
                  {formErrors.vehicle && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <AlertCircle size={12} /> {formErrors.vehicle}
                    </span>
                  )}
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
                    <option value="">No Active Trip</option>
                    {filteredTripsList.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.tripCode} • {t.origin} ➔ {t.destination}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Two-Column: Liters & Total Cost */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Liters */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Fuel Volume (Liters)
                    </label>
                    <input 
                      type="number"
                      name="liters"
                      value={formData.liters}
                      onChange={handleChange}
                      placeholder="e.g. 45"
                      step="0.01"
                      min="0.01"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.liters ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.liters && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.liters}
                      </span>
                    )}
                  </div>

                  {/* Cost */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Total Fuel Cost (₹)
                    </label>
                    <input 
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      placeholder="e.g. 4500"
                      min="0.01"
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
                </div>

                {/* Two-Column: Odometer & Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Odometer */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Odometer Reading (km)
                    </label>
                    <input 
                      type="number"
                      name="odometer"
                      value={formData.odometer}
                      onChange={handleChange}
                      placeholder="e.g. 12500"
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

                  {/* Date */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Fuel Refuel Date
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

                {/* Odometer threshold card */}
                {selectedVehicleObj && (
                  <div style={{
                    backgroundColor: isOdometerInvalid ? '#fef2f2' : 'var(--bg-light-blue)',
                    border: `1px solid ${isOdometerInvalid ? '#fca5a5' : 'rgba(196, 224, 255, 0.5)'}`,
                    borderRadius: '14px',
                    padding: '12px 16px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Current Vehicle Odometer:</span>
                      <strong>{vehicleOdometer.toLocaleString()} km</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Entered Reading:</span>
                      <strong>{enteredOdometer > 0 ? enteredOdometer.toLocaleString() : '—'} km</strong>
                    </div>

                    {isOdometerInvalid && (
                      <div style={{
                        marginTop: '8px',
                        color: '#b91c1c',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem'
                      }}>
                        <AlertCircle size={12} />
                        Odometer reading cannot be lower than the current vehicle odometer.
                      </div>
                    )}
                  </div>
                )}

                {/* Row: Station & Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Fuel Station
                  </label>
                  <input 
                    type="text"
                    name="fuelStation"
                    value={formData.fuelStation}
                    onChange={handleChange}
                    placeholder="e.g. Shell Petrol Pump, Highway Bypass"
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Notes / Comments
                  </label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Tanked to full capacity, checked tire pressure..."
                    rows={2}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'none',
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
                    {isSaving ? 'Saving...' : initialData ? 'Save Changes' : 'Log Fuel'}
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
