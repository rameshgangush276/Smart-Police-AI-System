import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Download, 
  Printer, 
  Shield,
  Loader2
} from 'lucide-react';
import api from '../services/api';

const DocumentHubPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [docContent, setDocContent] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const response = await api.get('/complaints/my-cases');
        setDocuments(response.data);
      } catch (err) {
        console.error('Failed to fetch cases for documents', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handlePreview = async (id: string) => {
    setGenerating(true);
    try {
      const response = await api.get(`/complaints/${id}/generate-document`, {
        responseType: 'blob'
      });
      
      if (response.data.type === 'application/pdf') {
        const url = window.URL.createObjectURL(response.data);
        setDocContent(url);
        setSelectedDoc(documents.find(d => d.id === id));
      } else {
        console.error('Failed to generate PDF: Received non-pdf blob', response.data.type);
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result as string);
            alert(`Could not generate PDF: ${errorData.message}`);
          } catch (e) {
            alert('Could not generate PDF. Please check server logs.');
          }
        };
        reader.readAsText(response.data);
      }
    } catch (err) {
      console.error('Failed to generate PDF document', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!docContent || !selectedDoc) return;
    const link = document.createElement('a');
    link.href = docContent;
    link.setAttribute('download', `FIR_${selectedDoc.complaintId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    if (!docContent) return;
    const printWindow = window.open(docContent);
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.complainantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Official Document Hub</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Generate, view, and print official FIR drafts and legal reports.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Left: Case List */}
        <div>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by Complaint ID or Name..." 
              className="glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 14px 14px 48px',
                borderRadius: '16px',
                fontSize: '0.95rem',
                border: '1px solid var(--border-color)',
                color: 'white'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>
            ) : filteredDocs.map((doc) => (
              <motion.div 
                key={doc.id}
                whileHover={{ x: 5 }}
                onClick={() => handlePreview(doc.id)}
                className="glass"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  border: selectedDoc?.id === doc.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: selectedDoc?.id === doc.id ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>{doc.complaintId}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{doc.complainantName}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{new Date(doc.createdAt).toLocaleDateString()}</p>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    background: doc.isFIR ? '#10b98120' : '#f59e0b20',
                    color: doc.isFIR ? '#10b981' : '#f59e0b'
                  }}>
                    {doc.isFIR ? 'FIR Filed' : 'Pending FIR'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Document Preview */}
        <div style={{ position: 'sticky', top: '32px' }}>
          <div className="glass" style={{ minHeight: '680px', borderRadius: '24px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {!selectedDoc ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <FileText size={80} style={{ marginBottom: '20px' }} />
                <p style={{ fontSize: '1.2rem' }}>Select a case to preview document</p>
              </div>
            ) : generating ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" color="var(--primary)" />
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Generating Secure Document...</p>
              </div>
            ) : (
              <>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shield size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1rem' }}>FIR Draft Preview</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-btn" onClick={handlePrint}><Printer size={18} /></button>
                    <button className="icon-btn" onClick={handleDownload}><Download size={18} /></button>
                  </div>
                </div>
                
                <div style={{ flex: 1, margin: '20px', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
                  <iframe 
                    src={docContent} 
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="FIR Preview"
                  />
                </div>
                
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <p>Certified Digital Record • Generated by IP Address {window.location.hostname}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .icon-btn {
          padding: 8px;
          border-radius: 8px;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .icon-btn:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
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

export default DocumentHubPage;
