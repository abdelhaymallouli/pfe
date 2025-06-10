import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/navigation/Footer';

import { Landing } from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { EventList } from './pages/events/EventList';
import { EventForm } from './pages/events/EventForm';
import { EventDetails } from './pages/events/EventDetails';
import { VendorList } from './pages/vendors/VendorList';
import { VendorDetails } from './pages/vendors/VendorDetails';
import { TransactionTracker } from './pages/transactions/TransactionTracker';
import { AddTransactionForm } from './pages/transactions/AddTransactionForm';
import { AdminLogin } from './pages/Admin/AdminLogin';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { UserManagement } from './pages/Admin/UserManagement';
import { EventManagement } from './pages/Admin/EventManagement';
import { VendorManagement } from './pages/Admin/VendorManagement';
import { CategoryManagement } from './pages/Admin/CategoryManagement';
import { RequestManagement } from './pages/Admin/RequestManagement';
import Profile from './pages/Profile';

// ✅ Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
};

// ✅ User Routes with Navbar & Footer
const UserLayout = () => (
  <>
    <Navbar />
    <main className="min-h-screen">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventList /></ProtectedRoute>} />
        <Route path="/events/new" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/vendors" element={<ProtectedRoute><VendorList /></ProtectedRoute>} />
        <Route path="/vendors/:id" element={<ProtectedRoute><VendorDetails /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionTracker /></ProtectedRoute>} />
        <Route path="/transactions/new" element={<ProtectedRoute><AddTransactionForm /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <Footer />
  </>
);

// ✅ Admin Routes without Navbar/Footer
const AdminRoutes = () => (
  <Routes>
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<UserManagement />} />
    <Route path="/admin/events" element={<EventManagement />} />
    <Route path="/admin/vendors" element={<VendorManagement />} />
    <Route path="/admin/categories" element={<CategoryManagement />} />
    <Route path="/admin/requests" element={<RequestManagement />} />
    <Route path="*" element={<Navigate to="/admin/login" replace />} />
  </Routes>
);

// ✅ Main App
function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      {isAdminPath ? <AdminRoutes /> : <UserLayout />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: { style: { border: '1px solid #22c55e' } },
          error: { style: { border: '1px solid #ef4444' } },
        }}
      />
    </AuthProvider>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;

