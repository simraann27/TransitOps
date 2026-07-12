import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/permissions';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

// Reusable modals and components
import VehicleFormModal from '../components/VehicleFormModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import PageBackground from '../components/PageBackground';

// Reusable CountUp visual helper
function Counter({ value }) {
  const [count, setCount] = useState(() => {
    const end = parseInt(value, 10);
    return isNaN(end) ? value : 0;
  });

  useEffect(() => {
    const end = parseInt(value, 10);
    if (isNaN(end) || end <= 0) return;
    
    let start = 0;
    const duration = 800; // 0.8s count duration
    const incrementTime = Math.max(Math.floor(duration / end), 15);
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}

export default function FleetPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // RBAC Permission checks
  const canView = user && (hasPermission(user.role, 'fleet:view') || hasPermission(user.role, 'fleet'));
  const canManage = user && hasPermission(user.role, 'fleet');

  // Redirect restricted users (such as Safety Officer)
  useEffect(() => {
    if (!canView) {
      navigate('/dashboard', { replace: true });
    }
  }, [canView, navigate]);

  // Page States
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Save states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // holds data for editing
  const [isSaving, setIsSaving] = useState(false);
  const [formBackendError, setFormBackendError] = useState(null);

  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Load API base
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch Vehicles callback
  const fetchVehicles = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/vehicles`);
      if (!response.ok) {
        throw new Error(`Sync failure: Server responded with status ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setVehicles(data.vehicles || []);
        setApiError(null);
      } else {
        throw new Error(data.message || "Unknown API response structure");
      }
    } catch (error) {
      console.error("Failed to sync fleet registry:", error);
      setApiError(error.message || "Failed to establish a live connection to the backend server.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Initial fetch using setTimeout to prevent synchronous setState trigger in rendering effect threads
  useEffect(() => {
    if (canView) {
      const timer = setTimeout(() => {
        fetchVehicles();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [canView, fetchVehicles]);

  // Manual Trigger to re-fetch
  const handleManualSync = () => {
    setLoading(true);
    setApiError(null);
    fetchVehicles();
  };

  // Helper trigger Toast notifications
  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Form Submit (Add / Edit) Handler
  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    setFormBackendError(null);

    const isEdit = !!selectedVehicle;
    const url = isEdit 
      ? `${apiBaseUrl}/api/vehicles/${selectedVehicle._id}`
      : `${apiBaseUrl}/api/vehicles`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Operation failed');
      }

      // Success
      triggerToast(
        isEdit ? "Vehicle updated successfully" : "Vehicle added successfully",
        "success"
      );
      setFormOpen(false);
      setSelectedVehicle(null);
      handleManualSync();
    } catch (error) {
      console.error("Save error:", error);
      
      // Check for duplicate keys (Mongoose Code 11000 duplicate validation)
      const errText = error.message || '';
      if (errText.includes('11000') || errText.includes('duplicate') || errText.toLowerCase().includes('registration')) {
        setFormBackendError("A vehicle with this registration number already exists.");
      } else {
        setFormBackendError(errText || "Failed to save the vehicle registry profile.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action Trigger
  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/vehicles/${vehicleToDelete._id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Delete operation failed');
      }

      // Success
      triggerToast("Vehicle deleted successfully", "success");
      setDeleteOpen(false);
      setVehicleToDelete(null);
      handleManualSync();
    } catch (error) {
      console.error("Delete error:", error);
      triggerToast(error.message || "Failed to remove the vehicle from registry.", "error");
    }
  };

  // Clear filters helper
  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
  };

  // Dynamically calculate summary stats based on complete fleet
  const totalVehiclesCount = vehicles.length;
  const availableCount = vehicles.filter(v => v.status === 'Available').length;
  const activeCount = vehicles.filter(v => v.status === 'On Trip').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'In Shop').length;
  const retiredCount = vehicles.filter(v => v.status === 'Retired').length;

  // Filter vehicles on front-end
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
                          v.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === '' || v.type === typeFilter;
    const matchesStatus = statusFilter === '' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Helper currency formatter
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper style badges
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Available":
        return { backgroundColor: 'var(--color-mint-glow)', color: 'var(--color-mint-dark)' };
      case "On Trip":
        return { backgroundColor: 'var(--color-blue-glow)', color: 'var(--color-blue-dark)' };
      case "In Shop":
        return { backgroundColor: 'var(--color-peach-glow)', color: 'var(--color-peach-dark)' };
      case "Retired":
        return { backgroundColor: 'var(--bg-lavender-gray)', color: 'var(--text-secondary)' };
      default:
        return { backgroundColor: 'var(--bg-lavender-gray)', color: 'var(--text-secondary)' };
    }
  };

  // Render Access Lock redirect indicator
  if (!canView) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left', position: 'relative' }}>
      <PageBackground variant="fleet" />
      
      {/* Toast Notification Container */}
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage('')} 
      />

      {/* Reusable Form Drawer (Key forces complete state rebuild on opening new record contexts) */}
      <VehicleFormModal 
        key={selectedVehicle?._id || (formOpen ? 'open' : 'closed')}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedVehicle(null);
          setFormBackendError(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedVehicle}
        isSaving={isSaving}
        backendError={formBackendError}
      />

      {/* Confirm Delete Alert Modal */}
      <ConfirmModal 
        isOpen={deleteOpen}
        title="Delete this vehicle?"
        message={
          vehicleToDelete 
            ? `This action will permanently remove ${vehicleToDelete.name} (${vehicleToDelete.registrationNumber}) from the fleet registry.`
            : ''
        }
        onCancel={() => {
          setDeleteOpen(false);
          setVehicleToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: 'var(--color-blue-glow)',
            color: 'var(--color-blue-dark)',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.08)',
            flexShrink: 0
          }}>
            <Truck size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Fleet Registry
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Manage vehicles, capacity, availability and operational status.
            </p>
          </div>
        </div>
        
        {/* Render create controls only if role possesses managing clearances */}
        {canManage && (
          <button 
            onClick={() => {
              setSelectedVehicle(null);
              setFormBackendError(null);
              setFormOpen(true);
            }}
            className="btn btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} />
            Add Vehicle
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '20px'
      }}>
        {/* Metric: Total */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--text-light)' }}>
          <span className="summary-title">Total Vehicles</span>
          <span className="summary-value">
            {loading ? '...' : <Counter value={totalVehiclesCount} />}
          </span>
        </div>

        {/* Metric: Available */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-mint-dark)' }}>
          <span className="summary-title">Available</span>
          <span className="summary-value" style={{ color: 'var(--color-mint-dark)' }}>
            {loading ? '...' : <Counter value={availableCount} />}
          </span>
        </div>

        {/* Metric: On Trip */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-blue-dark)' }}>
          <span className="summary-title">On Trip</span>
          <span className="summary-value" style={{ color: 'var(--color-blue-dark)' }}>
            {loading ? '...' : <Counter value={activeCount} />}
          </span>
        </div>

        {/* Metric: In Shop */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-peach-dark)' }}>
          <span className="summary-title">In Shop</span>
          <span className="summary-value" style={{ color: 'var(--color-peach-dark)' }}>
            {loading ? '...' : <Counter value={maintenanceCount} />}
          </span>
        </div>

        {/* Metric: Retired */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--text-light)' }}>
          <span className="summary-title">Retired</span>
          <span className="summary-value" style={{ color: 'var(--text-light)' }}>
            {loading ? '...' : <Counter value={retiredCount} />}
          </span>
        </div>
      </div>

      {/* Search & Filters Panel */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-soft)'
      }}>
        
        {/* Filters Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          flex: 1
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }} className="search-input-field">
            <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-light)' }}>
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search reg number, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-cream)',
                borderRadius: '10px',
                padding: '8px 12px 8px 36px',
                fontSize: '0.88rem',
                outline: 'none',
                width: '100%',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-blue-dark)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          {/* Filter: Type */}
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-cream)',
              fontSize: '0.88rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Types</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini Truck">Mini Truck</option>
            <option value="Trailer">Trailer</option>
            <option value="Other">Other</option>
          </select>

          {/* Filter: Status */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-cream)',
              fontSize: '0.88rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        {/* Actions clear */}
        {(search || typeFilter || statusFilter) && (
          <button 
            onClick={handleClearFilters}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-blue-dark)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Table Content */}
      {loading ? (
        /* Loading Skeleton Slices */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '60px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              animation: 'pulse 1.5s infinite ease-in-out'
            }} />
          ))}
          <style>{`
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 0.3; }
              100% { opacity: 0.6; }
            }
          `}</style>
        </div>
      ) : apiError ? (
        /* Sync failure state card layout */
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ color: '#ef4444', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <XCircle size={48} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Unable to sync fleet data
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
            {apiError}
          </p>
          <button 
            onClick={handleManualSync}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={14} />
            Retry Sync
          </button>
        </div>
      ) : filteredVehicles.length === 0 ? (
        /* Empty registry state card */
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: '20px',
          padding: '60px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ color: 'var(--text-light)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <FileSpreadsheet size={48} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No vehicles in your fleet yet.
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '380px', margin: '0 auto 24px auto' }}>
            {search || typeFilter || statusFilter 
              ? "No registered vehicles match your active search filter settings."
              : "Add your first vehicle to begin managing transport operations."
            }
          </p>
          {canManage && !search && !typeFilter && !statusFilter && (
            <button 
              onClick={() => {
                setSelectedVehicle(null);
                setFormBackendError(null);
                setFormOpen(true);
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              Add First Vehicle
            </button>
          )}
        </div>
      ) : (
        /* Render Table list content */
        <>
          {/* Desktop Table View */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-soft)',
            overflowX: 'auto'
          }} className="desktop-table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Vehicle</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Registration</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Capacity</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Odometer</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Acquisition Cost</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Status</th>
                  {canManage && (
                    <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle, idx) => (
                  <tr key={vehicle._id} style={{ 
                    borderBottom: idx < filteredVehicles.length - 1 ? '1px solid var(--bg-cream)' : 'none',
                    transition: 'background-color 0.2s'
                  }} className="table-row-hover">
                    {/* Vehicle info */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--color-blue-glow)',
                          color: 'var(--color-blue-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Truck size={16} />
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {vehicle.name}
                        </span>
                      </div>
                    </td>
                    
                    {/* Registration */}
                    <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {vehicle.registrationNumber}
                    </td>

                    {/* Type */}
                    <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      {vehicle.type}
                    </td>

                    {/* Capacity */}
                    <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {vehicle.maxLoadCapacity} kg
                    </td>

                    {/* Odometer */}
                    <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {new Intl.NumberFormat('en-IN').format(vehicle.odometer)} km
                    </td>

                    {/* Acquisition Cost */}
                    <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {formatINR(vehicle.acquisitionCost)}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        ...getStatusBadgeStyle(vehicle.status)
                      }}>
                        {vehicle.status}
                      </span>
                    </td>

                    {/* Actions */}
                    {canManage && (
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setFormBackendError(null);
                              setFormOpen(true);
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)',
                              padding: '4px',
                              borderRadius: '6px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              setVehicleToDelete(vehicle);
                              setDeleteOpen(true);
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)',
                              padding: '4px',
                              borderRadius: '6px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid View (stacks dynamically) */}
          <div className="mobile-cards-grid" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
            {filteredVehicles.map(vehicle => (
              <div 
                key={vehicle._id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-soft)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-blue-glow)',
                      color: 'var(--color-blue-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Truck size={14} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {vehicle.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    ...getStatusBadgeStyle(vehicle.status)
                  }}>
                    {vehicle.status}
                  </span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />

                {/* Details layout */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px 16px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>REGISTRATION</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{vehicle.registrationNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>VEHICLE TYPE</span>
                    <strong>{vehicle.type}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>CAPACITY</span>
                    <strong>{vehicle.maxLoadCapacity} kg</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>ODOMETER</span>
                    <strong>{new Intl.NumberFormat('en-IN').format(vehicle.odometer)} km</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>ACQUISITION COST</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{formatINR(vehicle.acquisitionCost)}</strong>
                  </div>
                </div>

                {/* Mobile Actions controls */}
                {canManage && (
                  <>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setFormBackendError(null);
                          setFormOpen(true);
                        }}
                        className="btn btn-secondary"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          setVehicleToDelete(vehicle);
                          setDeleteOpen(true);
                        }}
                        className="btn btn-secondary"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#ef4444',
                          borderColor: 'rgba(239, 68, 68, 0.2)'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Styled components custom overrides */}
      <style>{`
        .summary-card {
          background-color: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: 16px;
          padding: 16px 20px;
          box-shadow: var(--shadow-soft);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-title {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-value {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: var(--font-heading);
          color: var(--text-primary);
          line-height: 1.1;
        }

        .table-row-hover:hover {
          background-color: var(--bg-cream);
        }

        /* Mobile layout overrides via Media Query */
        @media (max-width: 768px) {
          .desktop-table-container {
            display: none !important;
          }
          .mobile-cards-grid {
            display: flex !important;
          }
          .search-input-field {
            min-width: 100% !important;
          }
        }
      `}</style>

    </div>
  );
}
