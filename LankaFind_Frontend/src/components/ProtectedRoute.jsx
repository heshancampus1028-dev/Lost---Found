import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards pages that should only be visible to logged-in users
// Redirects to the login page if the user is not authenticated.
// Pass adminOnly to also require user.isAdmin (redirects non-admins to the home page).
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
