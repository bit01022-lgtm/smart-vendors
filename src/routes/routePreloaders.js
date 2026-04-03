export const routePreloaders = {
  '/login': () => import('../pages/Login'),
  '/signup': () => import('../pages/Signup'),
  '/client': () => import('../pages/client/ClientDashboard'),
  '/procurement': () => import('../pages/procurement/ProcurementDashboard'),
  '/vendor': () => import('../pages/vendor/VendorDashboard'),
  '/finance': () => import('../pages/finance/FinanceDashboard'),
  '/admin': () => import('../pages/admin/AdminDashboard'),
};
