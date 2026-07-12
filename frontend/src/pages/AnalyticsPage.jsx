import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/permissions';
import { 
  Droplet, 
  Activity, 
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';

// Reusable Counter helper
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

// Reusable custom SVG Donut Chart
function SVGDonutChart({ data, title }) {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const circumference = 2 * Math.PI * 40; // radius = 40, circumference ≈ 251.3
  
  if (total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--text-light)', fontSize: '0.88rem' }}>
        <Activity size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
        No active data records
      </div>
    );
  }

  const segments = data.map((item, idx) => {
    if (item.value === 0) return null;
    const percent = item.value / total;
    const strokeLength = percent * circumference;

    // Calculate offset purely without reassigning external variables
    const precedingPercent = data.slice(0, idx).reduce((sum, prevItem) => sum + (prevItem.value / total), 0);
    const strokeOffset = circumference - strokeLength - (precedingPercent * circumference);

    return {
      ...item,
      strokeLength,
      strokeOffset
    };
  }).filter(Boolean);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', padding: '10px 0' }}>
      {/* SVG Circle Canvas */}
      <svg width="150" height="150" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
        {segments.map((item, idx) => (
          <circle
            key={idx}
            cx="60"
            cy="60"
            r="40"
            fill="transparent"
            stroke={item.color}
            strokeWidth="16"
            strokeDasharray={`${item.strokeLength} ${circumference}`}
            strokeDashoffset={item.strokeOffset}
            style={{ transition: 'stroke-width 0.2s, stroke-dashoffset 0.3s ease-in-out', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.target.setAttribute('stroke-width', '20'); }}
            onMouseLeave={(e) => { e.target.setAttribute('stroke-width', '16'); }}
          />
        ))}
      </svg>

      {/* Legend list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px', textAlign: 'left' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '4px', textTransform: 'uppercase' }}>
          {title}
        </h4>
        {data.map((item, idx) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: item.color }} />
              <span>{item.name}: <strong>{item.value}</strong> ({percent}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Reusable custom SVG Bar Chart
function SVGBarChart({ data, yLabel }) {
  const maxVal = Math.max(...data.map(item => item.value), 1);
  const chartHeight = 150;
  const barWidth = 32;
  const spacing = 16;
  const totalWidth = data.length * (barWidth + spacing) + spacing;

  return (
    <div style={{ overflowX: 'auto', padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
      <svg width={Math.max(totalWidth, 260)} height="200" style={{ overflow: 'visible' }}>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight - (ratio * chartHeight) + 20;
          const gridVal = Math.round(ratio * maxVal);
          return (
            <g key={idx}>
              <line x1="30" y1={y} x2="98%" y2={y} stroke="var(--border-light)" strokeDasharray="3,3" />
              <text x="5" y={y + 4} style={{ fontSize: '0.7rem', fill: 'var(--text-light)', fontWeight: 600 }}>{gridVal}</text>
            </g>
          );
        })}

        {/* Vertical bars */}
        {data.map((item, idx) => {
          const barHeight = (item.value / maxVal) * chartHeight;
          const x = idx * (barWidth + spacing) + 40;
          const y = chartHeight - barHeight + 20;

          return (
            <g key={idx}>
              {/* Tooltip text on hover */}
              <text 
                x={x + barWidth / 2} 
                y={y - 6} 
                textAnchor="middle" 
                style={{ fontSize: '0.75rem', fill: 'var(--text-primary)', fontWeight: 700, opacity: 0 }}
                id={`bar-tooltip-${idx}`}
              >
                {item.value} {yLabel}
              </text>
              
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 4)}
                rx="6"
                fill={item.color}
                style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.target.setAttribute('fill', 'var(--color-blue-dark)');
                  const tooltip = document.getElementById(`bar-tooltip-${idx}`);
                  if (tooltip) tooltip.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.target.setAttribute('fill', item.color);
                  const tooltip = document.getElementById(`bar-tooltip-${idx}`);
                  if (tooltip) tooltip.style.opacity = '0';
                }}
              />

              {/* X label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 40}
                textAnchor="middle"
                style={{ fontSize: '0.72rem', fill: 'var(--text-secondary)', fontWeight: 600 }}
              >
                {item.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // RBAC clearance checks
  const canView = user && (hasPermission(user.role, 'analytics') || hasPermission(user.role, 'analytics:view'));

  // Redirect unauthorized direct navigations
  useEffect(() => {
    if (!canView) {
      navigate('/dashboard', { replace: true });
    }
  }, [canView, navigate]);

  // Page States
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuel, setFuel] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [partialError, setPartialError] = useState(false);
  const [syncTime, setSyncTime] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Load all operational statistics datasets in parallel with partial failure protection
  const fetchAllAnalyticsData = useCallback(async () => {
    setLoading(true);
    setPartialError(false);

    try {
      const endpoints = [
        `${apiBaseUrl}/api/vehicles`,
        `${apiBaseUrl}/api/drivers`,
        `${apiBaseUrl}/api/trips`,
        `${apiBaseUrl}/api/maintenance`,
        `${apiBaseUrl}/api/fuel`,
        `${apiBaseUrl}/api/expenses`
      ];

      // Execute with Promise.allSettled to protect against partial downtime failures
      const results = await Promise.allSettled(
        endpoints.map(url => fetch(url).then(async res => {
          if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
          return res.json();
        }))
      );

      // Map resolved datasets
      if (results[0].status === 'fulfilled') setVehicles(results[0].value.vehicles || []);
      else setPartialError(true);

      if (results[1].status === 'fulfilled') setDrivers(results[1].value.drivers || []);
      else setPartialError(true);

      if (results[2].status === 'fulfilled') setTrips(results[2].value.trips || []);
      else setPartialError(true);

      if (results[3].status === 'fulfilled') setMaintenance(results[3].value.records || []);
      else setPartialError(true);

      if (results[4].status === 'fulfilled') setFuel(results[4].value.records || []);
      else setPartialError(true);

      if (results[5].status === 'fulfilled') setExpenses(results[5].value.expenses || []);
      else setPartialError(true);

      setSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error("General fetch analytics error:", err);
      setPartialError(true);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Initial fetch
  useEffect(() => {
    if (canView) {
      const timer = setTimeout(() => {
        fetchAllAnalyticsData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [canView, fetchAllAnalyticsData]);

  const handleManualSync = fetchAllAnalyticsData;

  // Format Helper Indian Rupee
  const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // ----------------------------------------------------
  // KPI CALCULATIONS
  // ----------------------------------------------------
  
  // 1. Fleet Utilization
  const activeVehicles = vehicles.filter(v => v.status === "On Trip").length;
  const nonRetiredVehicles = vehicles.filter(v => v.status !== "Retired").length;
  const fleetUtilization = nonRetiredVehicles > 0 ? Math.round((activeVehicles / nonRetiredVehicles) * 100) : 0;

  // 2. Total Costs
  const fuelCostSum = fuel.reduce((sum, r) => sum + (r.cost || 0), 0);
  const generalExpenseCostSum = expenses.reduce((sum, r) => sum + (r.amount || 0), 0);
  const maintenanceCostSum = maintenance.reduce((sum, r) => sum + (r.cost || 0), 0);
  const totalOperationalCost = fuelCostSum + generalExpenseCostSum + maintenanceCostSum;

  // 3. Trip Completion Rate
  const completedTrips = trips.filter(t => t.status === "Completed").length;
  const nonCancelledTrips = trips.filter(t => t.status !== "Cancelled").length;
  const tripCompletionRate = nonCancelledTrips > 0 ? Math.round((completedTrips / nonCancelledTrips) * 100) : 0;

  // 4. Average Driver Safety Score
  const totalDrivers = drivers.length;
  const safetySum = drivers.reduce((sum, d) => sum + (d.safetyScore || 0), 0);
  const avgSafetyScore = totalDrivers > 0 ? Math.round(safetySum / totalDrivers) : 0;

  // 5. Fuel Consumed
  const fuelLitersSum = fuel.reduce((sum, r) => sum + (r.liters || 0), 0);

  // 6. Active Operations
  const activeOpsCount = trips.filter(t => t.status === "Dispatched" || t.status === "On Trip").length;

  // ----------------------------------------------------
  // FLEET ANALYTICS
  // ----------------------------------------------------
  const fleetStatusData = [
    { name: "Available", value: vehicles.filter(v => v.status === "Available").length, color: "var(--color-mint-dark)" },
    { name: "On Trip", value: vehicles.filter(v => v.status === "On Trip").length, color: "var(--color-blue-dark)" },
    { name: "In Shop", value: vehicles.filter(v => v.status === "In Shop").length, color: "var(--color-yellow-dark)" },
    { name: "Retired", value: vehicles.filter(v => v.status === "Retired").length, color: "var(--text-light)" }
  ];

  const totalFleetCount = vehicles.length;
  const operationalFleetCount = vehicles.filter(v => v.status === "Available" || v.status === "On Trip").length;
  const unavailableFleetCount = vehicles.filter(v => v.status === "In Shop" || v.status === "Retired").length;

  // ----------------------------------------------------
  // TRIP PERFORMANCE
  // ----------------------------------------------------
  const tripLifecycleData = [
    { name: "Draft", value: trips.filter(t => t.status === "Draft").length, color: "var(--color-lavender-dark)" },
    { name: "Dispatched", value: trips.filter(t => t.status === "Dispatched").length, color: "var(--color-yellow-dark)" },
    { name: "On Trip", value: trips.filter(t => t.status === "On Trip").length, color: "var(--color-blue-dark)" },
    { name: "Completed", value: trips.filter(t => t.status === "Completed").length, color: "var(--color-mint-dark)" },
    { name: "Cancelled", value: trips.filter(t => t.status === "Cancelled").length, color: "#ef4444" }
  ];

  // ----------------------------------------------------
  // COST BREAKDOWN CONTRIBUTION
  // ----------------------------------------------------
  const costBreakdownData = [
    { name: "Fuel", value: fuelCostSum, color: "var(--color-blue-dark)" },
    { name: "Maintenance", value: maintenanceCostSum, color: "var(--color-yellow-dark)" },
    { name: "Other Expenses", value: generalExpenseCostSum, color: "var(--color-mint-dark)" }
  ];

  // ----------------------------------------------------
  // VEHICLE-WISE FUEL CONSUMPTION GROUPING
  // ----------------------------------------------------
  const vehicleFuelMap = {};
  fuel.forEach(r => {
    const vName = r.vehicle?.name || 'Unknown';
    vehicleFuelMap[vName] = (vehicleFuelMap[vName] || 0) + (r.liters || 0);
  });
  const vehicleFuelData = Object.entries(vehicleFuelMap).map(([name, value]) => ({
    name,
    value: Math.round(value),
    color: "var(--color-blue-dark)"
  })).slice(0, 5); // display top 5 vehicles

  // ----------------------------------------------------
  // DRIVER SAFETY INSIGHTS
  // ----------------------------------------------------
  const sortedDrivers = [...drivers].sort((a, b) => b.safetyScore - a.safetyScore).slice(0, 4);
  
  const excellentDriversCount = drivers.filter(d => d.safetyScore >= 90).length;
  const attentionRequiredCount = drivers.filter(d => d.safetyScore < 75).length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiredLicensesCount = drivers.filter(d => new Date(d.licenseExpiryDate) < today).length;

  // ----------------------------------------------------
  // VEHICLE COST-TO-ACQUISITION RATIO
  // ----------------------------------------------------
  const vehicleInsights = vehicles.map(v => {
    // 1. Fuel associated
    const vFuelCost = fuel.filter(f => f.vehicle?._id === v._id || f.vehicle === v._id).reduce((sum, r) => sum + r.cost, 0);
    // 2. Maintenance associated
    const vMaintCost = maintenance.filter(m => m.vehicle?._id === v._id || m.vehicle === v._id).reduce((sum, r) => sum + r.cost, 0);
    // 3. Other Expenses associated
    const vExpCost = expenses.filter(e => e.vehicle?._id === v._id || e.vehicle === v._id).reduce((sum, r) => sum + r.amount, 0);

    const totalOperatingCost = vFuelCost + vMaintCost + vExpCost;
    const ratio = v.acquisitionCost > 0 ? ((totalOperatingCost / v.acquisitionCost) * 100) : 0;

    return {
      name: v.name,
      registration: v.registrationNumber,
      acquisitionCost: v.acquisitionCost,
      operatingCost: totalOperatingCost,
      ratio
    };
  }).sort((a, b) => b.ratio - a.ratio).slice(0, 5); // display top 5 vehicles by ratio

  // ----------------------------------------------------
  // RULE-BASED INSIGHT PANEL GENERATION
  // ----------------------------------------------------
  const getRuleBasedInsights = () => {
    const alerts = [];
    const inShopCount = vehicles.filter(v => v.status === "In Shop").length;

    if (inShopCount > 0) {
      alerts.push({
        type: 'warning',
        text: `${inShopCount} vehicle(s) are currently unavailable due to maintenance.`
      });
    }

    if (expiredLicensesCount > 0) {
      alerts.push({
        type: 'critical',
        text: `${expiredLicensesCount} driver license(s) require renewal attention.`
      });
    }

    if (fleetUtilization > 80) {
      alerts.push({
        type: 'warning',
        text: `Fleet utilization is high at ${fleetUtilization}%. Capacity planning may be required.`
      });
    } else if (fleetUtilization < 30 && vehicles.length > 0) {
      alerts.push({
        type: 'info',
        text: `Fleet utilization is currently low at ${fleetUtilization}%.`
      });
    }

    // Determine largest operational cost category
    if (totalOperationalCost > 0) {
      if (fuelCostSum >= Math.max(maintenanceCostSum, generalExpenseCostSum)) {
        alerts.push({
          type: 'info',
          text: "Fuel is the largest tracked operational cost category."
        });
      } else if (maintenanceCostSum >= Math.max(fuelCostSum, generalExpenseCostSum)) {
        alerts.push({
          type: 'info',
          text: "Maintenance currently represents the largest operational cost category."
        });
      }
    }

    if (alerts.length === 0) {
      alerts.push({
        type: 'success',
        text: "Operations are currently stable with no major alerts."
      });
    }

    return alerts;
  };

  const operationalInsightsList = getRuleBasedInsights();

  if (!canView) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Analytics & Insights
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Understand fleet performance, operational costs and transport efficiency.
          </p>
          {syncTime && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600 }}>
              Last synced: {syncTime}
            </span>
          )}
        </div>

        <button 
          onClick={handleManualSync}
          disabled={loading}
          className="btn btn-secondary"
          style={{
            padding: '10px 20px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* Partial Error Warnings Banner */}
      {partialError && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem', fontWeight: 600 }}>
            <AlertTriangle size={18} />
            <span>Some analytics data could not be synchronized. Analytics values display calculations from successfully synced APIs.</span>
          </div>
          <button 
            onClick={handleManualSync}
            className="btn btn-secondary"
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.78rem', 
              color: '#b45309', 
              borderColor: 'rgba(180, 83, 9, 0.2)',
              backgroundColor: '#fffdf5'
            }}
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Loading Skeleton indicators */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top grids */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '20px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ height: '70px', backgroundColor: '#ffffff', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
          {/* Charts boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[1, 2].map(i => (
              <div key={i} style={{ height: '240px', backgroundColor: '#ffffff', borderRadius: '20px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
          <style>{`
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 0.3; }
              100% { opacity: 0.6; }
            }
            .animate-spin {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <>
          {/* KPI metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '20px'
          }}>
            {/* Utilization */}
            <div className="summary-card" style={{ borderLeft: '3px solid var(--color-blue-dark)' }}>
              <span className="summary-title">Fleet Utilization</span>
              <span className="summary-value" style={{ color: 'var(--color-blue-dark)' }}>
                <Counter value={fleetUtilization} />%
              </span>
            </div>

            {/* Total Operational Cost */}
            <div className="summary-card" style={{ borderLeft: '3px solid var(--color-mint-dark)', minWidth: '180px' }}>
              <span className="summary-title">Total Operational Cost</span>
              <span className="summary-value" style={{ color: 'var(--color-mint-dark)', fontSize: '1.45rem', fontWeight: 800 }}>
                {formatIndianCurrency(totalOperationalCost)}
              </span>
            </div>

            {/* Trip Completion Rate */}
            <div className="summary-card" style={{ borderLeft: '3px solid var(--color-lavender-dark)' }}>
              <span className="summary-title">Trip Completion Rate</span>
              <span className="summary-value" style={{ color: 'var(--color-lavender-dark)' }}>
                <Counter value={tripCompletionRate} />%
              </span>
            </div>

            {/* Driver Safety Score */}
            <div className="summary-card" style={{ borderLeft: '3px solid var(--color-yellow-dark)' }}>
              <span className="summary-title">Average Driver Safety</span>
              <span className="summary-value" style={{ color: 'var(--color-yellow-dark)' }}>
                <Counter value={avgSafetyScore} />/100
              </span>
            </div>

            {/* Fuel Consumed */}
            <div className="summary-card" style={{ borderLeft: '3px solid var(--text-light)' }}>
              <span className="summary-title">Fuel Consumed</span>
              <span className="summary-value" style={{ color: 'var(--text-primary)' }}>
                <Counter value={fuelLitersSum} /> L
              </span>
            </div>

            {/* Active Operations */}
            <div className="summary-card" style={{ borderLeft: '3px solid var(--text-secondary)' }}>
              <span className="summary-title">Active Operations</span>
              <span className="summary-value" style={{ color: 'var(--text-secondary)' }}>
                <Counter value={activeOpsCount} /> Trips
              </span>
            </div>
          </div>

          {/* Section 1: Fleet Status & Trip distribution */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {/* Donut: Fleet status */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-soft)' }}>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Fleet Status Allocation
              </h3>
              <SVGDonutChart data={fleetStatusData} title="Vehicles" />
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)', margin: '16px 0' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                <div>Total Fleet: <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.9rem' }}>{totalFleetCount}</strong></div>
                <div>Operational: <strong style={{ color: 'var(--color-mint-dark)', display: 'block', fontSize: '0.9rem' }}>{operationalFleetCount}</strong></div>
                <div>Unavailable: <strong style={{ color: '#ef4444', display: 'block', fontSize: '0.9rem' }}>{unavailableFleetCount}</strong></div>
              </div>
            </div>

            {/* Bar: Trip Performance */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-soft)' }}>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Trip Lifecycle Distribution
              </h3>
              <SVGBarChart data={tripLifecycleData} yLabel="Trips" />
            </div>
          </div>

          {/* Section 2: Cost Breakdown & Fuel Grouping */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {/* Donut: Cost Breakdown */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-soft)' }}>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Operational Cost Contribution
              </h3>
              <SVGDonutChart data={costBreakdownData} title="Spending" />
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)', margin: '16px 0' }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Spent:</span>
                <strong>{formatIndianCurrency(totalOperationalCost)}</strong>
              </div>
            </div>

            {/* Bar: Vehicle-wise Fuel group */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-soft)' }}>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Fuel Consumption by Vehicle (Liters)
              </h3>
              {vehicleFuelData.length > 0 ? (
                <SVGBarChart data={vehicleFuelData} yLabel="L" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', color: 'var(--text-light)', fontSize: '0.88rem' }}>
                  <Droplet size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  No fuel logs registered
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Driver Safety Rankings & ROI Cost-to-Acquisition ratio */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {/* Driver safety rank lists */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)' }}>
                Top Drivers Performance
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {sortedDrivers.map((driver, idx) => {
                  const isEx = driver.safetyScore >= 90;
                  return (
                    <div key={driver._id || idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span>
                          <strong>{driver.name}</strong> • {driver.licenseCategory}
                        </span>
                        <span style={{ fontWeight: 700, color: isEx ? 'var(--color-mint-dark)' : 'var(--text-secondary)' }}>
                          {driver.safetyScore}/100 ({driver.status})
                        </span>
                      </div>
                      
                      {/* Safety progress visual lines */}
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-cream)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${driver.safetyScore}%`,
                          height: '100%',
                          backgroundColor: isEx ? 'var(--color-mint-dark)' : 'var(--color-blue-dark)',
                          borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--bg-cream)' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                <div>Excellent (≥90): <strong style={{ color: 'var(--color-mint-dark)', display: 'block' }}>{excellentDriversCount}</strong></div>
                <div>Attention (&lt;75): <strong style={{ color: 'var(--color-yellow-dark)', display: 'block' }}>{attentionRequiredCount}</strong></div>
                <div>Expired Licenses: <strong style={{ color: '#ef4444', display: 'block' }}>{expiredLicensesCount}</strong></div>
              </div>
            </div>

            {/* ROI Cost-to-Acquisition ratio */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-soft)' }}>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Vehicle Cost-to-Acquisition Ratio
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-light)', fontWeight: 700 }}>
                      <th style={{ padding: '8px 4px' }}>Vehicle</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Acquisition</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Tracked Operating Cost</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Ratio (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleInsights.map((v, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < vehicleInsights.length - 1 ? '1px solid var(--bg-cream)' : 'none' }}>
                        <td style={{ padding: '8px 4px', fontWeight: 700, color: 'var(--text-primary)' }}>{v.name}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right' }}>{formatIndianCurrency(v.acquisitionCost)}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600 }}>{formatIndianCurrency(v.operatingCost)}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700, color: v.ratio > 50 ? '#ef4444' : 'var(--text-primary)' }}>
                          {v.ratio.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Operational Insights panel alerts */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} /> Operational Insights Alerts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {operationalInsightsList.map((alert, idx) => {
                let alertColor = 'var(--text-secondary)';
                let alertBg = 'var(--bg-cream)';
                let alertBorder = 'var(--border-light)';
                
                if (alert.type === 'critical') {
                  alertColor = '#b91c1c';
                  alertBg = '#fef2f2';
                  alertBorder = '#fca5a5';
                } else if (alert.type === 'warning') {
                  alertColor = '#b45309';
                  alertBg = '#fffbeb';
                  alertBorder = '#fef3c7';
                } else if (alert.type === 'success') {
                  alertColor = 'var(--color-mint-dark)';
                  alertBg = 'var(--color-mint-glow)';
                  alertBorder = 'rgba(16, 185, 129, 0.2)';
                } else if (alert.type === 'info') {
                  alertColor = 'var(--color-blue-dark)';
                  alertBg = 'var(--color-blue-glow)';
                  alertBorder = 'rgba(59, 130, 246, 0.2)';
                }

                return (
                  <div 
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: alertBg,
                      border: `1px solid ${alertBorder}`,
                      color: alertColor,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Info size={14} style={{ flexShrink: 0 }} />
                    <span>{alert.text}</span>
                  </div>
                );
              })}
            </div>
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
      `}</style>

    </div>
  );
}
