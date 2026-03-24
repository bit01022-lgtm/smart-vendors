

import { NavLink } from 'react-router-dom';
import { FaUserTie, FaShoppingCart, FaUsers, FaMoneyBillWave, FaUserShield } from 'react-icons/fa';
import '../styles/SidebarStyles.css';

const menuItems = [
  { label: 'Client Dashboard', path: '/client', icon: <FaUserTie /> },
  { label: 'Procurement Dashboard', path: '/procurement', icon: <FaShoppingCart /> },
  { label: 'Vendor Dashboard', path: '/vendor', icon: <FaUsers /> },
  { label: 'Finance Dashboard', path: '/finance', icon: <FaMoneyBillWave /> },
  { label: 'Admin Dashboard', path: '/admin', icon: <FaUserShield /> },
];

const Sidebar = () => {
  return (
    <div className="sv-sidebar">
      <div className="sv-sidebar-header">
        <span>Smart Vendors</span>
      </div>
      <nav className="sv-sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
    </div>
  );
};

export default Sidebar;
