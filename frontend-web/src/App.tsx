import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

import CaseRegistrationPage from './pages/CaseRegistrationPage';
import CaseListPage from './pages/CaseListPage';
import CaseDetailPage from './pages/CaseDetailPage';
import DocumentHubPage from './pages/DocumentHubPage';
import HotspotMapPage from './pages/HotspotMapPage';
import LegalCenterPage from './pages/LegalCenterPage';
import SupervisorDashboardPage from './pages/SupervisorDashboardPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <ProtectedRoute>
            <CaseRegistrationPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/search" 
        element={
          <ProtectedRoute>
            <CaseListPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/case/:id" 
        element={
          <ProtectedRoute>
            <CaseDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/documents" 
        element={
          <ProtectedRoute>
            <DocumentHubPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/map" 
        element={
          <ProtectedRoute>
            <HotspotMapPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/legal" 
        element={
          <ProtectedRoute>
            <LegalCenterPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/supervision" 
        element={
          <ProtectedRoute>
            <SupervisorDashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
