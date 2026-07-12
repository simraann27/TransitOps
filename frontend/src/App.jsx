import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FleetPage from './pages/FleetPage';
import DriversPage from './pages/DriversPage';
import TripsPage from './pages/TripsPage';
import MaintenancePage from './pages/MaintenancePage';
import FuelExpensesPage from './pages/FuelExpensesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', backgroundColor: '#fef2f2', border: '1.5px solid #f87171', borderRadius: '16px', color: '#b91c1c', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>React Rendering Runtime Crash</h2>
          <p style={{ fontWeight: 600 }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ marginTop: '16px', fontSize: '0.82rem', overflowX: 'auto', backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AppShell>
                  <Dashboard />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fleet" 
            element={
              <ProtectedRoute>
                <AppShell>
                  <FleetPage />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/drivers" 
            element={
              <ProtectedRoute>
                <AppShell>
                  <DriversPage />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips" 
            element={
              <ProtectedRoute>
                <AppShell>
                  <TripsPage />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/maintenance" 
            element={
              <ProtectedRoute>
                <AppShell>
                  <MaintenancePage />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fuel-expenses" 
            element={
              <ProtectedRoute>
                <AppShell>
                  <FuelExpensesPage />
                </AppShell>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AppShell>
                  <ErrorBoundary>
                    <AnalyticsPage />
                  </ErrorBoundary>
                </AppShell>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
