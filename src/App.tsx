import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider, useStore } from './context/StoreContext';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Activities from './pages/Activities';
import Expenses from './pages/Expenses';
import Appointments from './pages/Appointments';
import HealthTracker from './pages/HealthTracker';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';

function AppRoutes() {
  const { user } = useStore();

  if (!user || !user.isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!user.hasCompletedOnboarding) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout title="Dashboard"><Dashboard /></Layout>} />
      <Route path="/customers" element={<Layout title="Customers"><Customers /></Layout>} />
      <Route path="/activities" element={<Layout title="Activities"><Activities /></Layout>} />
      <Route path="/expenses" element={<Layout title="Expenses"><Expenses /></Layout>} />
      <Route path="/appointments" element={<Layout title="Appointments"><Appointments /></Layout>} />
      <Route path="/health" element={<Layout title="Health Tracker"><HealthTracker /></Layout>} />
      <Route path="/notifications" element={<Layout title="Notifications"><Notifications /></Layout>} />
      <Route path="/settings" element={<Layout title="Settings"><Settings /></Layout>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <Router>
          <AppRoutes />
        </Router>
      </StoreProvider>
    </ThemeProvider>
  );
}
