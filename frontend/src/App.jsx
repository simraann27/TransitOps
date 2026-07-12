import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FleetPage from './pages/FleetPage';
import DriversPage from './pages/DriversPage';
import TripsPage from './pages/TripsPage';
import MaintenancePage from './pages/MaintenancePage';
import FuelExpensesPage from './pages/FuelExpensesPage';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

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
        </Routes>
      </Router>
    </AuthProvider>
  );
}
