import React from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import '../../styles/SidebarStyles.css';

const MainLayout = ({ children, title }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#2C3E50', color: '#fff', minHeight: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 10 }}>
        <Sidebar />
      </aside>
      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{ width: '100%' }}>
          <Navbar />
          {title && (
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              {title.toLowerCase() === 'client' ? (
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: '#1E3A8A',
                    marginBottom: 20,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  CLIENT
                </h1>
              ) : (
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color:
                      title.toLowerCase() === 'vendor' ? '#27AE60'
                      : title.toLowerCase() === 'procurement' ? '#E67E22'
                      : title.toLowerCase() === 'finance' ? '#8E44AD'
                      : title.toLowerCase() === 'admin' ? '#C0392B'
                      : '#222',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  {title}
                </div>
              )}
            </div>
          )}
        </header>
        <main style={{
          flex: 1,
          background: 'linear-gradient(135deg, #f4f6fb 0%, #e9ecf4 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: 'calc(100vh - 80px)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 900,
            minWidth: 320,
            padding: '32px 24px 48px 24px',
            margin: '0 auto',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 24px 0 rgba(44,62,80,0.07)'
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
