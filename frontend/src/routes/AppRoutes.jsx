import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import CitizenLayout from '../layouts/CitizenLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import HowItWorks from '../pages/public/HowItWorks';
import BrowseSchemes from '../pages/public/BrowseSchemes';
import SchemeDetails from '../pages/public/SchemeDetails';
import CompareSchemes from '../pages/public/CompareSchemes';
import Faq from '../pages/public/Faq';
import Contact from '../pages/public/Contact';
import NotFound from '../pages/public/NotFound';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Citizen Portal Pages
import Dashboard from '../pages/citizen/Dashboard';
import Profile from '../pages/citizen/Profile';
import EditProfile from '../pages/citizen/EditProfile';
import CheckEligibility from '../pages/citizen/CheckEligibility';
import EligibleSchemes from '../pages/citizen/EligibleSchemes';
import AllSchemes from '../pages/citizen/AllSchemes';
import Compare from '../pages/citizen/Compare';
import Favorites from '../pages/citizen/Favorites';
import RecentlyViewed from '../pages/citizen/RecentlyViewed';
import Notifications from '../pages/citizen/Notifications';
import Settings from '../pages/citizen/Settings';

// Admin Portal Pages
import AdminDashboard from '../pages/admin/Dashboard';
import SynchronizationMonitor from '../pages/admin/SynchronizationMonitor';
import SynchronizationLogs from '../pages/admin/SynchronizationLogs';
import UserMonitoring from '../pages/admin/UserMonitoring';
import AnalyticsReports from '../pages/admin/AnalyticsReports';
import SystemHealth from '../pages/admin/SystemHealth';

// Route Guard for Protected Citizen Pages
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'citizen') {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

// Route Guard for Protected Admin Pages
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Dynamic layout renderer based on user auth role
const ConditionalLayout = ({ children }) => {
  const { user } = useAuth();
  if (user && user.role === 'citizen') {
    return <CitizenLayout>{children}</CitizenLayout>;
  }
  return <PublicLayout>{children}</PublicLayout>;
};

export default function AppRoutes() {
  return (
    <Routes>
      
      {/* ========================================================
          1. PUBLIC LAYOUT ROUTES (Navbar + Footer)
         ======================================================== */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
      <Route path="/schemes" element={<PublicLayout><BrowseSchemes /></PublicLayout>} />
      <Route path="/schemes/:id" element={<ConditionalLayout><SchemeDetails /></ConditionalLayout>} />
      <Route path="/compare" element={<ConditionalLayout><CompareSchemes /></ConditionalLayout>} />
      <Route path="/faq" element={<PublicLayout><Faq /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

      {/* ========================================================
          2. AUTHENTICATION ROUTES (Distraction-Free Background)
         ======================================================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ========================================================
          3. PROTECTED CITIZEN PORTAL ROUTES (Sidebar + Header)
         ======================================================== */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <CitizenLayout><Dashboard /></CitizenLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <CitizenLayout><Profile /></CitizenLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/edit" 
        element={
          <ProtectedRoute>
            <CitizenLayout><EditProfile /></CitizenLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/eligibility" 
        element={
          <ProtectedRoute>
            <CitizenLayout><CheckEligibility /></CitizenLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/eligible-schemes" 
        element={
          <ProtectedRoute>
            <CitizenLayout><EligibleSchemes /></CitizenLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/schemes/all" 
        element={
          <ProtectedRoute>
            <CitizenLayout><AllSchemes /></CitizenLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/favorites" 
        element={
          <ProtectedRoute>
            <CitizenLayout><Favorites /></CitizenLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/recently-viewed" 
        element={
          <ProtectedRoute>
            <CitizenLayout><RecentlyViewed /></CitizenLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <CitizenLayout><Notifications /></CitizenLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <CitizenLayout><Settings /></CitizenLayout>
          </ProtectedRoute>
        } 
      />

      {/* ========================================================
          4. PROTECTED ADMIN MONITORING ROUTES (Purple Sidebar)
         ======================================================== */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/synchronization" 
        element={
          <AdminRoute>
            <AdminLayout><SynchronizationMonitor /></AdminLayout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/synchronization/logs" 
        element={
          <AdminRoute>
            <AdminLayout><SynchronizationLogs /></AdminLayout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <AdminRoute>
            <AdminLayout><UserMonitoring /></AdminLayout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          <AdminRoute>
            <AdminLayout><AnalyticsReports /></AdminLayout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/system-health" 
        element={
          <AdminRoute>
            <AdminLayout><SystemHealth /></AdminLayout>
          </AdminRoute>
        } 
      />

      {/*
          5. ERROR CATCH-ALL ROUTE
          */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}
