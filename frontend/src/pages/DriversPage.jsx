import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/permissions';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw,
  XCircle,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

// Reusable modals
import DriverFormModal from '../components/DriverFormModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

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

export default function DriversPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // RBAC permissions checks
  const canView = user && (hasPermission(user.role, 'drivers:view') || hasPermission(user.role, 'drivers'));
  const canManage = user && hasPermission(user.role, 'drivers');

  // Redirect unauthorized roles (such as Dispatcher / Financial Analyst)
  useEffect(() => {
    if (!canView) {
      navigate('/dashboard', { replace: true });
    }
  }, [canView, navigate]);

  // Page list states
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('');

  // Modals & Save states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formBackendError, setFormBackendError] = useState(null);

  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch Drivers callback
  const fetchDrivers = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/drivers`);
      if (!response.ok) {
        throw new Error(`Sync failure: Server responded with status ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setDrivers(data.drivers || []);
        setApiError(null);
      } else {
        throw new Error(data.message || "Unknown API response structure");
      }
    } catch (error) {
      console.error("Failed to sync driver registry:", error);
      setApiError(error.message || "Failed to establish a live connection to the backend server.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Initial fetch
  useEffect(() => {
    if (canView) {
      const timer = setTimeout(() => {
        fetchDrivers();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [canView, fetchDrivers]);

  const handleManualSync = () => {
    setLoading(true);
    setApiError(null);
    fetchDrivers();
  };

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Create / Update form handler
  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    setFormBackendError(null);

    const isEdit = !!selectedDriver;
    const url = isEdit
      ? `${apiBaseUrl}/api/drivers/${selectedDriver._id}`
      : `${apiBaseUrl}/api/drivers`;
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
        isEdit ? "Driver updated successfully" : "Driver added successfully",
        "success"
      );
      setFormOpen(false);
      setSelectedDriver(null);
      handleManualSync();
    } catch (error) {
      console.error("Save error:", error);
      const errText = error.message || '';
      if (errText.includes('11000') || errText.includes('duplicate') || errText.toLowerCase().includes('license')) {
        setFormBackendError("A driver with this license number already exists.");
      } else {
        setFormBackendError(errText || "Failed to save the driver profile.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!driverToDelete) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/drivers/${driverToDelete._id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Delete operation failed');
      }

      triggerToast("Driver deleted successfully", "success");
      setDeleteOpen(false);
      setDriverToDelete(null);
      handleManualSync();
    } catch (error) {
      console.error("Delete error:", error);
      triggerToast(error.message || "Failed to remove driver from registry.", "error");
    }
  };

  // Helpers
  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setEligibilityFilter('');
  };

  const getDriverInitials = (name = "") => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Dynamic values calculated from current time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDriversCount = drivers.length;
  const availableCount = drivers.filter(d => d.status === 'Available').length;
  const activeCount = drivers.filter(d => d.status === 'On Trip').length;
  const offDutyCount = drivers.filter(d => d.status === 'Off Duty').length;
  const suspendedCount = drivers.filter(d => d.status === 'Suspended').length;
  const expiredCount = drivers.filter(d => new Date(d.licenseExpiryDate) < today).length;

  // Filter logic on client-side
  const filteredDrivers = drivers.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                          v.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
                          v.contact.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || v.status === statusFilter;
    const matchesCategory = categoryFilter === '' || v.licenseCategory === categoryFilter;

    // Eligibility check
    const matchesEligibility = eligibilityFilter === '' ||
      (eligibilityFilter === 'Eligible' && v.isEligible) ||
      (eligibilityFilter === 'License Expired' && new Date(v.licenseExpiryDate) < today) ||
      (eligibilityFilter === 'Suspended' && v.status === 'Suspended');

    return matchesSearch && matchesStatus && matchesCategory && matchesEligibility;
  });

  // Helper safety score visual rating
  const getSafetyScoreStyle = (score) => {
    if (score >= 90) return { label: "Excellent", color: 'var(--color-mint-dark)', bgColor: 'var(--color-mint-glow)' };
    if (score >= 75) return { label: "Good", color: 'var(--color-blue-dark)', bgColor: 'var(--color-blue-glow)' };
    if (score >= 60) return { label: "Attention", color: 'var(--color-yellow-dark)', bgColor: 'var(--color-yellow-glow)' };
    return { label: "Risk", color: '#ef4444', bgColor: '#fef2f2' };
  };

  // Helper eligibility style badge
  const getEligibilityInfo = (driver) => {
    const expiry = new Date(driver.licenseExpiryDate);
    if (expiry < today) {
      return { label: "License Expired", style: { backgroundColor: '#fef2f2', color: '#ef4444' } };
    }
    if (driver.status === "Suspended") {
      return { label: "Suspended", style: { backgroundColor: '#fef2f2', color: '#b91c1c' } };
    }
    if (driver.status === "On Trip") {
      return { label: "On Trip", style: { backgroundColor: 'var(--color-blue-glow)', color: 'var(--color-blue-dark)' } };
    }
    if (driver.status === "Off Duty") {
      return { label: "Off Duty", style: { backgroundColor: 'var(--bg-cream)', color: 'var(--text-secondary)' } };
    }
    return { label: "Eligible", style: { backgroundColor: 'var(--color-mint-glow)', color: 'var(--color-mint-dark)' } };
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Available":
        return { backgroundColor: 'var(--color-mint-glow)', color: 'var(--color-mint-dark)' };
      case "On Trip":
        return { backgroundColor: 'var(--color-blue-glow)', color: 'var(--color-blue-dark)' };
      case "Off Duty":
        return { backgroundColor: 'var(--bg-cream)', color: 'var(--text-secondary)' };
      case "Suspended":
        return { backgroundColor: '#fef2f2', color: '#b91c1c' };
      default:
        return { backgroundColor: 'var(--bg-lavender-gray)', color: 'var(--text-secondary)' };
    }
  };

  if (!canView) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      
      {/* Toast Notice */}
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage('')} 
      />

      {/* Form Dialog */}
      <DriverFormModal 
        key={selectedDriver?._id || (formOpen ? 'open' : 'closed')}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedDriver(null);
          setFormBackendError(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedDriver}
        isSaving={isSaving}
        backendError={formBackendError}
      />

      {/* Delete Prompt */}
      <ConfirmModal 
        isOpen={deleteOpen}
        title="Delete this driver?"
        message={
          driverToDelete 
            ? `This action will permanently remove ${driverToDelete.name} from driver records.`
            : ''
        }
        onCancel={() => {
          setDeleteOpen(false);
          setDriverToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Drivers & Safety Profiles
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Manage driver eligibility, licensing and operational safety.
          </p>
        </div>

        {canManage && (
          <button 
            onClick={() => {
              setSelectedDriver(null);
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
            Add Driver
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '20px'
      }}>
        {/* Total */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--text-light)' }}>
          <span className="summary-title">Total Drivers</span>
          <span className="summary-value">
            {loading ? '...' : <Counter value={totalDriversCount} />}
          </span>
        </div>

        {/* Available */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-mint-dark)' }}>
          <span className="summary-title">Available</span>
          <span className="summary-value" style={{ color: 'var(--color-mint-dark)' }}>
            {loading ? '...' : <Counter value={availableCount} />}
          </span>
        </div>

        {/* On Trip */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-blue-dark)' }}>
          <span className="summary-title">On Trip</span>
          <span className="summary-value" style={{ color: 'var(--color-blue-dark)' }}>
            {loading ? '...' : <Counter value={activeCount} />}
          </span>
        </div>

        {/* Off Duty */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--text-secondary)' }}>
          <span className="summary-title">Off Duty</span>
          <span className="summary-value" style={{ color: 'var(--text-secondary)' }}>
            {loading ? '...' : <Counter value={offDutyCount} />}
          </span>
        </div>

        {/* Suspended */}
        <div className="summary-card" style={{ borderLeft: '3px solid #b91c1c' }}>
          <span className="summary-title">Suspended</span>
          <span className="summary-value" style={{ color: '#b91c1c' }}>
            {loading ? '...' : <Counter value={suspendedCount} />}
          </span>
        </div>

        {/* Expired License */}
        <div className="summary-card" style={{ borderLeft: '3px solid #ef4444' }}>
          <span className="summary-title">Expired Licenses</span>
          <span className="summary-value" style={{ color: '#ef4444' }}>
            {loading ? '...' : <Counter value={expiredCount} />}
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
          <div style={{ position: 'relative', minWidth: '240px' }} className="search-input-field">
            <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-light)' }}>
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search driver name, license, contact..."
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

          {/* Filter: Category */}
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
            <option value="">All Categories</option>
            <option value="LMV">LMV</option>
            <option value="HMV">HMV</option>
            <option value="HGMV">HGMV</option>
            <option value="Transport">Transport</option>
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
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* Filter: Eligibility */}
          <select 
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
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
            <option value="">All Drivers</option>
            <option value="Eligible">Eligible</option>
            <option value="License Expired">License Expired</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(search || statusFilter || categoryFilter || eligibilityFilter) && (
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

      {/* Main Content Area */}
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
            Unable to sync driver data
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
      ) : filteredDrivers.length === 0 ? (
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
            <FileSpreadsheet size={48} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No drivers registered yet.
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '380px', margin: '0 auto 24px auto' }}>
            {search || statusFilter || categoryFilter || eligibilityFilter 
              ? "No registered drivers match your active search filter settings."
              : "Add your first driver to begin managing driver eligibility and safety."
            }
          </p>
          {canManage && !search && !statusFilter && !categoryFilter && !eligibilityFilter && (
            <button 
              onClick={() => {
                setSelectedDriver(null);
                setFormBackendError(null);
                setFormOpen(true);
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              Add First Driver
            </button>
          )}
        </div>
      ) : (
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
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Driver</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>License</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>License Expiry</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Trip Completion</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Safety Score</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Eligibility</th>
                  {canManage && (
                    <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver, idx) => {
                  const isExpired = new Date(driver.licenseExpiryDate) < today;
                  const safety = getSafetyScoreStyle(driver.safetyScore);
                  const eligibility = getEligibilityInfo(driver);

                  return (
                    <tr key={driver._id} style={{ 
                      borderBottom: idx < filteredDrivers.length - 1 ? '1px solid var(--bg-cream)' : 'none',
                      transition: 'background-color 0.2s'
                    }} className="table-row-hover">
                      
                      {/* Driver */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-lavender-glow)',
                            color: 'var(--color-lavender-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}>
                            {getDriverInitials(driver.name)}
                          </div>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {driver.name}
                          </span>
                        </div>
                      </td>

                      {/* License */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {driver.licenseNumber}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {driver.licenseCategory}
                      </td>

                      {/* Expiry */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ 
                            color: isExpired ? '#ef4444' : 'var(--text-secondary)',
                            fontWeight: isExpired ? 700 : 500
                          }}>
                            {formatDate(driver.licenseExpiryDate)}
                          </span>
                          {isExpired && (
                            <span style={{ color: '#ef4444', display: 'flex', flexShrink: 0 }}>
                              <AlertTriangle size={14} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {driver.contact}
                      </td>

                      {/* Completion */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '110px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', width: '38px' }}>
                            {driver.tripCompletionPercentage}%
                          </span>
                          <div style={{ flexGrow: 1, height: '6px', backgroundColor: 'var(--bg-cream)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${driver.tripCompletionPercentage}%`, height: '100%', backgroundColor: 'var(--color-blue-dark)', borderRadius: '3px' }} />
                          </div>
                        </div>
                      </td>

                      {/* Safety */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          backgroundColor: safety.bgColor,
                          color: safety.color
                        }}>
                          {driver.safetyScore}/100 ({safety.label})
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          ...getStatusBadgeStyle(driver.status)
                        }}>
                          {driver.status}
                        </span>
                      </td>

                      {/* Eligibility */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          ...eligibility.style
                        }}>
                          {eligibility.label}
                        </span>
                      </td>

                      {/* Actions */}
                      {canManage && (
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button 
                              onClick={() => {
                                setSelectedDriver(driver);
                                setFormBackendError(null);
                                setFormOpen(true);
                              }}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                padding: '4px',
                                borderRadius: '6px'
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setDriverToDelete(driver);
                                setDeleteOpen(true);
                              }}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                padding: '4px',
                                borderRadius: '6px'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-cards-grid" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
            {filteredDrivers.map(driver => {
              const isExpired = new Date(driver.licenseExpiryDate) < today;
              const safety = getSafetyScoreStyle(driver.safetyScore);
              const eligibility = getEligibilityInfo(driver);

              return (
                <div 
                  key={driver._id}
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
                        backgroundColor: 'var(--color-lavender-glow)',
                        color: 'var(--color-lavender-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}>
                        {getDriverInitials(driver.name)}
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {driver.name}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      ...getStatusBadgeStyle(driver.status)
                    }}>
                      {driver.status}
                    </span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />

                  {/* Details grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px 16px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>LICENSE NO</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{driver.licenseNumber}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>CATEGORY</span>
                      <strong>{driver.licenseCategory}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>EXPIRY</span>
                      <strong style={{ color: isExpired ? '#ef4444' : 'var(--text-primary)' }}>
                        {formatDate(driver.licenseExpiryDate)}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>CONTACT</span>
                      <strong>{driver.contact}</strong>
                    </div>
                    
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600, marginBottom: '2px' }}>TRIP COMPLETION</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{driver.tripCompletionPercentage}%</span>
                        <div style={{ flexGrow: 1, height: '6px', backgroundColor: 'var(--bg-cream)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${driver.tripCompletionPercentage}%`, height: '100%', backgroundColor: 'var(--color-blue-dark)' }} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>SAFETY RATING</span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: safety.bgColor,
                        color: safety.color,
                        display: 'inline-block',
                        marginTop: '2px'
                      }}>
                        {driver.safetyScore} ({safety.label})
                      </span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>ELIGIBILITY</span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        ...eligibility.style,
                        display: 'inline-block',
                        marginTop: '2px'
                      }}>
                        {eligibility.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions mobile */}
                  {canManage && (
                    <>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => {
                            setSelectedDriver(driver);
                            setFormBackendError(null);
                            setFormOpen(true);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            setDriverToDelete(driver);
                            setDeleteOpen(true);
                          }}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
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

        @media (max-width: 992px) {
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
