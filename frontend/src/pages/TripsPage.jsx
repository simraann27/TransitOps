import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/permissions';
import { 
  Plus, 
  Search, 
  RefreshCw,
  XCircle,
  ArrowRight,
  Play,
  Check,
  Ban,
  TrendingUp,
  Compass,
  Edit2
} from 'lucide-react';

// Reusable components
import TripFormModal from '../components/TripFormModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import PageBackground from '../components/PageBackground';

// Reusable Counter visual helper
function Counter({ value }) {
  const [count, setCount] = useState(() => {
    const end = parseInt(value, 10);
    return isNaN(end) ? value : 0;
  });

  useEffect(() => {
    const end = parseInt(value, 10);
    if (isNaN(end) || end <= 0) return;
    
    let start = 0;
    const duration = 800; // 0.8s count
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

export default function TripsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // RBAC clearance checks
  const canView = user && (hasPermission(user.role, 'trips:view') || hasPermission(user.role, 'trips'));
  const canManage = user && hasPermission(user.role, 'trips');

  // Redirect unauthorized direct navigations
  useEffect(() => {
    if (!canView) {
      navigate('/dashboard', { replace: true });
    }
  }, [canView, navigate]);

  // Page States
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Action states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null); // holds data for editing manifest
  const [isSaving, setIsSaving] = useState(false);
  const [formBackendError, setFormBackendError] = useState(null);

  // Dispatch Confirmation state
  const [dispatchConfirmOpen, setDispatchConfirmOpen] = useState(false);
  const [tripToDispatch, setTripToDispatch] = useState(null);

  // Completion Confirmation state
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [tripToComplete, setTripToComplete] = useState(null);

  // Cancel Confirmation state
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [tripToCancel, setTripToCancel] = useState(null);

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch complete trips list
  const fetchTrips = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/trips`);
      if (!response.ok) {
        throw new Error(`Sync failure: Server responded with status ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setTrips(data.trips || []);
        setApiError(null);
      } else {
        throw new Error(data.message || "Unknown API response structure");
      }
    } catch (error) {
      console.error("Failed to sync dispatch trips:", error);
      setApiError(error.message || "Failed to establish a live connection to the backend server.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Initial fetch
  useEffect(() => {
    if (canView) {
      const timer = setTimeout(() => {
        fetchTrips();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [canView, fetchTrips]);

  const handleManualSync = () => {
    setLoading(true);
    setApiError(null);
    fetchTrips();
  };

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Create / Edit Form manifest submission
  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    setFormBackendError(null);

    const isEdit = !!selectedTrip;
    const url = isEdit
      ? `${apiBaseUrl}/api/trips/${selectedTrip._id}`
      : `${apiBaseUrl}/api/trips`;
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

      triggerToast(
        isEdit ? "Trip manifest updated successfully" : "Trip created as Draft",
        "success"
      );
      setFormOpen(false);
      setSelectedTrip(null);
      handleManualSync();
    } catch (error) {
      console.error("Save manifest error:", error);
      setFormBackendError(error.message || "Failed to save the trip manifest details.");
    } finally {
      setIsSaving(false);
    }
  };

  // Dispatch Action Confirm Callback
  const handleDispatchConfirm = async () => {
    if (!tripToDispatch) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/trips/${tripToDispatch._id}/dispatch`, {
        method: 'PATCH'
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Dispatch failed');
      }

      // Success
      triggerToast("Trip dispatched successfully", "success");
      setDispatchConfirmOpen(false);
      setTripToDispatch(null);
      handleManualSync();
    } catch (error) {
      console.error("Dispatch error:", error);
      triggerToast(error.message || "Failed to dispatch the trip.", "error");
      setDispatchConfirmOpen(false);
      setTripToDispatch(null);
    }
  };

  // Start Trip Action Callback
  const handleStartTrip = async (tripId) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/trips/${tripId}/start`, {
        method: 'PATCH'
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Start trip operation failed');
      }

      triggerToast("Trip is now On Trip", "success");
      handleManualSync();
    } catch (error) {
      console.error("Start error:", error);
      triggerToast(error.message || "Failed to start the trip.", "error");
    }
  };

  // Complete Trip Action Callback
  const handleCompleteConfirm = async () => {
    if (!tripToComplete) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/trips/${tripToComplete._id}/complete`, {
        method: 'PATCH'
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Complete trip operation failed');
      }

      triggerToast("Trip completed successfully", "success");
      setCompleteConfirmOpen(false);
      setTripToComplete(null);
      handleManualSync();
    } catch (error) {
      console.error("Complete error:", error);
      triggerToast(error.message || "Failed to complete the trip.", "error");
      setCompleteConfirmOpen(false);
      setTripToComplete(null);
    }
  };

  // Cancel Trip Action Callback
  const handleCancelConfirm = async () => {
    if (!tripToCancel) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/trips/${tripToCancel._id}/cancel`, {
        method: 'PATCH'
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Cancel trip operation failed');
      }

      triggerToast("Trip cancelled successfully", "success");
      setCancelConfirmOpen(false);
      setTripToCancel(null);
      handleManualSync();
    } catch (error) {
      console.error("Cancel error:", error);
      triggerToast(error.message || "Failed to cancel the trip.", "error");
      setCancelConfirmOpen(false);
      setTripToCancel(null);
    }
  };

  // Helpers
  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  // Summary counts calculated from real API data
  const totalTripsCount = trips.length;
  const draftCount = trips.filter(t => t.status === 'Draft').length;
  const dispatchedCount = trips.filter(t => t.status === 'Dispatched').length;
  const activeCount = trips.filter(t => t.status === 'On Trip').length;
  const completedCount = trips.filter(t => t.status === 'Completed').length;
  const cancelledCount = trips.filter(t => t.status === 'Cancelled').length;

  // Search & Filters on client-side
  const filteredTrips = trips.filter(t => {
    const vName = t.vehicle?.name || '';
    const vReg = t.vehicle?.registrationNumber || '';
    const dName = t.driver?.name || '';

    const matchesSearch = t.tripCode.toLowerCase().includes(search.toLowerCase()) ||
                          t.origin.toLowerCase().includes(search.toLowerCase()) ||
                          t.destination.toLowerCase().includes(search.toLowerCase()) ||
                          vName.toLowerCase().includes(search.toLowerCase()) ||
                          vReg.toLowerCase().includes(search.toLowerCase()) ||
                          dName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === '' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Draft":
        return { backgroundColor: 'var(--color-lavender-glow)', color: 'var(--color-lavender-dark)' };
      case "Dispatched":
        return { backgroundColor: 'var(--color-yellow-glow)', color: 'var(--color-yellow-dark)' };
      case "On Trip":
        return { backgroundColor: 'var(--color-blue-glow)', color: 'var(--color-blue-dark)' };
      case "Completed":
        return { backgroundColor: 'var(--color-mint-glow)', color: 'var(--color-mint-dark)' };
      case "Cancelled":
        return { backgroundColor: '#fef2f2', color: '#ef4444' };
      default:
        return { backgroundColor: 'var(--bg-lavender-gray)', color: 'var(--text-secondary)' };
    }
  };

  // Render Connected lifecycle nodes progress bar
  const renderLifecycleProgress = (status) => {
    const steps = ["Draft", "Dispatched", "On Trip", "Completed"];
    const curIdx = steps.indexOf(status);
    const isCancelled = status === "Cancelled";

    if (isCancelled) {
      return (
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#ef4444',
          backgroundColor: '#fef2f2',
          padding: '4px 10px',
          borderRadius: '8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Ban size={12} /> Cancelled
        </span>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {steps.map((step, idx) => {
          const isCompleted = idx < curIdx;
          const isCurrent = idx === curIdx;
          
          let color = 'var(--text-light)';
          let bgColor = 'transparent';
          
          if (isCompleted) {
            color = 'var(--color-mint-dark)';
            bgColor = 'var(--color-mint-glow)';
          } else if (isCurrent) {
            color = 'var(--color-blue-dark)';
            bgColor = 'var(--color-blue-glow)';
          }

          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: isCurrent ? 800 : 600,
                color,
                bgColor,
                padding: '3px 8px',
                borderRadius: '6px',
                whiteSpace: 'nowrap'
              }}>
                {step}
              </span>
              {idx < steps.length - 1 && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>➔</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Helper cargo capacity styling card
  const getCargoDisplayInfo = (cargo, vehicle) => {
    const maxCapacity = vehicle?.maxLoadCapacity || 0;
    const currentWeight = cargo || 0;
    const capacityPercent = maxCapacity > 0 ? Math.round((currentWeight / maxCapacity) * 100) : 0;
    const isOverloaded = maxCapacity > 0 && currentWeight > maxCapacity;

    let barColor = 'var(--color-blue-dark)';
    let textColor = 'var(--text-secondary)';

    if (isOverloaded) {
      barColor = '#ef4444';
      textColor = '#ef4444';
    } else if (capacityPercent >= 91) {
      barColor = '#ef4444';
      textColor = '#ef4444';
    } else if (capacityPercent >= 76) {
      barColor = '#f59e0b';
      textColor = '#b45309';
    } else if (capacityPercent > 0) {
      barColor = 'var(--color-mint-dark)';
      textColor = 'var(--color-mint-dark)';
    }

    return {
      maxCapacity,
      currentWeight,
      capacityPercent,
      isOverloaded,
      barColor,
      textColor
    };
  };

  if (!canView) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left', position: 'relative' }}>
      <PageBackground variant="trips" />
      
      {/* Toast Notice */}
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage('')} 
      />

      {/* Reusable Form Drawer Modal */}
      <TripFormModal 
        key={selectedTrip?._id || (formOpen ? 'open' : 'closed')}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedTrip(null);
          setFormBackendError(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedTrip}
        isSaving={isSaving}
        backendError={formBackendError}
      />

      {/* Confirm Dispatch Drawer Modal */}
      <ConfirmModal 
        isOpen={dispatchConfirmOpen}
        title="Dispatch this trip?"
        message={
          tripToDispatch 
            ? `Confirm operational route validation checks and authorize TRIP ${tripToDispatch.tripCode} (Route: ${tripToDispatch.origin} ➔ ${tripToDispatch.destination}, Operator: ${tripToDispatch.driver?.name || 'Unassigned'}, Vehicle: ${tripToDispatch.vehicle?.name || 'Unassigned'}, Load: ${tripToDispatch.cargoWeight} kg).`
            : ''
        }
        onCancel={() => {
          setDispatchConfirmOpen(false);
          setTripToDispatch(null);
        }}
        onConfirm={handleDispatchConfirm}
      />

      {/* Confirm Complete Modal */}
      <ConfirmModal 
        isOpen={completeConfirmOpen}
        title="Complete this trip?"
        message={
          tripToComplete 
            ? `Vehicle and driver assigned to TRIP ${tripToComplete.tripCode} will return to Available status in the database.`
            : ''
        }
        onCancel={() => {
          setCompleteConfirmOpen(false);
          setTripToComplete(null);
        }}
        onConfirm={handleCompleteConfirm}
      />

      {/* Confirm Cancel Modal */}
      <ConfirmModal 
        isOpen={cancelConfirmOpen}
        title="Cancel this trip manifest?"
        message={
          tripToCancel 
            ? `This action will immediately cancel TRIP ${tripToCancel.tripCode} and restore resources if active.`
            : ''
        }
        onCancel={() => {
          setCancelConfirmOpen(false);
          setTripToCancel(null);
        }}
        onConfirm={handleCancelConfirm}
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
            <Compass size={22} style={{ transform: 'rotate(45deg)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Trip Dispatcher
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Plan, validate and control transport operations from dispatch to completion.
            </p>
          </div>
        </div>

        {canManage && (
          <button 
            onClick={() => {
              setSelectedTrip(null);
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
            Create Trip
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '20px'
      }}>
        {/* Total */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--text-light)' }}>
          <span className="summary-title">Total Trips</span>
          <span className="summary-value">
            {loading ? '...' : <Counter value={totalTripsCount} />}
          </span>
        </div>

        {/* Draft */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-lavender-dark)' }}>
          <span className="summary-title">Draft</span>
          <span className="summary-value" style={{ color: 'var(--color-lavender-dark)' }}>
            {loading ? '...' : <Counter value={draftCount} />}
          </span>
        </div>

        {/* Dispatched */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-yellow-dark)' }}>
          <span className="summary-title">Dispatched</span>
          <span className="summary-value" style={{ color: 'var(--color-yellow-dark)' }}>
            {loading ? '...' : <Counter value={dispatchedCount} />}
          </span>
        </div>

        {/* On Trip */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-blue-dark)' }}>
          <span className="summary-title">On Trip</span>
          <span className="summary-value" style={{ color: 'var(--color-blue-dark)' }}>
            {loading ? '...' : <Counter value={activeCount} />}
          </span>
        </div>

        {/* Completed */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-mint-dark)' }}>
          <span className="summary-title">Completed</span>
          <span className="summary-value" style={{ color: 'var(--color-mint-dark)' }}>
            {loading ? '...' : <Counter value={completedCount} />}
          </span>
        </div>

        {/* Cancelled */}
        <div className="summary-card" style={{ borderLeft: '3px solid #ef4444' }}>
          <span className="summary-title">Cancelled</span>
          <span className="summary-value" style={{ color: '#ef4444' }}>
            {loading ? '...' : <Counter value={cancelledCount} />}
          </span>
        </div>
      </div>

      {/* Filter panel */}
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
        
        {/* Left Filters */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          flex: 1
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px' }} className="search-input-field">
            <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-light)' }}>
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search code, origin, destination, vehicle, driver..."
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
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            <option value="On Trip">On Trip</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(search || statusFilter) && (
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
        /* Loading Skeletons */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
        /* Error Box */
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
            Unable to sync trip data
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
      ) : filteredTrips.length === 0 ? (
        /* Empty layout */
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: '20px',
          padding: '60px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ color: 'var(--text-light)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <Compass size={48} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No trips planned yet.
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '380px', margin: '0 auto 24px auto' }}>
            {search || statusFilter 
              ? "No registered trips match your active search filter settings."
              : "Create your first transport operation to begin dispatching."
            }
          </p>
          {canManage && !search && !statusFilter && (
            <button 
              onClick={() => {
                setSelectedTrip(null);
                setFormBackendError(null);
                setFormOpen(true);
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              Create First Trip
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
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Trip Code</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Route</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Vehicle</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Driver</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Cargo Load</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Distance</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Lifecycle Step</th>
                  {canManage && (
                    <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip, idx) => {
                  const cargo = getCargoDisplayInfo(trip.cargoWeight, trip.vehicle);

                  return (
                    <tr key={trip._id} style={{ 
                      borderBottom: idx < filteredTrips.length - 1 ? '1px solid var(--bg-cream)' : 'none',
                      transition: 'background-color 0.2s'
                    }} className="table-row-hover">
                      
                      {/* Code */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {trip.tripCode}
                      </td>

                      {/* Route */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{trip.origin}</span>
                          <ArrowRight size={14} style={{ color: 'var(--text-light)' }} />
                          <span>{trip.destination}</span>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <div><strong>{trip.vehicle?.name || 'Unassigned'}</strong></div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>{trip.vehicle?.registrationNumber || 'N/A'}</div>
                      </td>

                      {/* Driver */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {trip.driver?.name || 'Unassigned'}
                      </td>

                      {/* Cargo capacity progress */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '130px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: cargo.textColor }}>
                            {cargo.currentWeight} / {cargo.maxCapacity || 0} kg {cargo.isOverloaded && '(Overloaded)'}
                          </span>
                          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-cream)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(cargo.capacityPercent, 100)}%`,
                              height: '100%',
                              backgroundColor: cargo.barColor,
                              borderRadius: '3px'
                            }} />
                          </div>
                        </div>
                      </td>

                      {/* Distance */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {trip.plannedDistance} km
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          ...getStatusBadgeStyle(trip.status)
                        }}>
                          {trip.status}
                        </span>
                      </td>

                      {/* Lifecycle visual list */}
                      <td style={{ padding: '16px 20px' }}>
                        {renderLifecycleProgress(trip.status)}
                      </td>

                      {/* Action buttons */}
                      {canManage && (
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            
                            {/* Draft Options: Edit, Dispatch, Cancel */}
                            {trip.status === 'Draft' && (
                              <>
                                <button 
                                  title="Edit manifests"
                                  onClick={() => {
                                    setSelectedTrip(trip);
                                    setFormBackendError(null);
                                    setFormOpen(true);
                                  }}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setTripToDispatch(trip);
                                    setDispatchConfirmOpen(true);
                                  }}
                                  className="btn btn-primary"
                                  style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <TrendingUp size={12} />
                                  Dispatch
                                </button>
                                <button 
                                  onClick={() => {
                                    setTripToCancel(trip);
                                    setCancelConfirmOpen(true);
                                  }}
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 8px', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {/* Dispatched Options: Start, Cancel */}
                            {trip.status === 'Dispatched' && (
                              <>
                                <button 
                                  onClick={() => handleStartTrip(trip._id)}
                                  className="btn btn-primary"
                                  style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-blue-dark)' }}
                                >
                                  <Play size={12} />
                                  Start Trip
                                </button>
                                <button 
                                  onClick={() => {
                                    setTripToCancel(trip);
                                    setCancelConfirmOpen(true);
                                  }}
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 8px', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {/* On Trip Options: Complete, Cancel */}
                            {trip.status === 'On Trip' && (
                              <>
                                <button 
                                  onClick={() => {
                                    setTripToComplete(trip);
                                    setCompleteConfirmOpen(true);
                                  }}
                                  className="btn btn-primary"
                                  style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-mint-dark)', borderColor: 'var(--color-mint-dark)' }}
                                >
                                  <Check size={12} />
                                  Complete
                                </button>
                                <button 
                                  onClick={() => {
                                    setTripToCancel(trip);
                                    setCancelConfirmOpen(true);
                                  }}
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 8px', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                          </div>
                        </td>
                      )}

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card grid list */}
          <div className="mobile-cards-grid" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
            {filteredTrips.map(trip => {
              const cargo = getCargoDisplayInfo(trip.cargoWeight, trip.vehicle);
              
              return (
                <div 
                  key={trip._id}
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
                    <span style={{ fontSize: '0.90rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {trip.tripCode}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      ...getStatusBadgeStyle(trip.status)
                    }}>
                      {trip.status}
                    </span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />

                  {/* Route */}
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{trip.origin}</span>
                      <ArrowRight size={12} style={{ color: 'var(--text-light)' }} />
                      <span>{trip.destination}</span>
                    </div>
                  </div>

                  {/* Grid details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px 16px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>VEHICLE</span>
                      <strong>{trip.vehicle?.name || 'Unassigned'}</strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)' }}>{trip.vehicle?.registrationNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>DRIVER</span>
                      <strong>{trip.driver?.name || 'Unassigned'}</strong>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600, marginBottom: '2px' }}>CARGO CAPACITY</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: cargo.textColor }}>
                          {cargo.currentWeight} / {cargo.maxCapacity || 0} kg
                        </span>
                        <div style={{ flexGrow: 1, height: '6px', backgroundColor: 'var(--bg-cream)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(cargo.capacityPercent, 100)}%`, height: '100%', backgroundColor: cargo.barColor }} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>DISTANCE</span>
                      <strong>{trip.plannedDistance} km</strong>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px' }}>LIFECYCLE</span>
                      {renderLifecycleProgress(trip.status)}
                    </div>
                  </div>

                  {/* Actions mobile */}
                  {canManage && (
                    <>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        
                        {trip.status === 'Draft' && (
                          <>
                            <button 
                              onClick={() => {
                                setSelectedTrip(trip);
                                setFormBackendError(null);
                                setFormOpen(true);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                setTripToDispatch(trip);
                                setDispatchConfirmOpen(true);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              Dispatch
                            </button>
                          </>
                        )}

                        {trip.status === 'Dispatched' && (
                          <button 
                            onClick={() => handleStartTrip(trip._id)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: 'var(--color-blue-dark)' }}
                          >
                            Start Trip
                          </button>
                        )}

                        {trip.status === 'On Trip' && (
                          <button 
                            onClick={() => {
                              setTripToComplete(trip);
                              setCompleteConfirmOpen(true);
                            }}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: 'var(--color-mint-dark)', borderColor: 'var(--color-mint-dark)' }}
                          >
                            Complete
                          </button>
                        )}

                        {(trip.status === 'Draft' || trip.status === 'Dispatched' || trip.status === 'On Trip') && (
                          <button 
                            onClick={() => {
                              setTripToCancel(trip);
                              setCancelConfirmOpen(true);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                          >
                            Cancel
                          </button>
                        )}

                      </div>
                    </>
                  )}

                </div>
              );
            })}
          </div>
        </>
      )}

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

        @media (max-width: 1200px) {
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
