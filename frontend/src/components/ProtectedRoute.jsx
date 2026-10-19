import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from './SkeletonLoader';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <SkeletonLoader count={4} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl bg-navy-900 border border-red-500/30 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Restricted Access</h2>
        <p className="text-sm text-slate-400 mb-6">
          Your current account role is <strong className="text-brand-amber capitalize">"{user.role}"</strong>. 
          This section is exclusively reserved for [{allowedRoles.join(', ')}].
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
}
