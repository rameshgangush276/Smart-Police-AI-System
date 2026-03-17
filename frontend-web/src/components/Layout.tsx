import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '280px',
        padding: '32px'
      }}>
        {/* Header Area */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Welcome back, {user?.name?.split(' ')[0] || 'Officer'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Officer ID: {user?.officerId} • {user?.station || 'Station HQ'}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search cases, files..." 
                className="glass-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                style={{
                  padding: '10px 16px 10px 40px',
                  borderRadius: '10px',
                  width: '300px'
                }}
              />
            </div>
            
            <button className="glass" style={{ padding: '10px', borderRadius: '10px', position: 'relative' }}>
              <Bell size={20} />
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                background: 'var(--danger)',
                borderRadius: '50%',
                border: '2px solid var(--bg-main)'
              }}></div>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user?.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{user?.role}</p>
              </div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(45deg, var(--primary), var(--primary-light))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: 'white'
              }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};

export default Layout;
