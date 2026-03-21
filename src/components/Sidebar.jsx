
import { NavLink } from 'react-router-dom';
import '../styles/SidebarStyles.css';

const menuItems = [
  { label: 'Client Dashboard', path: '/client' },
  { label: 'Procurement Dashboard', path: '/procurement' },
  { label: 'Vendor Dashboard', path: '/vendor' },
  { label: 'Finance Dashboard', path: '/finance' },
  { label: 'Admin Dashboard', path: '/admin' },
];

const Sidebar = () => {
  return (
    <div className="sv-sidebar">
      <div className="sv-sidebar-header">Smart Vendors</div>
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
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
