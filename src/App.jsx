import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { clearLegacyLocalStorage } from './utils/clearLegacyLocalStorage';

function App() {
  useEffect(() => {
    clearLegacyLocalStorage();
  }, []);

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
