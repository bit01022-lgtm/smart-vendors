

import { NavLink, useNavigate } from 'react-router-dom';
import { FaUserTie, FaShoppingCart, FaUsers, FaMoneyBillWave, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import { routePreloaders } from '../routes/routePreloaders';

const menuItems = [
  { role: 'client', label: 'Client Dashboard', path: '/client', icon: <FaUserTie /> },
  { role: 'procurement', label: 'Procurement Dashboard', path: '/procurement', icon: <FaShoppingCart /> },
  { role: 'vendor', label: 'Vendor Dashboard', path: '/vendor', icon: <FaUsers /> },
  { role: 'finance', label: 'Finance Dashboard', path: '/finance', icon: <FaMoneyBillWave /> },
  { role: 'admin', label: 'Admin Dashboard', path: '/admin', icon: <FaUserShield /> },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const visibleItems = menuItems.filter((item) => item.role === profile?.role);

  const prefetchRoute = (path) => {
    const preload = routePreloaders[path];
    if (preload) {
      preload();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen w-56 flex-col bg-blue-900 text-white">
      <div className="flex items-center justify-center gap-2 px-4 py-8 text-center text-lg font-semibold tracking-wide">
        <span>Intergrated E-procurement system</span>
      </div>
      <nav className="flex flex-1 flex-col gap-2 px-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onMouseEnter={() => prefetchRoute(item.path)}
            onFocus={() => prefetchRoute(item.path)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-800 shadow-lg shadow-blue-950/40'
                  : 'hover:bg-blue-700/70'
              }`
            }
            end
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-6 pt-4">
        <button
          type="button"
          className="w-full rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
