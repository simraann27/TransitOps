import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/permissions';
import { 
  Plus, 
  Search, 
  RefreshCw,
  XCircle,
  Wrench,
  Droplet,
  Settings,
  AlertTriangle,
  Play,
  Trash2,
  Edit2
} from 'lucide-react';

// Reusable components
import MaintenanceFormModal from '../components/MaintenanceFormModal';
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

export default function MaintenancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // RBAC clearance checks
  const canView = user && (hasPermission(user.role, 'maintenance:view') || hasPermission(user.role, 'maintenance'));
  const canManage = user && hasPermission(user.role, 'maintenance');

  // Redirect unauthorized direct navigations
  useEffect(() => {
    if (!canView) {
      navigate('/dashboard', { replace: true });
    }
  }, [canView, navigate]);

  // Page States
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');

  // Modals & Action states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null); // holds data for editing active record
  const [isSaving, setIsSaving] = useState(false);
  const [formBackendError, setFormBackendError] = useState(null);

  // Complete Confirmation state
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [recordToComplete, setRecordToComplete] = useState(null);

  // Delete Confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch complete maintenance list
  const fetchRecords = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/maintenance`);
      if (!response.ok) {
        throw new Error(`Sync failure: Server responded with status ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setRecords(data.records || []);
        setApiError(null);
      } else {
        throw new Error(data.message || "Unknown API response structure");
      }
    } catch (error) {
      console.error("Failed to sync vehicle maintenance records:", error);
      setApiError(error.message || "Failed to establish a live connection to the backend server.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Initial fetch
  useEffect(() => {
    if (canView) {
      const timer = setTimeout(() => {
        fetchRecords();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [canView, fetchRecords]);

  const handleManualSync = () => {
    setLoading(true);
    setApiError(null);
    fetchRecords();
  };

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Create / Edit Form submission
  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    setFormBackendError(null);

    const isEdit = !!selectedRecord;
    const url = isEdit
      ? `${apiBaseUrl}/api/maintenance/${selectedRecord._id}`
      : `${apiBaseUrl}/api/maintenance`;
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
        isEdit ? "Service record updated successfully" : "Vehicle moved to maintenance",
        "success"
      );
      setFormOpen(false);
      setSelectedRecord(null);
      handleManualSync();
    } catch (error) {
      console.error("Save service record error:", error);
      setFormBackendError(error.message || "Failed to save the maintenance record.");
    } finally {
      setIsSaving(false);
    }
  };

  // Complete Service Confirm Callback
  const handleCompleteConfirm = async () => {
    if (!recordToComplete) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/maintenance/${recordToComplete._id}/complete`, {
        method: 'PATCH'
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Complete service operation failed');
      }

      triggerToast("Maintenance completed successfully", "success");
      setCompleteConfirmOpen(false);
      setRecordToComplete(null);
      handleManualSync();
    } catch (error) {
      console.error("Complete error:", error);
      triggerToast(error.message || "Failed to complete service record.", "error");
      setCompleteConfirmOpen(false);
      setRecordToComplete(null);
    }
  };

  // Delete Service Record Confirm Callback
  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/maintenance/${recordToDelete._id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Delete record operation failed');
      }

      triggerToast("Maintenance record deleted successfully", "success");
      setDeleteConfirmOpen(false);
      setRecordToDelete(null);
      handleManualSync();
    } catch (error) {
      console.error("Delete error:", error);
      triggerToast(error.message || "Failed to delete service record.", "error");
      setDeleteConfirmOpen(false);
      setRecordToDelete(null);
    }
  };

  // Helpers
  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setServiceTypeFilter('');
  };

  const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case "Oil Change":
        return <Droplet size={16} style={{ color: 'var(--color-blue-dark)' }} />;
      case "Routine Service":
        return <Settings size={16} style={{ color: 'var(--color-mint-dark)' }} />;
      case "Tire Service":
        return <Wrench size={16} style={{ color: 'var(--text-secondary)' }} />;
      case "Brake Service":
        return <AlertTriangle size={16} style={{ color: 'var(--color-yellow-dark)' }} />;
      default:
        return <Wrench size={16} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  // Summary counts calculated from real API data
  const totalRecordsCount = records.length;
  const activeCount = records.filter(r => r.status === 'Active').length;
  const completedCount = records.filter(r => r.status === 'Completed').length;
  const totalCostVal = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  // Search & Filters on client-side
  const filteredRecords = records.filter(r => {
    const vName = r.vehicle?.name || '';
    const vReg = r.vehicle?.registrationNumber || '';
    const typeStr = r.serviceType || '';

    const matchesSearch = vName.toLowerCase().includes(search.toLowerCase()) ||
                          vReg.toLowerCase().includes(search.toLowerCase()) ||
                          typeStr.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === '' || r.status === statusFilter;
    const matchesType = serviceTypeFilter === '' || r.serviceType === serviceTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Active":
        return { backgroundColor: 'var(--color-yellow-glow)', color: 'var(--color-yellow-dark)' };
      case "Completed":
        return { backgroundColor: 'var(--color-mint-glow)', color: 'var(--color-mint-dark)' };
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

      {/* Reusable Form Drawer Modal */}
      <MaintenanceFormModal 
        key={selectedRecord?._id || (formOpen ? 'open' : 'closed')}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedRecord(null);
          setFormBackendError(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedRecord}
        isSaving={isSaving}
        backendError={formBackendError}
      />

      {/* Confirm Complete Modal */}
      <ConfirmModal 
        isOpen={completeConfirmOpen}
        title="Complete maintenance?"
        message={
          recordToComplete 
            ? `Confirm completing vehicle maintenance for ${recordToComplete.vehicle?.name || 'Assigned Vehicle'} (${recordToComplete.vehicle?.registrationNumber || 'N/A'}). The vehicle will return to Available status in the database.`
            : ''
        }
        onCancel={() => {
          setCompleteConfirmOpen(false);
          setRecordToComplete(null);
        }}
        onConfirm={handleCompleteConfirm}
        confirmText="Complete Service"
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal 
        isOpen={deleteConfirmOpen}
        title="Delete this service record?"
        message={
          recordToDelete 
            ? `Are you sure you want to permanently delete this completed maintenance service log for ${recordToDelete.vehicle?.name || 'Vehicle'}? This action is irreversible.`
            : ''
        }
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setRecordToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Maintenance
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Track service activity and keep unavailable vehicles out of dispatch.
          </p>
        </div>

        {canManage && (
          <button 
            onClick={() => {
              setSelectedRecord(null);
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
            Schedule Maintenance
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '20px'
      }}>
        {/* Total Records */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--text-light)' }}>
          <span className="summary-title">Total Records</span>
          <span className="summary-value">
            {loading ? '...' : <Counter value={totalRecordsCount} />}
          </span>
        </div>

        {/* Active Maintenance */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-yellow-dark)' }}>
          <span className="summary-title">Active Maintenance</span>
          <span className="summary-value" style={{ color: 'var(--color-yellow-dark)' }}>
            {loading ? '...' : <Counter value={activeCount} />}
          </span>
        </div>

        {/* Completed Services */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-mint-dark)' }}>
          <span className="summary-title">Completed Services</span>
          <span className="summary-value" style={{ color: 'var(--color-mint-dark)' }}>
            {loading ? '...' : <Counter value={completedCount} />}
          </span>
        </div>

        {/* Vehicles in Shop */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-blue-dark)' }}>
          <span className="summary-title">Vehicles In Shop</span>
          <span className="summary-value" style={{ color: 'var(--color-blue-dark)' }}>
            {loading ? '...' : <Counter value={activeCount} />}
          </span>
        </div>

        {/* Total Maintenance Cost */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-lavender-dark)', minWidth: '180px' }}>
          <span className="summary-title">Total Maintenance Cost</span>
          <span className="summary-value" style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 800 }}>
            {loading ? '...' : formatIndianCurrency(totalCostVal)}
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
              placeholder="Search vehicle name, registration, service..."
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

          {/* Filter: Service Type */}
          <select 
            value={serviceTypeFilter}
            onChange={(e) => setServiceTypeFilter(e.target.value)}
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
            <option value="">All Services</option>
            <option value="Routine Service">Routine Service</option>
            <option value="Oil Change">Oil Change</option>
            <option value="Tire Service">Tire Service</option>
            <option value="Brake Service">Brake Service</option>
            <option value="Engine Repair">Engine Repair</option>
            <option value="Inspection">Inspection</option>
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
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(search || statusFilter || serviceTypeFilter) && (
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
            Unable to sync maintenance data
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
      ) : filteredRecords.length === 0 ? (
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
            <Wrench size={48} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No maintenance records yet.
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '380px', margin: '0 auto 24px auto' }}>
            {search || statusFilter || serviceTypeFilter 
              ? "No scheduled service logs match your active search filter settings."
              : "Schedule vehicle service to begin tracking maintenance activity."
            }
          </p>
          {canManage && !search && !statusFilter && !serviceTypeFilter && (
            <button 
              onClick={() => {
                setSelectedRecord(null);
                setFormBackendError(null);
                setFormOpen(true);
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              Schedule First Maintenance
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
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Service</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Description</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Service Date</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Cost</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Completed On</th>
                  {canManage && (
                    <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, idx) => {
                  const desc = record.description || '';
                  const truncatedDesc = desc.length > 40 ? desc.substring(0, 37) + "..." : desc;

                  return (
                    <tr key={record._id} style={{ 
                      borderBottom: idx < filteredRecords.length - 1 ? '1px solid var(--bg-cream)' : 'none',
                      transition: 'background-color 0.2s'
                    }} className="table-row-hover">
                      
                      {/* Vehicle */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div>{record.vehicle?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>{record.vehicle?.registrationNumber || 'N/A'}</div>
                      </td>

                      {/* Service Type */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {getServiceIcon(record.serviceType)}
                          <span>{record.serviceType}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }} title={desc}>
                        {truncatedDesc || '—'}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {formatDate(record.date)}
                      </td>

                      {/* Cost */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                        {formatIndianCurrency(record.cost || 0)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          ...getStatusBadgeStyle(record.status)
                        }}>
                          {record.status}
                        </span>
                      </td>

                      {/* Completed On */}
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {formatDate(record.completedAt)}
                      </td>

                      {/* Action buttons */}
                      {canManage && (
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            
                            {/* Active Action triggers */}
                            {record.status === 'Active' && (
                              <>
                                <button 
                                  onClick={() => {
                                    setSelectedRecord(record);
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
                                  title="Edit details"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setRecordToComplete(record);
                                    setCompleteConfirmOpen(true);
                                  }}
                                  className="btn btn-primary"
                                  style={{ 
                                    padding: '6px 12px', 
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Play size={12} />
                                  Complete
                                </button>
                              </>
                            )}

                            {/* Completed actions: delete only */}
                            {record.status === 'Completed' && (
                              <button 
                                onClick={() => {
                                  setRecordToDelete(record);
                                  setDeleteConfirmOpen(true);
                                }}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--text-secondary)',
                                  padding: '4px',
                                  borderRadius: '6px'
                                }}
                                title="Delete record"
                              >
                                <Trash2 size={16} />
                              </button>
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

          {/* Mobile Card list */}
          <div className="mobile-cards-grid" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
            {filteredRecords.map(record => {
              return (
                <div 
                  key={record._id}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getServiceIcon(record.serviceType)}
                      <span style={{ fontSize: '0.90rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {record.serviceType}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      ...getStatusBadgeStyle(record.status)
                    }}>
                      {record.status}
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
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>VEHICLE</span>
                      <strong>{record.vehicle?.name || 'Unknown'}</strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)' }}>{record.vehicle?.registrationNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>COST</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatIndianCurrency(record.cost || 0)}</strong>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>DESCRIPTION</span>
                      <p style={{ margin: 0, color: 'var(--text-primary)' }}>{record.description || '—'}</p>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>SERVICE DATE</span>
                      <strong>{formatDate(record.date)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>COMPLETED ON</span>
                      <strong>{formatDate(record.completedAt)}</strong>
                    </div>
                  </div>

                  {/* Actions mobile */}
                  {canManage && (
                    <>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        
                        {record.status === 'Active' && (
                          <>
                            <button 
                              onClick={() => {
                                setSelectedRecord(record);
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
                                setRecordToComplete(record);
                                setCompleteConfirmOpen(true);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              Complete
                            </button>
                          </>
                        )}

                        {record.status === 'Completed' && (
                          <button 
                            onClick={() => {
                              setRecordToDelete(record);
                              setDeleteConfirmOpen(true);
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
