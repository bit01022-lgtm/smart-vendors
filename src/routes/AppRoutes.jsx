import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { GuestRoute, ProtectedRoute } from '../components/auth/RouteGuards';
import { routePreloaders } from './routePreloaders';

const Login = lazy(routePreloaders['/login']);
const Signup = lazy(routePreloaders['/signup']);
const ClientDashboard = lazy(routePreloaders['/client']);
const ProcurementDashboard = lazy(routePreloaders['/procurement']);
const VendorDashboard = lazy(routePreloaders['/vendor']);
const FinanceDashboard = lazy(routePreloaders['/finance']);
const AdminDashboard = lazy(routePreloaders['/admin']);

const RouteLoadingFallback = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(180deg, #f7f9fc 0%, #eef2f8 100%)',
    }}
  >
    <div
      style={{
        width: 'min(720px, 92vw)',
        padding: '24px',
        borderRadius: '14px',
        background: '#ffffff',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
      }}
    >
      <div
        style={{
          height: '18px',
          width: '35%',
          borderRadius: '8px',
          background: '#e2e8f0',
          marginBottom: '18px',
        }}
      />
      <div
        style={{
          height: '10px',
          width: '90%',
          borderRadius: '6px',
          background: '#e2e8f0',
          marginBottom: '10px',
        }}
      />
      <div
        style={{
          height: '10px',
          width: '80%',
          borderRadius: '6px',
          background: '#e2e8f0',
          marginBottom: '20px',
        }}
      />
      <div
        style={{
          height: '220px',
          borderRadius: '12px',
          background: '#e2e8f0',
        }}
      />
    </div>
  </div>
);

const AppRoutes = () => (
  <BrowserRouter>
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/client" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
        {/* <Route path="/client/payments" element={<Payments />} /> */}
        <Route path="/procurement" element={<ProtectedRoute allowedRoles={['procurement']}><ProcurementDashboard /></ProtectedRoute>} />
        <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute allowedRoles={['finance']}><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRoutes;
