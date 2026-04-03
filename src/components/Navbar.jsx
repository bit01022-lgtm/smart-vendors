import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-gray-900 text-white shadow">
      <span className="text-xl font-bold tracking-wide">Intergrated E-procurement system</span>
      {currentUser ? (
        <div className="flex items-center gap-4 text-sm">
          <span>{profile?.username || currentUser.email}</span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.35)',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
