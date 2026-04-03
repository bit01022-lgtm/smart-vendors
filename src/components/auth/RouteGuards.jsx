import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

const rolePathMap = {
  admin: '/admin',
  client: '/client',
  procurement: '/procurement',
  vendor: '/vendor',
  finance: '/finance',
};

function LoadingScreen() {
  return <div style={{ padding: '2rem' }}>Loading...</div>;
}

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If auth exists but profile is missing, keep user on login page instead of redirect loops.
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(profile?.role)) {
    const fallbackPath = rolePathMap[profile?.role] || '/login';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { currentUser, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (currentUser) {
    if (!profile) {
      return children;
    }

    const redirectPath = rolePathMap[profile?.role] || '/client';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
