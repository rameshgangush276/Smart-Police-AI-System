import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
  Users, 
  AlertCircle, 
  Clock, 
  BarChart3,
  TrendingUp,
  MoreVertical,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const TeamStatCard = ({ name, role, solved, pending, active }: any) => (
  <div className="glass" style={{ padding: '20px', borderRadius: '20px', marginBottom: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
          {name.charAt(0)}
        </div>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{name}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{role}</p>
        </div>
      </div>
      <button className="icon-btn"><MoreVertical size={16} /></button>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
      <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '8px', borderRadius: '8px' }}>
        <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--success)' }}>{solved}</p>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Solved</p>
      </div>
      <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '8px', borderRadius: '8px' }}>
        <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent)' }}>{pending}</p>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Pending</p>
      </div>
      <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '8px', borderRadius: '8px' }}>
        <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)' }}>{active}</p>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Active</p>
      </div>
    </div>
  </div>
);

const SupervisorDashboardPage: React.FC = () => {
  const [overview] = useState({
    totalTeamCases: 142,
    avgResolutionTime: '4.2 Days',
    overdueCases: 12,
    efficiency: '94%'
  });

  useEffect(() => {
    // Analytics initialization could go here
  }, []);

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Strategic Supervision</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Team performance metrics, case approvals, and station-wide analytics.</p>
      </div>

      {/* High Level Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'Team Load', value: overview.totalTeamCases, icon: <Users />, color: '#3b82f6', change: '+8%', positive: false },
          { label: 'Resolution Rate', value: overview.efficiency, icon: <TrendingUp />, color: '#10b981', change: '+2.4%', positive: true },
          { label: 'Avg. Closing', value: overview.avgResolutionTime, icon: <BarChart3 />, color: '#f59e0b', change: '-1.2 Days', positive: true },
          { label: 'Critical Overdue', value: overview.overdueCases, icon: <AlertCircle />, color: '#ef4444', change: '+2', positive: false },
        ].map((stat, i) => (
          <div key={i} className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: stat.positive ? 'var(--success)' : 'var(--danger)' }}>
                {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{stat.value}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        {/* Verification Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color="var(--accent)" />
                Approval Verification Queue
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>4 items pending</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'CMS-8012', type: 'FIR Approval', officer: 'Vikram Singh', priority: 'High', time: '2h ago' },
                { id: 'CMS-8015', type: 'Evidence Disposal', officer: 'Anita Sen', priority: 'Medium', time: '5h ago' },
                { id: 'CMS-8018', type: 'Final Report', officer: 'Rajesh K', priority: 'High', time: '1d ago' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '4px', height: '32px', borderRadius: '2px', background: item.priority === 'High' ? 'var(--danger)' : 'var(--accent)' }}></div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.type} <span style={{ color: 'var(--text-secondary)', fontWeight: '400', fontSize: '0.85rem' }}>#{item.id}</span></p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assigned to {item.officer}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="action-link" style={{ color: 'var(--success)' }}>Verify</button>
                    <button className="action-link" style={{ color: 'var(--text-secondary)' }}>Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="var(--primary)" />
              Weekly Station Load
            </h2>
            <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px' }}>
              {[60, 45, 80, 55, 90, 70, 40].map((h, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '40px' }}>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    style={{ width: '100%', background: 'linear-gradient(to top, var(--primary), var(--primary-light))', borderRadius: '6px' }}
                  ></motion.div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{['M','T','W','T','F','S','S'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Activity */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={18} />
            Command Team
          </h2>
          <TeamStatCard name="Vikram Singh" role="Sub-Inspector" solved={14} pending={5} active={2} />
          <TeamStatCard name="Anita Sen" role="Investigator" solved={9} pending={3} active={4} />
          <TeamStatCard name="Rajesh K" role="Senior Officer" solved={22} pending={2} active={1} />
          
          <button className="glass" style={{ width: '100%', padding: '16px', borderRadius: '16px', color: 'var(--primary)', fontWeight: '600' }}>
            Manage Station Personnel
          </button>
        </div>
      </div>

      <style>{`
        .icon-btn {
          padding: 8px;
          border-radius: 8px;
          color: var(--text-secondary);
        }
        .icon-btn:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        .action-link {
          font-size: 0.85rem;
          font-weight: 700;
        }
        .action-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </Layout>
  );
};

export default SupervisorDashboardPage;
