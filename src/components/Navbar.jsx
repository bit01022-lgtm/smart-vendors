import React from 'react';

const Navbar = () => {
  return (
    <nav style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', background: '#2C3E50', color: '#fff', boxShadow: '0 2px 8px #f0f0f0' }}>
      <span style={{ fontSize: 22, fontWeight: 600, color: '#fff' }}>Smart Vendors System</span>
      <span style={{ color: '#fff', fontWeight: 500 }}>User</span>
    </nav>
  );
};

export default Navbar;
