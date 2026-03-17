import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  FileText, 
  Plus, 
  Camera, 
  Mic, 
  Shield,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  MicOff
} from 'lucide-react';
import api from '../services/api';

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [showLegalSuggestions, setShowLegalSuggestions] = useState(false);
  const [legalSuggestions, setLegalSuggestions] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedStatement, setRecordedStatement] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [caseRes, timelineRes] = await Promise.all([
          api.get(`/complaints/${id}`),
          api.get(`/complaints/${id}/timeline`)
        ]);
        setCaseData(caseRes.data);
        setTimeline(timelineRes.data);
      } catch (err) {
        console.error('Failed to fetch case details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loader2 size={48} className="animate-spin" color="var(--primary)" />
        </div>
      </Layout>
    );
  }

  if (!caseData) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
          <h2>Case Not Found</h2>
          <button onClick={() => navigate('/search')} style={{ marginTop: '20px', color: 'var(--primary)' }}>Back to Search</button>
        </div>
      </Layout>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING': return { color: '#f59e0b', label: 'Pending Filing' };
      case 'UNDER_INVESTIGATION': return { color: '#3b82f6', label: 'Under Investigation' };
      case 'CLOSED': return { color: '#10b981', label: 'Case Closed' };
      default: return { color: 'var(--text-secondary)', label: status };
    }
  };

  const statusInfo = getStatusInfo(caseData.status);

  const handleSuggestSections = async () => {
    setAnalyzing(true);
    setShowLegalSuggestions(true);
    try {
      const response = await api.post('/legal/suggest-sections', {
        case_description: caseData.incidentDescription,
        crime_type: caseData.crimeCategory
      });
      setLegalSuggestions(response.data.suggested_sections);
    } catch (err) {
      console.error('Failed to analyze case', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateFIR = async () => {
    setGenerating(true);
    try {
      const response = await api.get(`/complaints/${caseData.id}/generate-document`, {
        responseType: 'blob'
      });
      
      // Check if we actually got a PDF
      console.log("[PDF] Response received:", response.data);
      if (response.data.type === 'application/pdf') {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `FIR_${caseData.complaintId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle case where backend might have sent error JSON as blob
        console.error('Expected PDF blob but received:', response.data.type);
        
        // Try to read the blob as text to see the error message
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result as string);
            console.error('Server error message:', errorData.message);
            alert(`Failed to generate PDF: ${errorData.message || 'Unknown server error'}`);
          } catch (e) {
            console.error('Raw error content:', reader.result);
            alert('Failed to generate PDF. The response was not a valid PDF.');
          }
        };
        reader.readAsText(response.data);
      }
    } catch (err) {
      console.error('Failed to generate FIR', err);
    } finally {
      setGenerating(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setRecordedStatement(prev => prev + ' ' + finalTranscript);
      }
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
    (window as any).currentRecognition = recognition;
  };

  const stopListening = () => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
    }
    setIsRecording(false);
  };

  const handleSaveStatement = async () => {
    if (!witnessName || !recordedStatement) return;
    try {
      await api.post(`/complaints/${id}/statements`, {
        witnessName,
        statement: recordedStatement
      });
      setShowRecordModal(false);
      setRecordedStatement('');
      setWitnessName('');
      // Refresh data
      const caseRes = await api.get(`/complaints/${id}`);
      setCaseData(caseRes.data);
    } catch (err) {
      console.error('Failed to save statement', err);
    }
  };

  return (
    <Layout>
      <button 
        onClick={() => navigate('/search')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}
      >
        <ArrowLeft size={16} />
        Back to Case List
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '2.5rem' }}>{caseData.complaintId}</h1>
            <span style={{ 
              padding: '6px 14px', 
              background: `${statusInfo.color}20`, 
              color: statusInfo.color, 
              borderRadius: '100px',
              fontSize: '0.85rem',
              fontWeight: '700',
              border: `1px solid ${statusInfo.color}40`
            }}>
              {statusInfo.label}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{caseData.crimeCategory} • Reported on {new Date(caseData.incidentDate).toLocaleDateString()}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="action-btn-outline" 
            onClick={handleGenerateFIR}
            disabled={generating}
          >
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {generating ? 'Generating...' : 'Export FIR (PDF)'}
          </button>
          <button className="action-btn-primary">
            Update Status
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Column: Details & Tabs */}
        <div>
          <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border-color)', marginBottom: '32px' }}>
            {['summary', 'evidence', 'witnesses'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '12px 0', 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'summary' && (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="glass" style={{ padding: '32px', borderRadius: '24px', marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} color="var(--primary)" />
                    Case Narrative
                  </h3>
                  <p style={{ lineHeight: '1.8', color: 'var(--text-primary)', marginBottom: '32px' }}>
                    {caseData.incidentDescription}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Complainant Details</h4>
                      <div className="detail-item">
                        <User size={16} /> <span>{caseData.complainantName} ({caseData.gender})</span>
                      </div>
                      <div className="detail-item">
                        <Phone size={16} /> <span>{caseData.mobileNumber}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={16} /> <span style={{ fontSize: '0.9rem' }}>{caseData.address}</span>
                      </div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Incident Logistics</h4>
                      <div className="detail-item">
                        <Clock size={16} /> <span>{caseData.incidentTime}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={16} /> <span>{caseData.incidentLocation}</span>
                      </div>
                      <div className="detail-item">
                        <Shield size={16} /> <span>Registered by {caseData.officer?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
                  <h3 style={{ marginBottom: '20px' }}>Investigation Clues</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                      <p style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--danger)', marginBottom: '8px', textTransform: 'uppercase' }}>Suspect Profiles</p>
                      <p style={{ fontSize: '0.95rem' }}>{caseData.suspectDetails || 'No suspects currently identified.'}</p>
                    </div>
                    <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                      <p style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase' }}>Witness Accounts</p>
                      <p style={{ fontSize: '0.95rem' }}>{caseData.witnessDetails || 'No witness details recorded.'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'evidence' && (
              <motion.div 
                key="evidence"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <button className="glass add-evidence-card">
                    <Plus size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p style={{ fontWeight: '600' }}>Add Evidence</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Photo, Video or Doc</p>
                  </button>
                  
                  {caseData.evidence?.map((item: any) => (
                    <div key={item.id} className="glass evidence-card">
                      <div className="evidence-preview">
                        {item.type === 'PHOTO' && item.url ? (
                          <img 
                            src={`http://localhost:3000${item.url}`} 
                            alt={item.description} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = ''; 
                              (e.target as any).parentElement.innerHTML = '<svg ...></svg>'; // Fallback back to icon
                            }}
                          />
                        ) : item.type === 'PHOTO' ? (
                          <Camera size={32} />
                        ) : (
                          <FileText size={32} />
                        )}
                      </div>
                      <div style={{ padding: '16px' }}>
                        <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{item.description || item.type}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(item.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'witnesses' && (
              <motion.div 
                key="witnesses"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="glass" style={{ padding: '24px', borderRadius: '24px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Recorded Statements</h3>
                    <button className="action-btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setShowRecordModal(true)}>
                      <Mic size={16} /> Record New Statement
                    </button>
                  </div>
                  
                  {caseData.statements?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {caseData.statements.map((s: any) => (
                        <div key={s.id} style={{ padding: '16px', borderLeft: '3px solid var(--primary)', background: 'rgba(255,255,255,0.02)', borderRadius: '0 12px 12px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <p style={{ fontWeight: '700' }}>{s.witnessName}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(s.recordedAt).toLocaleDateString()}</p>
                          </div>
                          <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>"{s.statement}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      <Mic size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                      <p>No witness statements recorded yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Timeline & Quick Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.1rem' }}>Case Timeline</h3>
            <div className="timeline">
              <TimelineItem 
                active={timeline.complaintRegistered} 
                label="Complaint Registered" 
                date={new Date(caseData.createdAt).toLocaleDateString()} 
                details="Initial data entered in system"
              />
              <TimelineItem 
                active={timeline.firRegistered} 
                label="FIR Status Assigned" 
                details={caseData.isFIR ? "Official FIR registered" : "Preliminary verification"}
              />
              <TimelineItem 
                active={timeline.evidenceCollected} 
                label="Evidence Processing" 
                details={`${caseData.evidence?.length || 0} items uploaded`}
              />
              <TimelineItem 
                active={timeline.witnessStatements} 
                label="Witness Interviews" 
                details={`${caseData.statements?.length || 0} statements recorded`}
              />
              <TimelineItem 
                active={timeline.arrestMade} 
                label="Final Resolution" 
                last 
                details={caseData.status === 'CLOSED' ? "Case resolved and sealed" : "Investigation active"}
              />
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Smart Tools</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="tool-btn" onClick={handleSuggestSections}>
                <Shield size={18} color="var(--primary)" />
                AI Legal Suggester
              </button>
              <button className="tool-btn" onClick={handleGenerateFIR} disabled={generating}>
                <FileText size={18} color="var(--accent)" />
                {generating ? 'Generating Secure PDF...' : 'Automated FIR Generator'}
              </button>
              <button className="tool-btn">
                <Search size={18} color="var(--info)" />
                Related Case Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Suggestions Modal */}
      <AnimatePresence>
        {showLegalSuggestions && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass"
              style={{
                width: '600px',
                maxHeight: '80vh',
                borderRadius: '32px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ padding: '32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shield size={24} color="var(--primary)" />
                    AI Legal Analysis
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Recommended BNS/IPC sections for this case</p>
                </div>
                <button onClick={() => setShowLegalSuggestions(false)} className="icon-btn"><ArrowLeft size={24} /></button>
              </div>

              <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                {analyzing ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader2 size={40} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                    <p>Analyzing Narrative Semantic Context...</p>
                  </div>
                ) : legalSuggestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {legalSuggestions.map((s, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass"
                        style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h4 style={{ color: 'var(--primary)', fontWeight: '800' }}>{s.id}</h4>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            {Math.round(s.confidence * 100)}% Match
                          </span>
                        </div>
                        <p style={{ fontWeight: '700', marginBottom: '4px' }}>{s.title}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.description}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No specific legal matches found. Please refine the incident description.</p>
                )}
              </div>

              <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                <button 
                  className="action-btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setShowLegalSuggestions(false)}
                >
                  Apply Suggested Sections
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Statement Modal */}
      <AnimatePresence>
        {showRecordModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)'
          }}>
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="glass"
              style={{ width: '500px', padding: '32px', borderRadius: '32px' }}
            >
              <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mic size={24} color="var(--primary)" />
                Voice Evidence Recording
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Witness Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={witnessName} 
                  onChange={(e) => setWitnessName(e.target.value)}
                  placeholder="Enter witness full name"
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Statement Transcription</label>
                  {isRecording && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '700', animation: 'pulse 1s infinite' }}>● Recording...</span>}
                </div>
                <textarea 
                  className="glass-input" 
                  rows={6} 
                  value={recordedStatement}
                  onChange={(e) => setRecordedStatement(e.target.value)}
                  placeholder="Record or type the witness statement here..."
                  style={{ fontSize: '1.1rem', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {!isRecording ? (
                  <button className="action-btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'var(--success)' }} onClick={startListening}>
                    <Mic size={18} /> Start Recording
                  </button>
                ) : (
                  <button className="action-btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'var(--danger)' }} onClick={stopListening}>
                    <MicOff size={18} /> Stop Recording
                  </button>
                )}
                <button className="action-btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSaveStatement} disabled={!recordedStatement || !witnessName}>
                  Save Statement
                </button>
              </div>
              <button 
                onClick={() => setShowRecordModal(false)}
                style={{ width: '100%', marginTop: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Cancel and Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          color: var(--text-primary);
          font-weight: 500;
        }
        .detail-item svg {
          color: var(--primary-light);
        }
        .action-btn-outline {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          transition: all 0.2s;
        }
        .action-btn-outline:hover {
          background: rgba(255,255,255,0.05);
          border-color: white;
        }
        .action-btn-primary {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: var(--primary);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          transition: all 0.2s;
        }
        .action-btn-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }
        .tool-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          color: white;
          font-size: 0.9rem;
          text-align: left;
          transition: all 0.2s;
        }
        .tool-btn:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: var(--primary);
        }
        .add-evidence-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          border: 2px dashed var(--border-color);
          background: transparent;
          color: white;
        }
        .add-evidence-card:hover {
          border-color: var(--primary);
          background: rgba(59, 130, 246, 0.05);
        }
        .evidence-card {
          overflow: hidden;
          border-radius: 20px;
        }
        .evidence-preview {
          height: 120px;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }
        .timeline {
          display: flex;
          flex-direction: column;
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

const TimelineItem = ({ active, label, date, details, last }: { active: boolean; label: string; date?: string; details?: string; last?: boolean }) => (
  <div style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: last ? 0 : '32px' }}>
    {!last && (
      <div style={{ 
        position: 'absolute', 
        left: '11px', 
        top: '24px', 
        bottom: 0, 
        width: '2px', 
        background: active ? 'linear-gradient(to bottom, var(--primary), var(--primary-light))' : 'var(--border-color)',
        opacity: active ? 0.6 : 0.2
      }}></div>
    )}
    <div style={{ 
      width: '24px', 
      height: '24px', 
      borderRadius: '50%', 
      background: active ? 'var(--primary)' : 'transparent', 
      border: `2px solid ${active ? 'var(--primary)' : 'var(--border-color)'}`,
      boxShadow: active ? '0 0 10px var(--primary)' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
      color: 'white',
      transition: 'all 0.3s ease'
    }}>
      {active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle size={14} /></motion.div>}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontWeight: '700', fontSize: '0.95rem', color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</p>
      {date && <p style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginTop: '2px' }}>{date}</p>}
      {details && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{details}</p>}
    </div>
  </div>
);

export default CaseDetailPage;
