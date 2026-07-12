import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, 
  Compass, 
  Wrench, 
  Users, 
  Activity, 
  AlertTriangle,
  RefreshCw, 
  TrendingUp 
} from 'lucide-react';
import { motion } from 'framer-motion';

// Reusable CountUp visual helper
function Counter({ value, suffix = "" }) {
  // Use lazy state initialization to determine starting count
  const [count, setCount] = useState(() => {
    const end = parseInt(value, 10);
    return isNaN(end) ? value : 0;
  });

  useEffect(() => {
    const end = parseInt(value, 10);
    if (isNaN(end) || end <= 0) return;
    
    let start = 0;
    const duration = 1000; // 1s count duration
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

  return <span>{count}{suffix}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  
  const [vehicles, setVehicles] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Load backend API URL with fallback
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
      console.error("Failed to sync live vehicle registry data:", error);
      setApiError(error.message || "Failed to establish a live connection to the backend server.");
    } finally {
      setApiLoading(false);
    }
  }, [apiBaseUrl]);

  // Initial mount fetch. apiLoading is initialized to true, apiError to null,
  // so no state updates are triggered synchronously inside the effect lifecycle.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchVehicles]);

  const handleManualSync = () => {
    setApiLoading(true);
    setApiError(null);
    fetchVehicles();
  };

  // Operational metrics calculated from API data
  const totalVehiclesCount = vehicles.length;
  const nonRetiredVehicles = vehicles.filter(v => v.status !== "Retired");
  const activeVehiclesCount = vehicles.filter(v => v.status === "On Trip").length;
  const availableVehiclesCount = vehicles.filter(v => v.status === "Available").length;
  const maintenanceVehiclesCount = vehicles.filter(v => v.status === "In Shop").length;
  const retiredVehiclesCount = vehicles.filter(v => v.status === "Retired").length;

  // Fleet Utilization Calculation: On Trip / Total Non-Retired * 100
  const fleetUtilization = nonRetiredVehicles.length > 0 
    ? Math.round((activeVehiclesCount / nonRetiredVehicles.length) * 100)
    : 0;

  // Mock data for Recent Trips (as Trips API is not created yet)
  const recentTrips = [
    { id: "TRIP-2041", vehicle: "VAN-05", driver: "Alex Mercer", status: "On Trip", eta: "1.5 hrs" },
    { id: "TRIP-2040", vehicle: "TRK-12", driver: "Sophia Chen", status: "Completed", eta: "Delivered" },
    { id: "TRIP-2039", vehicle: "VAN-08", driver: "Marcus Aurelius", status: "Dispatched", eta: "3.2 hrs" },
    { id: "TRIP-2038", vehicle: "TRK-09", driver: "Elena Rostova", status: "Draft", eta: "Scheduled" }
  ];

  // Map trip statuses to pastel classes
  const getStatusStyle = (status) => {
    switch (status) {
      case "On Trip":
        return { backgroundColor: 'var(--color-blue-glow)', color: 'var(--color-blue-dark)' };
      case "Completed":
        return { backgroundColor: 'var(--color-mint-glow)', color: 'var(--color-mint-dark)' };
      case "Dispatched":
        return { backgroundColor: 'var(--color-yellow-glow)', color: 'var(--color-yellow-dark)' };
      case "Draft":
        return { backgroundColor: 'var(--color-lavender-glow)', color: 'var(--color-lavender-dark)' };
      default:
        return { backgroundColor: 'var(--bg-lavender-gray)', color: 'var(--text-secondary)' };
    }
  };

  // Stagger animation rules for cards
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      
      {/* Header Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Control Center Dashboard
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Welcome back, {user?.name} • Operational role: **{user?.role}**
          </p>
        </div>
        <button 
          onClick={handleManualSync} 
          disabled={apiLoading}
          className="btn btn-secondary" 
          style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={14} className={apiLoading ? 'spin-animate' : ''} />
          Sync Live Data
        </button>
      </div>

      {/* Non-blocking API sync error banner */}
      {apiError && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b91c1c' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '0.9rem', fontWeight: 700 }}>Unable to sync live fleet data</strong>
              <p style={{ fontSize: '0.8rem', color: '#7f1d1d', marginTop: '2px' }}>
                {apiError} (Offline fallbacks showing 0 vehicles)
              </p>
            </div>
          </div>
          <button 
            onClick={handleManualSync} 
            className="btn btn-secondary" 
            style={{ 
              borderColor: '#fca5a5', 
              color: '#b91c1c', 
              backgroundColor: '#fff',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >
        {/* KPI 1: Active Vehicles */}
        <motion.div variants={cardVariants} className="kpi-card" style={{ borderLeft: '4px solid var(--color-peach-dark)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Active Vehicles (On Trip)</span>
            <span className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-peach-glow)', color: 'var(--color-peach-dark)' }}>
              <Activity size={18} />
            </span>
          </div>
          <div className="kpi-value">
            {apiLoading ? '...' : <Counter value={activeVehiclesCount} />}
          </div>
          <span className="kpi-trend">Live from API</span>
        </motion.div>

        {/* KPI 2: Available Vehicles */}
        <motion.div variants={cardVariants} className="kpi-card" style={{ borderLeft: '4px solid var(--color-blue-dark)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Available Vehicles</span>
            <span className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-blue-glow)', color: 'var(--color-blue-dark)' }}>
              <Truck size={18} />
            </span>
          </div>
          <div className="kpi-value">
            {apiLoading ? '...' : <Counter value={availableVehiclesCount} />}
          </div>
          <span className="kpi-trend">Ready for dispatch</span>
        </motion.div>

        {/* KPI 3: Vehicles in Maintenance */}
        <motion.div variants={cardVariants} className="kpi-card" style={{ borderLeft: '4px solid var(--color-lavender-dark)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Vehicles in Maintenance</span>
            <span className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-lavender-glow)', color: 'var(--color-lavender-dark)' }}>
              <Wrench size={18} />
            </span>
          </div>
          <div className="kpi-value">
            {apiLoading ? '...' : <Counter value={maintenanceVehiclesCount} />}
          </div>
          <span className="kpi-trend">Locked in workshop</span>
        </motion.div>

        {/* KPI 4: Active Trips */}
        <motion.div variants={cardVariants} className="kpi-card" style={{ borderLeft: '4px solid var(--color-blue-dark)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Active Trips</span>
            <span className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-blue-glow)', color: 'var(--color-blue-dark)' }}>
              <Compass size={18} />
            </span>
          </div>
          <div className="kpi-value">
            <Counter value={18} />
          </div>
          <span className="kpi-trend">En route dispatch</span>
        </motion.div>

        {/* KPI 5: Pending Trips */}
        <motion.div variants={cardVariants} className="kpi-card" style={{ borderLeft: '4px solid var(--color-yellow-dark)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Pending Trips</span>
            <span className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-yellow-glow)', color: 'var(--color-yellow-dark)' }}>
              <Compass size={18} style={{ transform: 'rotate(45deg)' }} />
            </span>
          </div>
          <div className="kpi-value">
            <Counter value={4} />
          </div>
          <span className="kpi-trend">Awaiting driver manifest</span>
        </motion.div>

        {/* KPI 6: Drivers on Duty */}
        <motion.div variants={cardVariants} className="kpi-card" style={{ borderLeft: '4px solid var(--color-mint-dark)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Drivers on Duty</span>
            <span className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-mint-glow)', color: 'var(--color-mint-dark)' }}>
              <Users size={18} />
            </span>
          </div>
          <div className="kpi-value">
            <Counter value={22} />
          </div>
          <span className="kpi-trend">Credentials verified</span>
        </motion.div>

        {/* KPI 7: Fleet Utilization */}
        <motion.div variants={cardVariants} className="kpi-card" style={{ borderLeft: '4px solid var(--color-mint-dark)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Fleet Utilization</span>
            <span className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-mint-glow)', color: 'var(--color-mint-dark)' }}>
              <TrendingUp size={18} />
            </span>
          </div>
          <div className="kpi-value">
            {apiLoading ? '...' : <Counter value={fleetUtilization} suffix="%" />}
          </div>
          <span className="kpi-trend">Based on non-retired fleet</span>
        </motion.div>
      </motion.div>

      {/* Detailed Operations Grid (Trips Table + Status Visualizer) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: '24px'
      }} className="detailed-ops-grid">
        
        {/* Recent Trips Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: 'var(--shadow-soft)',
            overflowX: 'auto'
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Recent Dispatched Trips
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '12px 10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Trip ID</th>
                <th style={{ padding: '12px 10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Vehicle</th>
                <th style={{ padding: '12px 10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Driver</th>
                <th style={{ padding: '12px 10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 10px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>ETA</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((trip, idx) => (
                <tr key={idx} style={{ borderBottom: idx < recentTrips.length - 1 ? '1px solid var(--bg-cream)' : 'none' }}>
                  <td style={{ padding: '14px 10px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{trip.id}</td>
                  <td style={{ padding: '14px 10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{trip.vehicle}</td>
                  <td style={{ padding: '14px 10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{trip.driver}</td>
                  <td style={{ padding: '14px 10px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      ...getStatusStyle(trip.status)
                    }}>
                      {trip.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 10px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{trip.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Vehicle Status Visualizer Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: 'var(--shadow-soft)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Live Fleet Registry Status
          </h3>

          {/* Graphical Bars layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1, justifyContent: 'center' }}>
            
            {/* Status: Available */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Available Vehicles</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{availableVehiclesCount}</span>
              </div>
              <div className="status-bar-bg">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: totalVehiclesCount > 0 ? `${(availableVehiclesCount / totalVehiclesCount) * 100}%` : '0%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', backgroundColor: 'var(--color-blue-dark)', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Status: On Trip */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>On Trip / Active</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{activeVehiclesCount}</span>
              </div>
              <div className="status-bar-bg">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: totalVehiclesCount > 0 ? `${(activeVehiclesCount / totalVehiclesCount) * 100}%` : '0%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', backgroundColor: 'var(--color-peach-dark)', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Status: In Shop */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>In Maintenance (In Shop)</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{maintenanceVehiclesCount}</span>
              </div>
              <div className="status-bar-bg">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: totalVehiclesCount > 0 ? `${(maintenanceVehiclesCount / totalVehiclesCount) * 100}%` : '0%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', backgroundColor: 'var(--color-lavender-dark)', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Status: Retired */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Retired Vehicles</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{retiredVehiclesCount}</span>
              </div>
              <div className="status-bar-bg">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: totalVehiclesCount > 0 ? `${(retiredVehiclesCount / totalVehiclesCount) * 100}%` : '0%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', backgroundColor: 'var(--text-light)', borderRadius: '4px' }}
                />
              </div>
            </div>

          </div>
        </motion.div>

      </div>

      <style>{`
        /* Spin animations for loading icons */
        .spin-animate {
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* KPI Card styles */
        .kpi-card {
          background-color: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: 16px;
          padding: 20px;
          box-shadow: var(--shadow-soft);
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
          border-color: var(--border-focus);
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .kpi-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .kpi-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 8px;
        }

        .kpi-value {
          font-size: 2.25rem;
          font-weight: 800;
          font-family: var(--font-heading);
          color: var(--text-primary);
          line-height: 1;
          margin-top: 4px;
        }

        .kpi-trend {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-light);
        }

        /* Progress bars base background */
        .status-bar-bg {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background-color: var(--bg-cream);
          overflow: hidden;
        }

        /* Responsive Grid layouts */
        @media (max-width: 1200px) {
          .detailed-ops-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
