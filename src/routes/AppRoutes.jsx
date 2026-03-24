import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientDashboard from '../pages/client/ClientDashboard';
// import Payments from '../pages/client/Payments';
import ProcurementDashboard from '../pages/procurement/ProcurementDashboard';
import VendorDashboard from '../pages/vendor/VendorDashboard';
import FinanceDashboard from '../pages/finance/FinanceDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/client" replace />} />
      <Route path="/client" element={<ClientDashboard />} />
      {/* <Route path="/client/payments" element={<Payments />} /> */}
      <Route path="/procurement" element={<ProcurementDashboard />} />
      <Route path="/vendor" element={<VendorDashboard />} />
      <Route path="/finance" element={<FinanceDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
