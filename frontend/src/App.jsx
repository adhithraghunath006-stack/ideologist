
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import OrbitCursor from './components/OrbitCursor';

// Public Pages
import Home from './pages/Home';
import Discover from './pages/Discover';
import IdeaDetail from './pages/IdeaDetail';
import HowItWorks from './pages/HowItWorks';
import PitchEvents from './pages/PitchEvents';
import Login from './pages/Login';
import Register from './pages/Register';

// Entrepreneur Pages
import EntrepreneurDashboard from './pages/entrepreneur/Dashboard';
import CreateIdea from './pages/entrepreneur/CreateIdea';
import EditIdea from './pages/entrepreneur/EditIdea';
import IdeaReport from './pages/entrepreneur/IdeaReport';

// Investor Pages
import InvestorDashboard from './pages/investor/Dashboard';
import SavedIdeas from './pages/investor/SavedIdeas';
import SentInterests from './pages/investor/SentInterests';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ReviewSubmissions from './pages/admin/ReviewSubmissions';
import EventManagement from './pages/admin/EventManagement';
import UserManagement from './pages/admin/UserManagement';
import AuditLogs from './pages/admin/AuditLogs';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-navy-950 text-slate-100 font-sans">

      {/* Custom physics-inspired cursor */}
      <OrbitCursor />

      {/* Global navigation */}
      <Navbar />

      {/* Application pages */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/ideas/:id" element={<IdeaDetail />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pitch-events" element={<PitchEvents />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Entrepreneur Protected Routes */}
          <Route
            path="/entrepreneur/dashboard"
            element={
              <ProtectedRoute allowedRoles={['entrepreneur', 'admin']}>
                <EntrepreneurDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/entrepreneur/create"
            element={
              <ProtectedRoute allowedRoles={['entrepreneur', 'admin']}>
                <CreateIdea />
              </ProtectedRoute>
            }
          />

          <Route
            path="/entrepreneur/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['entrepreneur', 'admin']}>
                <EditIdea />
              </ProtectedRoute>
            }
          />

          <Route
            path="/entrepreneur/report/:id"
            element={
              <ProtectedRoute allowedRoles={['entrepreneur', 'admin']}>
                <IdeaReport />
              </ProtectedRoute>
            }
          />

          {/* Investor Protected Routes */}
          <Route
            path="/investor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['investor', 'admin']}>
                <InvestorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/investor/saved"
            element={
              <ProtectedRoute allowedRoles={['investor', 'admin']}>
                <SavedIdeas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/investor/interests"
            element={
              <ProtectedRoute allowedRoles={['investor', 'admin']}>
                <SentInterests />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/submissions"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReviewSubmissions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EventManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global footer */}
      <Footer />
    </div>
  );
}
