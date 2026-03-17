import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  Search, 
  FileText, 
  MapPin, 
  ShieldCheck, 
  Scale, 
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Register Case', path: '/register', icon: <FilePlus size={20} /> },
    { name: 'Case Search', path: '/search', icon: <Search size={20} /> },
    { name: 'Document Hub', path: '/documents', icon: <FileText size={20} /> },
    { name: 'Hotspot Map', path: '/map', icon: <MapPin size={20} /> },
    { name: 'Supervision', path: '/supervision', icon: <ShieldCheck size={20} />, role: 'SUPERVISOR' },
    { name: 'Legal Center', path: '/legal', icon: <Scale size={20} /> },
    { name: 'My Profile', path: '/profile', icon: <User size={20} /> },
  ];

  const filteredItems = menuItems.filter(item => !item.role || item.role === user?.role);

  return (
    <div className="glass" style={{
      width: '280px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      borderRight: '1px solid var(--border-color)',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: 'var(--primary)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldCheck size={20} color="white" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Smart Police</h2>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            {item.icon}
            <span style={{ fontWeight: '500' }}>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <button 
        onClick={logout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          color: 'var(--danger)',
          width: '100%',
          marginTop: 'auto'
        }}
        className="logout-link"
      >
        <LogOut size={20} />
        <span style={{ fontWeight: '500' }}>Sign Out</span>
      </button>

      <style>{`
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        .nav-link.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--primary);
        }
        .logout-link:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
