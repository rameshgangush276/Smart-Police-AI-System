import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, 
  Search, 
  Book, 
  ExternalLink, 
  Info,
  ChevronRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Bookmark
} from 'lucide-react';

const legalSections = [
  {
    id: '1',
    category: 'Theft & Robbery',
    sections: [
      { code: 'IPC 378', title: 'Theft', punishment: '3 years imprisonment or fine, or both.', details: 'Intending to take any movable property out of the possession of any person ohne evidence.' },
      { code: 'BNS 303', title: 'Theft (New)', punishment: '3 years imprisonment or fine, or both.', details: 'Replaced IPC 378 with expanded definitions for digital assets.' },
      { code: 'IPC 392', title: 'Robbery', punishment: 'Rigorous imprisonment up to 10 years and fine.', details: 'Theft is robbery if the offender causes fear of instant death or hurt.' }
    ]
  },
  {
    id: '2',
    category: 'Assault & Hurt',
    sections: [
      { code: 'IPC 323', title: 'Voluntarily Causing Hurt', punishment: '1 year imprisonment or ₹1000 fine.', details: 'Whoever does any act with the intention of thereby causing hurt to any person.' },
      { code: 'IPC 354', title: 'Assault to Outrage Modesty', punishment: '1 to 5 years imprisonment and fine.', details: 'Criminal force used against a woman with intent to outrage her modesty.' }
    ]
  },
  {
    id: '3',
    category: 'Cyber Crime',
    sections: [
      { code: 'IT Act 66D', title: 'Cheating by Personation', punishment: '3 years imprisonment and ₹1 lakh fine.', details: 'Using computer resource to cheat by personating.' },
      { code: 'IT Act 66E', title: 'Violation of Privacy', punishment: '3 years imprisonment or ₹2 lakh fine.', details: 'Capturing or publishing private images without consent.' }
    ]
  }
];

const LegalCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(legalSections[0]);

  const filteredCategories = legalSections.filter(cat => 
    cat.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.sections.some(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Legal Guidance Center</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Reference IPC, BNS, and IT Act sections for accurate case filing.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px', alignItems: 'flex-start' }}>
        {/* Sidebar: Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search sections..." 
              className="glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 48px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                border: '1px solid var(--border-color)',
                color: 'white'
              }}
            />
          </div>

          <div className="glass" style={{ padding: '12px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', padding: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Crime Categories</h3>
            {filteredCategories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: selectedCategory.id === cat.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: selectedCategory.id === cat.id ? 'var(--primary)' : 'var(--text-primary)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Bookmark size={16} />
                  <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{cat.category}</span>
                </div>
                <ChevronRight size={14} style={{ opacity: selectedCategory.id === cat.id ? 1 : 0 }} />
              </button>
            ))}
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--primary)' }}>
              <Info size={18} />
              <h4 style={{ fontSize: '1rem' }}>SOP Reminder</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Always cross-verify IPC sections with the latest Bharatiya Nyaya Sanhita (BNS) updates before final FIR submission.
            </p>
          </div>
        </div>

        {/* Main Content: Section Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Scale size={24} color="var(--primary)" />
                <h2 style={{ fontSize: '1.5rem' }}>{selectedCategory.category} Reference</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedCategory.sections.map((section, idx) => (
                  <div key={idx} className="glass section-card" style={{ padding: '24px', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          background: 'var(--primary)', 
                          color: 'white', 
                          fontSize: '0.75rem', 
                          fontWeight: '800',
                          marginBottom: '8px',
                          display: 'inline-block'
                        }}>
                          {section.code}
                        </span>
                        <h3 style={{ fontSize: '1.25rem' }}>{section.title}</h3>
                      </div>
                      <button className="icon-btn-circle"><ExternalLink size={18} /></button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertTriangle size={14} color="var(--accent)" /> Punishment
                        </p>
                        <p style={{ fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>{section.punishment}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Book size={14} color="var(--primary)" /> Legal Definition
                        </p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6', fontStyle: 'italic' }}>"{section.details}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
            <button className="tool-card">
              <ShieldCheck size={24} color="var(--success)" />
              <div>
                <p style={{ fontWeight: '700' }}>Legal AI Chat</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Get instant legal advice</p>
              </div>
            </button>
            <button className="tool-card">
              <FileText size={24} color="var(--primary)" />
              <div>
                <p style={{ fontWeight: '700' }}>Draft FIR Templates</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Standardized protocols</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .section-card {
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }
        .section-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.2);
        }
        .icon-btn-circle {
          padding: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .icon-btn-circle:hover {
          background: var(--primary);
          color: white;
        }
        .tool-card {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          text-align: left;
          transition: all 0.2s;
        }
        .tool-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--primary);
        }
      `}</style>
    </Layout>
  );
};

export default LegalCenterPage;
