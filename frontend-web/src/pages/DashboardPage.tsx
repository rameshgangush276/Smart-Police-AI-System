import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass" 
    style={{ padding: '24px', borderRadius: '20px', flex: 1 }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{
        padding: '12px',
        borderRadius: '12px',
        background: `${color}20`,
        color: color
      }}>
        {icon}
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.8rem' }}>
          <ArrowUpRight size={14} />
          {trend}%
        </div>
      )}
    </div>
    <h3 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{value}</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{title}</p>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    investigating: 0,
    closed: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/analytics/officer-stats');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
        // Fallback or handle error
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Total Cases" value={stats.total} icon={<FileText />} color="#3b82f6" trend="12" />
        <StatCard title="Active Enquiries" value={stats.pending} icon={<Clock />} color="#f59e0b" trend="5" />
        <StatCard title="Under Investigation" value={stats.investigating} icon={<AlertTriangle />} color="#ef4444" />
        <StatCard title="Cases Resolved" value={stats.closed} icon={<CheckCircle />} color="#10b981" trend="8" />
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Recent Activity Table */}
        <div className="glass" style={{ flex: 2, padding: '24px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Recent Case Filings</h2>
            <button 
              onClick={() => navigate('/search')}
              style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}
            >
              View All
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 0' }}>Case ID</th>
                <th>Complainant</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {/* This would normally be mapped from data */}
              <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px 0', fontWeight: '600' }}>#CMS-9021</td>
                <td>Ramesh Kumar</td>
                <td>Public Nuisance</td>
                <td><span style={{ padding: '4px 8px', borderRadius: '6px', background: '#f59e0b20', color: '#f59e0b', fontSize: '0.75rem' }}>Pending</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Oct 12, 2026</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px 0', fontWeight: '600' }}>#CMS-9020</td>
                <td>Anita Sharma</td>
                <td>Cyber Fraud</td>
                <td><span style={{ padding: '4px 8px', borderRadius: '6px', background: '#3b82f620', color: '#3b82f6', fontSize: '0.75rem' }}>Active</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Oct 11, 2026</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quick Actions Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(30, 41, 59, 0.7))' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="action-btn" onClick={() => navigate('/register')}>
                <Plus size={20} />
                New Case
              </button>
              <button className="action-btn" onClick={() => navigate('/search')}>
                <Search size={20} />
                Search
              </button>
              <button className="action-btn">
                <Users size={20} />
                Witness
              </button>
              <button className="action-btn">
                <AlertTriangle size={20} />
                Emergency
              </button>
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Hotspot Alerts</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)' }}>
                <div style={{ width: '4px', background: 'var(--danger)', borderRadius: '2px' }}></div>
                <div>
                  <p style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Sector 12: High Alert</p>
                  <p>Increase in vehicle thefts reported in last 24h.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          color: white;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--primary);
          transform: translateY(-2px);
        }
      `}</style>
    </Layout>
  );
};

export default DashboardPage;
