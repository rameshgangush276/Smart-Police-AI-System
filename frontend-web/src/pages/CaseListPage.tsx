import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CaseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [understoodIntent, setUnderstoodIntent] = useState<string[]>([]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await api.get('/complaints/my-cases');
      setCases(response.data);
    } catch (err) {
      console.error('Failed to fetch cases', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUnderstoodIntent([]);
    try {
      let response;
      if (isAiSearch) {
        response = await api.get(`/analytics/nl-search?query=${searchQuery}`);
        setCases(response.data.results);
        setUnderstoodIntent(response.data.understoodIntent);
      } else {
        response = await api.get(`/complaints/search?q=${searchQuery}`);
        setCases(response.data);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#f59e0b20', text: '#f59e0b', icon: <Clock size={14} /> };
      case 'UNDER_INVESTIGATION': return { bg: '#3b82f620', text: '#3b82f6', icon: <AlertCircle size={14} /> };
      case 'CLOSED': return { bg: '#10b98120', text: '#10b981', icon: <CheckCircle size={14} /> };
      default: return { bg: 'rgba(255,255,255,0.05)', text: 'var(--text-secondary)', icon: <FileText size={14} /> };
    }
  };

  const filteredCases = cases.filter(c => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Case Files & Records</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Search, filter, and manage all cases assigned to your station.</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search by Complaint ID, name, or phone number..." 
            className="glass"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 16px 16px 52px',
              borderRadius: '16px',
              fontSize: '1rem',
              border: '1px solid var(--border-color)',
              color: 'white'
            }}
          />
        </form>

        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderRadius: '16px', gap: '12px' }}>
          <Search size={18} color={isAiSearch ? 'var(--primary)' : 'var(--text-secondary)'} />
          <span style={{ fontSize: '0.9rem', color: isAiSearch ? 'white' : 'var(--text-secondary)', fontWeight: isAiSearch ? '700' : '500' }}>AI Semantic Search</span>
          <button 
            onClick={() => setIsAiSearch(!isAiSearch)}
            style={{
              width: '40px',
              height: '24px',
              borderRadius: '20px',
              background: isAiSearch ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              position: 'relative',
              transition: 'all 0.3s',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '3px',
              left: isAiSearch ? '19px' : '3px',
              transition: 'all 0.3s'
            }}></div>
          </button>
        </div>

        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '6px 20px', borderRadius: '16px', gap: '12px' }}>
          <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.95rem', cursor: 'pointer', outline: 'none', height: '100%' }}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="CLOSED">Closed / Resolved</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {understoodIntent.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '24px', overflow: 'hidden' }}
          >
            <div className="glass" style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>AI UNDERSTOOD INTENT:</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {understoodIntent.map((intent, i) => (
                  <span key={i} style={{ padding: '2px 10px', background: 'var(--primary)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>
                    {intent}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <Loader2 size={48} className="animate-spin" color="var(--primary)" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence>
            {filteredCases.map((caseItem, index) => (
              <motion.div 
                key={caseItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 8, borderColor: 'var(--primary-light)' }}
                onClick={() => navigate(`/case/${caseItem.id}`)}
                className="glass"
                style={{
                  padding: '20px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  transition: 'border-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <FileText size={28} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{caseItem.complaintId}</h3>
                      {(() => {
                        const status = getStatusColor(caseItem.status);
                        return (
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '4px 10px', 
                            borderRadius: '100px', 
                            background: status.bg, 
                            color: status.text,
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}>
                            {status.icon}
                            {caseItem.status.replace(/_/g, ' ')}
                          </span>
                        );
                      })()}
                    </div>
                    <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>{caseItem.complainantName}</p>
                    
                    <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {caseItem.mobileNumber}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {caseItem.incidentLocation}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {new Date(caseItem.incidentDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Crime Category</p>
                    <p style={{ fontWeight: '700', color: 'var(--primary-light)' }}>{caseItem.crimeCategory}</p>
                  </div>
                  <ChevronRight size={24} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </motion.div>
            ))}

            {filteredCases.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>No cases found matching your criteria.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
};

export default CaseListPage;
