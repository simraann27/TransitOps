import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TripFormModal({ isOpen, onClose, onSubmit, initialData = null, isSaving = false, backendError = null }) {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Form values state initialized directly from props (key-based remounting resets this automatically)
  const [formData, setFormData] = useState({
    tripCode: initialData?.tripCode || '',
    origin: initialData?.origin || '',
    destination: initialData?.destination || '',
    vehicle: initialData?.vehicle?._id || initialData?.vehicle || '',
    driver: initialData?.driver?._id || initialData?.driver || '',
    cargoWeight: initialData?.cargoWeight || '',
    plannedDistance: initialData?.plannedDistance || '',
    status: initialData?.status || 'Draft'
  });

  // Local Validation Errors state
  const [formErrors, setFormErrors] = useState({
    tripCode: '',
    origin: '',
    destination: '',
    vehicle: '',
    driver: '',
    cargoWeight: '',
    plannedDistance: ''
  });

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch options (vehicles & drivers)
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

          // Fetch drivers
          const dResponse = await fetch(`${apiBaseUrl}/api/drivers`);
          const dData = await dResponse.json();
          if (dData.success) {
            setDrivers(dData.drivers || []);
          }
        } catch (error) {
          console.error("Failed to load options for trip form:", error);
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

    if (name === 'cargoWeight' || name === 'plannedDistance') {
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
      tripCode: '',
      origin: '',
      destination: '',
      vehicle: '',
      driver: '',
      cargoWeight: '',
      plannedDistance: ''
    };

    if (!formData.tripCode.trim()) {
      errors.tripCode = 'Trip Code is required';
      isValid = false;
    }

    if (!formData.origin.trim()) {
      errors.origin = 'Origin location is required';
      isValid = false;
    }

    if (!formData.destination.trim()) {
      errors.destination = 'Destination location is required';
      isValid = false;
    }

    if (!formData.vehicle) {
      errors.vehicle = 'Please select a vehicle';
      isValid = false;
    }

    if (!formData.driver) {
      errors.driver = 'Please select a driver';
      isValid = false;
    }

    if (formData.cargoWeight === '') {
      errors.cargoWeight = 'Cargo weight is required';
      isValid = false;
    } else if (Number(formData.cargoWeight) <= 0) {
      errors.cargoWeight = 'Cargo weight must be greater than 0';
      isValid = false;
    }

    if (formData.plannedDistance === '') {
      errors.plannedDistance = 'Planned distance is required';
      isValid = false;
    } else if (Number(formData.plannedDistance) <= 0) {
      errors.plannedDistance = 'Planned distance must be greater than 0';
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

  // Get selected vehicle data for capacity calculator
  const selectedVehicleObj = vehicles.find(v => v._id === formData.vehicle) || 
                             (initialData && initialData.vehicle && (initialData.vehicle._id === formData.vehicle || initialData.vehicle === formData.vehicle) ? initialData.vehicle : null);

  const maxCapacity = selectedVehicleObj?.maxLoadCapacity || 0;
  const currentWeight = Number(formData.cargoWeight) || 0;
  const capacityPercent = maxCapacity > 0 ? Math.round((currentWeight / maxCapacity) * 100) : 0;
  const isOverloaded = maxCapacity > 0 && currentWeight > maxCapacity;

  // Filter lists for Available entities (except if they are the current assigned entities in edit mode)
  const availableVehiclesList = vehicles.filter(v => {
    if (v.status === 'Available') return true;
    if (initialData && (initialData.vehicle?._id === v._id || initialData.vehicle === v._id)) return true;
    return false;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eligibleDriversList = drivers.filter(d => {
    const expiry = new Date(d.licenseExpiryDate);
    const isLicenseValid = expiry >= today;
    const isAvailable = d.status === 'Available';

    if (isAvailable && isLicenseValid) return true;
    if (initialData && (initialData.driver?._id === d._id || initialData.driver === d._id)) return true;
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
                  {initialData ? 'Edit Trip Manifest' : 'Plan Dispatch Trip'}
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
                
                {/* Row: Trip Code */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Trip Code
                  </label>
                  <input 
                    type="text"
                    name="tripCode"
                    value={formData.tripCode}
                    onChange={handleChange}
                    placeholder="e.g. TRIP-001"
                    disabled={!!initialData} // Lock on Edit
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: formErrors.tripCode ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                      backgroundColor: initialData ? 'var(--bg-cream)' : 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      color: initialData ? 'var(--text-secondary)' : 'var(--text-primary)'
                    }}
                  />
                  {formErrors.tripCode && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <AlertCircle size={12} /> {formErrors.tripCode}
                    </span>
                  )}
                </div>

                {/* Two-Column: Route Origin / Destination */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Origin */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Origin Location
                    </label>
                    <input 
                      type="text"
                      name="origin"
                      value={formData.origin}
                      onChange={handleChange}
                      placeholder="e.g. Nashik"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.origin ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.origin && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.origin}
                      </span>
                    )}
                  </div>

                  {/* Destination */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Destination Location
                    </label>
                    <input 
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="e.g. Pune"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.destination ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.destination && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.destination}
                      </span>
                    )}
                  </div>
                </div>

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
                      {loadingOptions ? 'Syncing vehicles...' : 'Select Available Vehicle'}
                    </option>
                    {availableVehiclesList.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.name} • {v.registrationNumber} • Capacity {v.maxLoadCapacity} kg
                      </option>
                    ))}
                  </select>
                  {formErrors.vehicle && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <AlertCircle size={12} /> {formErrors.vehicle}
                    </span>
                  )}
                </div>

                {/* Dropdown: Driver */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Assigned Driver
                  </label>
                  <select 
                    name="driver"
                    value={formData.driver}
                    onChange={handleChange}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: formErrors.driver ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-warm-white)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" disabled>
                      {loadingOptions ? 'Syncing drivers...' : 'Select Eligible Driver'}
                    </option>
                    {eligibleDriversList.map(d => (
                      <option key={d._id} value={d._id}>
                        {d.name} • {d.licenseCategory} • Safety {d.safetyScore}/100
                      </option>
                    ))}
                  </select>
                  {formErrors.driver && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <AlertCircle size={12} /> {formErrors.driver}
                    </span>
                  )}
                </div>

                {/* Two-Column: Cargo & Distance */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Cargo Weight */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Cargo Weight (kg)
                    </label>
                    <input 
                      type="number"
                      name="cargoWeight"
                      value={formData.cargoWeight}
                      onChange={handleChange}
                      placeholder="e.g. 450"
                      min="1"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.cargoWeight ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.cargoWeight && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.cargoWeight}
                      </span>
                    )}
                  </div>

                  {/* Planned Distance */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Planned Distance (km)
                    </label>
                    <input 
                      type="number"
                      name="plannedDistance"
                      value={formData.plannedDistance}
                      onChange={handleChange}
                      placeholder="e.g. 210"
                      min="1"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: formErrors.plannedDistance ? '1.5px solid #f87171' : '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-warm-white)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    {formErrors.plannedDistance && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <AlertCircle size={12} /> {formErrors.plannedDistance}
                      </span>
                    )}
                  </div>
                </div>

                {/* Capacity overload warning & usage display card */}
                {selectedVehicleObj && (
                  <div style={{
                    backgroundColor: isOverloaded ? '#fef2f2' : 'var(--bg-light-blue)',
                    border: `1px solid ${isOverloaded ? '#fca5a5' : 'rgba(196, 224, 255, 0.5)'}`,
                    borderRadius: '14px',
                    padding: '16px',
                    marginTop: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: isOverloaded ? '#b91c1c' : 'var(--color-blue-dark)', marginBottom: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Info size={14} /> Cargo Load Manifest
                      </span>
                      <span>{capacityPercent}% Usage</span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '12px'
                    }}>
                      <div>Max capacity: <strong>{maxCapacity} kg</strong></div>
                      <div>Entered cargo: <strong>{currentWeight} kg</strong></div>
                    </div>

                    {/* Progress visual bar */}
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-cream)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(capacityPercent, 100)}%`,
                        height: '100%',
                        backgroundColor: isOverloaded ? '#ef4444' : 'var(--color-blue-dark)',
                        borderRadius: '4px',
                        transition: 'width 0.3s'
                      }} />
                    </div>

                    {isOverloaded && (
                      <div style={{
                        marginTop: '12px',
                        fontSize: '0.78rem',
                        color: '#b91c1c',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <AlertCircle size={14} />
                        Cargo exceeds this vehicle's maximum capacity.
                      </div>
                    )}
                  </div>
                )}

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
                    {isSaving ? 'Saving...' : initialData ? 'Save Changes' : 'Create Trip as Draft'}
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
