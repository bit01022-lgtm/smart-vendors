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
    <nav className="flex w-full items-center justify-between bg-slate-900 px-8 py-4 text-white shadow">
      <span className="text-xl font-bold tracking-wide">Intergrated E-procurement system</span>
      {currentUser ? (
        <div className="flex items-center gap-4 text-sm">
          <span>{profile?.username || currentUser.email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-white/35 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
