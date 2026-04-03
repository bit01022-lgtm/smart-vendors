

import { NavLink, useNavigate } from 'react-router-dom';
import { FaUserTie, FaShoppingCart, FaUsers, FaMoneyBillWave, FaUserShield } from 'react-icons/fa';
import '../styles/SidebarStyles.css';
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
    <div className="sv-sidebar">
      <div className="sv-sidebar-header">
        <span>Intergrated E-procurement system</span>
      </div>
      <nav className="sv-sidebar-menu">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onMouseEnter={() => prefetchRoute(item.path)}
            onFocus={() => prefetchRoute(item.path)}
            className={({ isActive }) =>
              isActive ? 'sv-sidebar-link active' : 'sv-sidebar-link'
            }
            end
          >
            <span className="sv-sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sv-sidebar-footer">
        <button type="button" className="sv-sidebar-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
