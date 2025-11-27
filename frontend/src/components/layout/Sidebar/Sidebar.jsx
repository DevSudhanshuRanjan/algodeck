import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  HelpCircle, 
  Settings, 
  LogOut,
  ChevronLeft,
  X,
  Code2
} from 'lucide-react';
import { useAuth } from '../../../context';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/notes', icon: FileText, label: 'Notes' },
    { path: '/questions', icon: HelpCircle, label: 'Questions' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Mobile Close Button */}
        <button className="sidebar-close" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Code2 size={24} />
          </div>
          {!isCollapsed && <span className="sidebar-logo-text">AlgoDeck</span>}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => 
                `sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`
              }
              onClick={() => window.innerWidth < 1024 && onClose()}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="sidebar-user-details">
                <span className="sidebar-user-name">{user?.name || 'User'}</span>
                <span className="sidebar-user-email">{user?.email || 'user@example.com'}</span>
              </div>
            )}
          </div>
          <button 
            className="sidebar-logout" 
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <button 
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={20} className={isCollapsed ? 'rotated' : ''} />
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
