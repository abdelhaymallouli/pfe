import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/navigation/Footer';
import { Landing } from './pages/Landing';
import  Login  from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import {EventList}  from './pages/events/EventList'; 
import { EventForm } from './pages/events/EventForm';
import { VendorList } from './pages/vendors/VendorList';




// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    // Display a loading spinner while checking auth status
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return currentUser ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />

      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/events" 
        element={
          <ProtectedRoute>
            <EventList />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/events/new" 
        element={
          <ProtectedRoute>
            <EventForm />
          </ProtectedRoute>
        } 
      />


      <Route 
        path="/vendors" 
        element={
          <ProtectedRoute>
            <VendorList />
          </ProtectedRoute>
        } 
      />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main className="min-h-screen">
          <AppRoutes />
        </main>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
            },
            success: {
              style: {
                border: '1px solid #22c55e',
              },
            },
            error: {
              style: {
                border: '1px solid #ef4444',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;