import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to their dashboard
  if (isAuthenticated && user) {
    const userRole = user.role || 'pm'; // Default to pm if no role
    const dashboardRoute = userRole === 'pm' ? '/pm-dashboard' :
                          userRole === 'employee' ? '/employee-dashboard' :
                          userRole === 'customer' ? '/customer-dashboard' : '/pm-dashboard';
    
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
};

export default PublicRoute;
