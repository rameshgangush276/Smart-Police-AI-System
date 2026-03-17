import React from 'react';
import Layout from '../components/Layout';
import { 
  MapPin, 
  Shield, 
  Phone, 
  Calendar,
  Edit,
  BadgeCheck,
  Settings,
  Lock,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Security Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your officer credentials and station assignments.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>
          {/* Avatar & Basic Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass" style={{ padding: '32px', borderRadius: '32px', textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '30px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  fontWeight: '800',
                  color: 'white',
                  boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <button style={{
                  position: 'absolute',
                  bottom: '-5px',
                  right: '-5px',
                  background: 'var(--bg-main)',
                  padding: '8px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  color: 'var(--primary)'
                }}>
                  <Edit size={16} />
                </button>
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{user?.name || 'Officer Name'}</h2>
              <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem', marginBottom: '16px' }}>{user?.role || 'Officer'}</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <BadgeCheck size={20} color="var(--success)" />
                <span style={{ fontSize: '0.85rem' }}>Verified Personnel</span>
              </div>
            </div>

            <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings size={18} />
                Portal Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="setting-link"><Lock size={16} /> Change Password</button>
                <button className="setting-link"><Shield size={16} /> Security Keys</button>
                <button 
                  onClick={logout}
                  className="setting-link" 
                  style={{ color: 'var(--danger)', marginTop: '12px' }}
                >
                  <LogOut size={16} /> Logout Session
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Deployment Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className="info-item">
                  <div className="info-icon"><Shield size={18} /></div>
                  <div>
                    <p className="info-label">Officer ID</p>
                    <p className="info-value">{user?.officerId || 'POL-9021'}</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><MapPin size={18} /></div>
                  <div>
                    <p className="info-label">Assigned Station</p>
                    <p className="info-value">{user?.station || 'Sector 4 HQ'}</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><Calendar size={18} /></div>
                  <div>
                    <p className="info-label">Joined On</p>
                    <p className="info-value">January 12, 2024</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><Phone size={18} /></div>
                  <div>
                    <p className="info-label">Contact Primary</p>
                    <p className="info-value">+91 98765 43210</p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '16px' }}>Current Jurisdiction</h4>
                <div style={{ height: '160px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}></div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Jurisdiction map data unavailable in offline mode.</p>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '32px', borderRadius: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Activity Logs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { action: 'Login from Web Portal', time: '10 mins ago', device: 'Chrome / Windows 11' },
                  { action: 'Case #CMS-9021 Modified', time: '2 hours ago', device: 'Police Mobile Device' },
                  { action: 'Officer Stats Exported', time: '1 day ago', device: 'Station Terminal' }
                ].map((log, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none' }}>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{log.action}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.device}</p>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .setting-link {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 0.9rem;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .setting-link:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        .info-item {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .info-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          border: 1px solid var(--border-color);
        }
        .info-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 1.1rem;
          font-weight: 700;
        }
      `}</style>
    </Layout>
  );
};

export default ProfilePage;
