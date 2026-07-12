import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/permissions';
import { 
  Plus, 
  Search, 
  Droplet,
  Compass,
  FileText,
  AlertTriangle,
  Shield,
  Sparkles,
  DollarSign,
  Edit2,
  Trash2,
  ListFilter
} from 'lucide-react';

// Reusable modals
import FuelRecordFormModal from '../components/FuelRecordFormModal';
import ExpenseFormModal from '../components/ExpenseFormModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

export default function FuelExpensesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // RBAC clearance checks
  const canView = user && hasPermission(user.role, 'fuel-expenses');
  const canManage = user && hasPermission(user.role, 'fuel-expenses');

  // Redirect unauthorized roles immediately
  useEffect(() => {
    if (!canView) {
      navigate('/dashboard', { replace: true });
    }
  }, [canView, navigate]);

  // Tab State
  const [activeTab, setActiveTab] = useState('fuel'); // 'fuel' or 'expenses'

  // Data states
  const [fuelRecords, setFuelRecords] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Search & Filter state
  const [fuelSearch, setFuelSearch] = useState('');
  const [fuelVehicleFilter, setFuelVehicleFilter] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('');

  // Modals & Save states
  const [fuelFormOpen, setFuelFormOpen] = useState(false);
  const [selectedFuelRecord, setSelectedFuelRecord] = useState(null);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formBackendError, setFormBackendError] = useState(null);

  // Delete confirmations states
  const [deleteFuelOpen, setDeleteFuelOpen] = useState(false);
  const [fuelToDelete, setFuelToDelete] = useState(null);
  const [deleteExpenseOpen, setDeleteExpenseOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch all operational cost records
  const fetchAllData = useCallback(async () => {
    try {
      // 1. Fetch fuel records
      const fResponse = await fetch(`${apiBaseUrl}/api/fuel`);
      const fData = await fResponse.json();
      if (fData.success) {
        setFuelRecords(fData.records || []);
      }

      // 2. Fetch expenses
      const eResponse = await fetch(`${apiBaseUrl}/api/expenses`);
      const eData = await eResponse.json();
      if (eData.success) {
        setExpenses(eData.expenses || []);
      }

      // 3. Fetch maintenance
      const mResponse = await fetch(`${apiBaseUrl}/api/maintenance`);
      const mData = await mResponse.json();
      if (mData.success) {
        setMaintenanceRecords(mData.records || []);
      }

      setApiError(null);
    } catch (error) {
      console.error("Failed to sync cost operations records:", error);
      setApiError(error.message || "Failed to establish a live connection to the backend server.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Initial fetch
  useEffect(() => {
    if (canView) {
      const timer = setTimeout(() => {
        fetchAllData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [canView, fetchAllData]);

  const handleManualSync = () => {
    setLoading(true);
    setApiError(null);
    fetchAllData();
  };

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Fuel Form submission
  const handleFuelSubmit = async (formData) => {
    setIsSaving(true);
    setFormBackendError(null);

    const isEdit = !!selectedFuelRecord;
    const url = isEdit
      ? `${apiBaseUrl}/api/fuel/${selectedFuelRecord._id}`
      : `${apiBaseUrl}/api/fuel`;
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
        isEdit ? "Fuel record updated successfully" : "Fuel record added successfully",
        "success"
      );
      setFuelFormOpen(false);
      setSelectedFuelRecord(null);
      handleManualSync();
    } catch (error) {
      console.error("Save fuel error:", error);
      setFormBackendError(error.message || "Failed to save the fuel record.");
    } finally {
      setIsSaving(false);
    }
  };

  // Expense Form submission
  const handleExpenseSubmit = async (formData) => {
    setIsSaving(true);
    setFormBackendError(null);

    const isEdit = !!selectedExpense;
    const url = isEdit
      ? `${apiBaseUrl}/api/expenses/${selectedExpense._id}`
      : `${apiBaseUrl}/api/expenses`;
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
        isEdit ? "Expense updated successfully" : "Expense added successfully",
        "success"
      );
      setExpenseFormOpen(false);
      setSelectedExpense(null);
      handleManualSync();
    } catch (error) {
      console.error("Save expense error:", error);
      setFormBackendError(error.message || "Failed to save the expense record.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Fuel Confirm
  const handleDeleteFuelConfirm = async () => {
    if (!fuelToDelete) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/fuel/${fuelToDelete._id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Delete operation failed');
      }

      triggerToast("Fuel record deleted successfully", "success");
      setDeleteFuelOpen(false);
      setFuelToDelete(null);
      handleManualSync();
    } catch (error) {
      console.error("Delete fuel error:", error);
      triggerToast(error.message || "Failed to remove refuel log.", "error");
      setDeleteFuelOpen(false);
      setFuelToDelete(null);
    }
  };

  // Delete Expense Confirm
  const handleDeleteExpenseConfirm = async () => {
    if (!expenseToDelete) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/expenses/${expenseToDelete._id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Delete operation failed');
      }

      triggerToast("Expense deleted successfully", "success");
      setDeleteExpenseOpen(false);
      setExpenseToDelete(null);
      handleManualSync();
    } catch (error) {
      console.error("Delete expense error:", error);
      triggerToast(error.message || "Failed to remove expense.", "error");
      setDeleteExpenseOpen(false);
      setExpenseToDelete(null);
    }
  };

  // Helpers
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

  const getExpenseCategoryIcon = (category) => {
    switch (category) {
      case "Toll":
        return <Compass size={14} style={{ color: 'var(--color-blue-dark)' }} />;
      case "Parking":
        return <Compass size={14} style={{ color: 'var(--color-blue-dark)' }} />;
      case "Permit":
        return <FileText size={14} style={{ color: 'var(--text-secondary)' }} />;
      case "Fine":
        return <AlertTriangle size={14} style={{ color: '#ef4444' }} />;
      case "Insurance":
        return <Shield size={14} style={{ color: 'var(--color-mint-dark)' }} />;
      case "Cleaning":
        return <Sparkles size={14} style={{ color: 'var(--color-lavender-dark)' }} />;
      default:
        return <DollarSign size={14} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const getExpenseBadgeStyle = (category) => {
    switch (category) {
      case "Fine":
        return { backgroundColor: '#fef2f2', color: '#ef4444' };
      case "Insurance":
        return { backgroundColor: 'var(--color-mint-glow)', color: 'var(--color-mint-dark)' };
      case "Toll":
      case "Parking":
        return { backgroundColor: 'var(--color-blue-glow)', color: 'var(--color-blue-dark)' };
      default:
        return { backgroundColor: 'var(--bg-cream)', color: 'var(--text-secondary)' };
    }
  };

  // Calculations for KPI Cards
  const totalFuelCost = fuelRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
  const totalFuelLiters = fuelRecords.reduce((sum, r) => sum + (r.liters || 0), 0);
  const averageFuelCost = totalFuelLiters > 0 ? (totalFuelCost / totalFuelLiters) : 0;

  const totalOtherExpensesCost = expenses.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalMaintenanceCost = maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
  
  const totalOperationalCost = totalFuelCost + totalOtherExpensesCost + totalMaintenanceCost;

  // Extract unique vehicles list for filters
  const uniqueVehiclesForFuelFilter = Array.from(new Set(fuelRecords.map(r => r.vehicle?._id).filter(Boolean)))
    .map(id => fuelRecords.find(r => r.vehicle?._id === id)?.vehicle);

  // Filter fuel records
  const filteredFuelRecords = fuelRecords.filter(r => {
    const vName = r.vehicle?.name || '';
    const vReg = r.vehicle?.registrationNumber || '';
    const station = r.fuelStation || '';
    const tCode = r.trip?.tripCode || '';

    const matchesSearch = vName.toLowerCase().includes(fuelSearch.toLowerCase()) ||
                          vReg.toLowerCase().includes(fuelSearch.toLowerCase()) ||
                          station.toLowerCase().includes(fuelSearch.toLowerCase()) ||
                          tCode.toLowerCase().includes(fuelSearch.toLowerCase());

    const matchesVehicle = fuelVehicleFilter === '' || r.vehicle?._id === fuelVehicleFilter;

    return matchesSearch && matchesVehicle;
  });

  // Filter expenses records
  const filteredExpenses = expenses.filter(r => {
    const desc = r.description || '';
    const vName = r.vehicle?.name || '';
    const tCode = r.trip?.tripCode || '';

    const matchesSearch = desc.toLowerCase().includes(expenseSearch.toLowerCase()) ||
                          vName.toLowerCase().includes(expenseSearch.toLowerCase()) ||
                          tCode.toLowerCase().includes(expenseSearch.toLowerCase());

    const matchesCategory = expenseCategoryFilter === '' || r.category === expenseCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (!canView) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      
      {/* Toast Notice */}
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage('')} 
      />

      {/* Fuel Form Modal */}
      <FuelRecordFormModal 
        key={selectedFuelRecord?._id || (fuelFormOpen ? 'open_fuel' : 'closed_fuel')}
        isOpen={fuelFormOpen}
        onClose={() => {
          setFuelFormOpen(false);
          setSelectedFuelRecord(null);
          setFormBackendError(null);
        }}
        onSubmit={handleFuelSubmit}
        initialData={selectedFuelRecord}
        isSaving={isSaving}
        backendError={formBackendError}
      />

      {/* Expense Form Modal */}
      <ExpenseFormModal 
        key={selectedExpense?._id || (expenseFormOpen ? 'open_expense' : 'closed_expense')}
        isOpen={expenseFormOpen}
        onClose={() => {
          setExpenseFormOpen(false);
          setSelectedExpense(null);
          setFormBackendError(null);
        }}
        onSubmit={handleExpenseSubmit}
        initialData={selectedExpense}
        isSaving={isSaving}
        backendError={formBackendError}
      />

      {/* Delete Fuel Confirmation Modal */}
      <ConfirmModal 
        isOpen={deleteFuelOpen}
        title="Delete fuel record?"
        message={
          fuelToDelete 
            ? `This fuel entry (Amount: ${formatIndianCurrency(fuelToDelete.cost)}, Volume: ${fuelToDelete.liters} L, Vehicle: ${fuelToDelete.vehicle?.name || 'N/A'}) will be permanently removed from operational cost records.`
            : ''
        }
        onCancel={() => {
          setDeleteFuelOpen(false);
          setFuelToDelete(null);
        }}
        onConfirm={handleDeleteFuelConfirm}
      />

      {/* Delete Expense Confirmation Modal */}
      <ConfirmModal 
        isOpen={deleteExpenseOpen}
        title="Delete expense entry?"
        message={
          expenseToDelete 
            ? `Are you sure you want to permanently delete this expense item (${expenseToDelete.category}: ${formatIndianCurrency(expenseToDelete.amount)})? This action is irreversible.`
            : ''
        }
        onCancel={() => {
          setDeleteExpenseOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={handleDeleteExpenseConfirm}
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
            Fuel & Expenses
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Track fleet fuel consumption and operational spending.
          </p>
        </div>

        {canManage && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                setSelectedFuelRecord(null);
                setFormBackendError(null);
                setFuelFormOpen(true);
              }}
              className="btn btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-blue-dark)'
              }}
            >
              <Plus size={16} />
              Add Fuel Record
            </button>
            <button 
              onClick={() => {
                setSelectedExpense(null);
                setFormBackendError(null);
                setExpenseFormOpen(true);
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
              Add Expense
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '20px'
      }}>
        {/* Total Fuel Cost */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-blue-dark)' }}>
          <span className="summary-title">Total Fuel Cost</span>
          <span className="summary-value" style={{ color: 'var(--color-blue-dark)' }}>
            {loading ? '...' : formatIndianCurrency(totalFuelCost)}
          </span>
        </div>

        {/* Fuel Consumed */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-lavender-dark)' }}>
          <span className="summary-title">Fuel Consumed</span>
          <span className="summary-value" style={{ color: 'var(--color-lavender-dark)' }}>
            {loading ? '...' : `${totalFuelLiters.toLocaleString()} L`}
          </span>
        </div>

        {/* Average Fuel Cost / Liter */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-yellow-dark)' }}>
          <span className="summary-title">Average Fuel Cost / Liter</span>
          <span className="summary-value" style={{ color: 'var(--color-yellow-dark)' }}>
            {loading ? '...' : formatIndianCurrency(averageFuelCost) + '/L'}
          </span>
        </div>

        {/* Other Expenses */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--text-secondary)' }}>
          <span className="summary-title">Other Expenses</span>
          <span className="summary-value" style={{ color: 'var(--text-secondary)' }}>
            {loading ? '...' : formatIndianCurrency(totalOtherExpensesCost)}
          </span>
        </div>

        {/* Total Operational Cost */}
        <div className="summary-card" style={{ borderLeft: '3px solid var(--color-mint-dark)', minWidth: '190px' }}>
          <span className="summary-title">Total Operational Cost</span>
          <span className="summary-value" style={{ color: 'var(--color-mint-dark)', fontSize: '1.65rem' }}>
            {loading ? '...' : formatIndianCurrency(totalOperationalCost)}
          </span>
        </div>
      </div>

      {/* Tabs list bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-light)',
        gap: '24px',
        paddingLeft: '8px'
      }}>
        <button
          onClick={() => setActiveTab('fuel')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 4px',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'fuel' ? 'var(--color-blue-dark)' : 'var(--text-light)',
            borderBottom: activeTab === 'fuel' ? '3px solid var(--color-blue-dark)' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          Fuel Records
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 4px',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'expenses' ? 'var(--color-blue-dark)' : 'var(--text-light)',
            borderBottom: activeTab === 'expenses' ? '3px solid var(--color-blue-dark)' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          Other Expenses
        </button>
      </div>

      {/* TAB CONTENT: Fuel Records */}
      {activeTab === 'fuel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filters fuel */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '20px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
              
              {/* Search fuel */}
              <div style={{ position: 'relative', minWidth: '260px' }} className="search-input-field">
                <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-light)' }}>
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search vehicle, station, trip..."
                  value={fuelSearch}
                  onChange={(e) => setFuelSearch(e.target.value)}
                  style={{
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-cream)',
                    borderRadius: '10px',
                    padding: '8px 12px 8px 36px',
                    fontSize: '0.88rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </div>

              {/* Filter fuel vehicle */}
              <select 
                value={fuelVehicleFilter}
                onChange={(e) => setFuelVehicleFilter(e.target.value)}
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
                <option value="">All Vehicles</option>
                {uniqueVehiclesForFuelFilter.map(v => (
                  v && <option key={v._id} value={v._id}>{v.name}</option>
                ))}
              </select>
            </div>

            {(fuelSearch || fuelVehicleFilter) && (
              <button 
                onClick={() => {
                  setFuelSearch('');
                  setFuelVehicleFilter('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-blue-dark)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 12px'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Table fuel */}
          {loading ? (
            <div style={{ height: '100px', backgroundColor: '#ffffff', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
          ) : apiError ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <span style={{ color: '#ef4444' }}>{apiError}</span>
            </div>
          ) : filteredFuelRecords.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '20px',
              padding: '60px 24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ color: 'var(--text-light)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <Droplet size={48} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No refuel records.
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                {fuelSearch || fuelVehicleFilter ? "No matching records found." : "Add vehicle refuel logs to monitor mileage consumption stats."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table Refuel */}
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
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Trip</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Liters</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Fuel Cost</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Cost / Liter</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Odometer</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Fuel Station</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFuelRecords.map((record, idx) => {
                      const costPerLiter = record.liters > 0 ? (record.cost / record.liters) : 0;

                      return (
                        <tr key={record._id} style={{ 
                          borderBottom: idx < filteredFuelRecords.length - 1 ? '1px solid var(--bg-cream)' : 'none'
                        }} className="table-row-hover">
                          <td style={{ padding: '16px 20px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            <div>{record.vehicle?.name || 'N/A'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{record.vehicle?.registrationNumber || ''}</div>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {record.trip?.tripCode || '—'}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                            {formatDate(record.date)}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {record.liters} L
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                            {formatIndianCurrency(record.cost || 0)}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                            {formatIndianCurrency(costPerLiter)}/L
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {record.odometer?.toLocaleString()} km
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {record.fuelStation || '—'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button 
                                onClick={() => {
                                  setSelectedFuelRecord(record);
                                  setFormBackendError(null);
                                  setFuelFormOpen(true);
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  setFuelToDelete(record);
                                  setDeleteFuelOpen(true);
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards Refuel */}
              <div className="mobile-cards-grid" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
                {filteredFuelRecords.map(record => {
                  const costPerLiter = record.liters > 0 ? (record.cost / record.liters) : 0;
                  return (
                    <div key={record._id} style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'var(--shadow-soft)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{record.vehicle?.name || 'N/A'}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{record.vehicle?.registrationNumber || ''}</span>
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div>DATE: <strong>{formatDate(record.date)}</strong></div>
                        <div>TRIP: <strong>{record.trip?.tripCode || '—'}</strong></div>
                        <div>VOLUME: <strong>{record.liters} L</strong></div>
                        <div>COST: <strong style={{ color: 'var(--text-primary)' }}>{formatIndianCurrency(record.cost || 0)}</strong></div>
                        <div>RATE: <strong>{formatIndianCurrency(costPerLiter)}/L</strong></div>
                        <div>ODOMETER: <strong>{record.odometer?.toLocaleString()} km</strong></div>
                        <div style={{ gridColumn: 'span 2' }}>STATION: <strong>{record.fuelStation || '—'}</strong></div>
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setSelectedFuelRecord(record); setFuelFormOpen(true); }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Edit</button>
                        <button onClick={() => { setFuelToDelete(record); setDeleteFuelOpen(true); }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444' }}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      )}

      {/* TAB CONTENT: General Expenses */}
      {activeTab === 'expenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filters expense */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '20px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
              
              {/* Search expense */}
              <div style={{ position: 'relative', minWidth: '260px' }} className="search-input-field">
                <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-light)' }}>
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search description, vehicle, trip..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  style={{
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-cream)',
                    borderRadius: '10px',
                    padding: '8px 12px 8px 36px',
                    fontSize: '0.88rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </div>

              {/* Filter expense category */}
              <select 
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
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
                <option value="Toll">Toll</option>
                <option value="Parking">Parking</option>
                <option value="Permit">Permit</option>
                <option value="Fine">Fine</option>
                <option value="Insurance">Insurance</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {(expenseSearch || expenseCategoryFilter) && (
              <button 
                onClick={() => {
                  setExpenseSearch('');
                  setExpenseCategoryFilter('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-blue-dark)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 12px'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Table expenses */}
          {loading ? (
            <div style={{ height: '100px', backgroundColor: '#ffffff', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
          ) : apiError ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <span style={{ color: '#ef4444' }}>{apiError}</span>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: '20px',
              padding: '60px 24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ color: 'var(--text-light)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <ListFilter size={48} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No general expenses.
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                {expenseSearch || expenseCategoryFilter ? "No matching records found." : "Log other operational expenses like tolls, parking, or permits."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table Expenses */}
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
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Description</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Vehicle</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Trip</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '16px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((record, idx) => {
                      return (
                        <tr key={record._id} style={{ 
                          borderBottom: idx < filteredExpenses.length - 1 ? '1px solid var(--bg-cream)' : 'none'
                        }} className="table-row-hover">
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              ...getExpenseBadgeStyle(record.category)
                            }}>
                              {getExpenseCategoryIcon(record.category)}
                              {record.category}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {record.description}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {record.vehicle ? (
                              <>
                                <div><strong>{record.vehicle.name}</strong></div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>{record.vehicle.registrationNumber}</div>
                              </>
                            ) : '—'}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {record.trip?.tripCode || '—'}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                            {formatDate(record.date)}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                            {formatIndianCurrency(record.amount || 0)}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button 
                                onClick={() => {
                                  setSelectedExpense(record);
                                  setFormBackendError(null);
                                  setExpenseFormOpen(true);
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  setExpenseToDelete(record);
                                  setDeleteExpenseOpen(true);
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards Expenses */}
              <div className="mobile-cards-grid" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
                {filteredExpenses.map(record => {
                  return (
                    <div key={record._id} style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'var(--shadow-soft)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          ...getExpenseBadgeStyle(record.category)
                        }}>
                          {getExpenseCategoryIcon(record.category)}
                          {record.category}
                        </span>
                        <strong style={{ color: 'var(--text-primary)' }}>{formatIndianCurrency(record.amount || 0)}</strong>
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <p style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontWeight: 600 }}>{record.description}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>VEHICLE: <strong>{record.vehicle?.name || '—'}</strong></div>
                          <div>TRIP: <strong>{record.trip?.tripCode || '—'}</strong></div>
                          <div>DATE: <strong>{formatDate(record.date)}</strong></div>
                        </div>
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setSelectedExpense(record); setExpenseFormOpen(true); }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Edit</button>
                        <button onClick={() => { setExpenseToDelete(record); setDeleteExpenseOpen(true); }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444' }}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
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
