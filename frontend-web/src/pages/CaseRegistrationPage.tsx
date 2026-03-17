import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar, 
  Shield, 
  FileText, 
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  Upload,
  BrainCircuit
} from 'lucide-react';
import api from '../services/api';

const CaseRegistrationPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    complainantName: '',
    fatherHusbandName: '',
    mobileNumber: '',
    address: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    crimeCategory: 'Theft',
    incidentDescription: '',
    suspectDetails: '',
    witnessDetails: '',
    gender: 'Male'
  });

  const categories = [
    'Theft', 'Robbery', 'Burglary', 'Assault', 'Cyber Crime', 
    'Narcotics', 'White Collar Crime', 'Public Nuisance', 'Missing Person', 'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/complaints/register', formData);
      setSuccess(true);
      // Reset form on success
      setFormData({
        complainantName: '',
        fatherHusbandName: '',
        mobileNumber: '',
        address: '',
        incidentDate: '',
        incidentTime: '',
        incidentLocation: '',
        crimeCategory: 'Theft',
        incidentDescription: '',
        suspectDetails: '',
        witnessDetails: '',
        gender: 'Male'
      });
    } finally {
      setLoading(false);
    }
  };

  const startListening = (fieldName: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(fieldName);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({
        ...prev,
        [fieldName]: (prev as any)[fieldName] ? (prev as any)[fieldName] + ' ' + transcript : transcript
      }));
      setIsListening(null);
    };

    recognition.onerror = () => {
      setIsListening(null);
    };

    recognition.onend = () => {
      setIsListening(null);
    };

    recognition.start();
  };

  const handleAutoExtract = async () => {
    if (!formData.incidentDescription || formData.incidentDescription.length < 10) {
      alert("Please provide a more detailed incident description first.");
      return;
    }
    
    setExtracting(true);
    try {
      const response = await api.post('/ai/auto-extract', { text: formData.incidentDescription });
      const data = response.data.extracted_data;
      
      setFormData(prev => ({
        ...prev,
        complainantName: data.complainantName || prev.complainantName,
        mobileNumber: data.mobileNumber || prev.mobileNumber,
        incidentDate: data.incidentDate || prev.incidentDate,
        incidentLocation: data.incidentLocation || prev.incidentLocation,
        crimeCategory: data.crimeCategory || prev.crimeCategory
      }));
      
      alert(response.data.message || "AI Extraction successful!");
    } catch (err) {
      console.error("AI Extraction failed", err);
    } finally {
      setExtracting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const response = await api.post('/ai/ocr-process', fd);
      setFormData(prev => ({
        ...prev,
        incidentDescription: response.data.extracted_text
      }));
      alert("Document read successfully! You can now click 'Magic Extract' to fill the form.");
    } catch (err) {
      console.error("OCR Failed", err);
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Register New Case</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Enter all details accurately for official record filing.</p>
        </div>

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass"
            style={{ 
              padding: '20px', 
              borderRadius: '16px', 
              marginBottom: '32px', 
              background: 'rgba(16, 185, 129, 0.1)', 
              borderColor: 'var(--success)', 
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: 'var(--success)'
            }}
          >
            <CheckCircle size={24} />
            <div>
              <p style={{ fontWeight: '700' }}>Case Registered Successfully!</p>
              <p style={{ fontSize: '0.9rem' }}>The case has been added to the system and assigned a unique Complaint ID.</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass"
            style={{ 
              padding: '20px', 
              borderRadius: '16px', 
              marginBottom: '32px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              borderColor: 'var(--danger)', 
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: 'var(--danger)'
            }}
          >
            <XCircle size={24} />
            <p style={{ fontWeight: '600' }}>{error}</p>
          </motion.div>
        )}

        {/* AI Intelligence Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div className="glass ai-tool-card" style={{ padding: '24px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
            <div className="ai-glow"></div>
            <Mic size={24} color="var(--primary)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Voice Intake</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Speak the whole complaint at once.</p>
            <button 
              type="button" 
              className={isListening === 'incidentDescription' ? 'ai-btn-active' : 'ai-btn'}
              onClick={() => startListening('incidentDescription')}
            >
              {isListening === 'incidentDescription' ? 'Listening...' : 'Start Recording'}
            </button>
          </div>

          <div className="glass ai-tool-card" style={{ padding: '24px', borderRadius: '24px' }}>
            <Upload size={24} color="var(--info)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Document OCR</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Upload written reports or ID cards.</p>
            <label className="ai-btn" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
              {ocrLoading ? <Loader2 className="animate-spin" size={16} /> : 'Select Document'}
              <input type="file" hidden onChange={handleFileUpload} accept="image/*,.pdf" />
            </label>
          </div>

          <div className="glass ai-tool-card" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--primary-light)' }}>
            <BrainCircuit size={24} color="var(--success)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Magic Extract</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Auto-fill form using AI analysis.</p>
            <button 
              type="button" 
              className="ai-btn-primary" 
              onClick={handleAutoExtract}
              disabled={extracting}
            >
              {extracting ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={14} /> Analyze & Fill</>}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass" style={{ padding: '40px', borderRadius: '24px' }}>
          {/* Section 1: Complainant Details */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: 'var(--primary)' }}>
              <User size={20} />
              <h2 style={{ fontSize: '1.25rem' }}>Complainant Information</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label>Complainant Full Name</label>
                <input 
                  type="text" 
                  name="complainantName" 
                  value={formData.complainantName} 
                  onChange={handleChange} 
                  required 
                  className="glass-input" 
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="form-group">
                <label>Father's / Husband's Name</label>
                <input 
                  type="text" 
                  name="fatherHusbandName" 
                  value={formData.fatherHusbandName} 
                  onChange={handleChange} 
                  className="glass-input" 
                  placeholder="e.g. Richard Doe"
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="tel" 
                    name="mobileNumber" 
                    value={formData.mobileNumber} 
                    onChange={handleChange} 
                    required 
                    className="glass-input" 
                    style={{ paddingLeft: '40px' }}
                    placeholder="10-digit number"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="glass-input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Full Address</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  required 
                  className="glass-input" 
                  rows={2}
                  placeholder="Residential address of the complainant"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Incident Details */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: 'var(--primary)' }}>
              <Shield size={20} />
              <h2 style={{ fontSize: '1.25rem' }}>Incident Information</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label>Incident Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="date" 
                    name="incidentDate" 
                    value={formData.incidentDate} 
                    onChange={handleChange} 
                    required 
                    className="glass-input" 
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Incident Time</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="time" 
                    name="incidentTime" 
                    value={formData.incidentTime} 
                    onChange={handleChange} 
                    className="glass-input" 
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Incident Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    name="incidentLocation" 
                    value={formData.incidentLocation} 
                    onChange={handleChange} 
                    required 
                    className="glass-input" 
                    style={{ paddingLeft: '40px' }}
                    placeholder="e.g. Sector 4 Market"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Crime Category</label>
                <select name="crimeCategory" value={formData.crimeCategory} onChange={handleChange} className="glass-input">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ marginBottom: 0 }}>Incident Description</label>
                  <button 
                    type="button"
                    onClick={() => startListening('incidentDescription')}
                    style={{ 
                      padding: '4px 12px', 
                      borderRadius: '100px', 
                      background: isListening === 'incidentDescription' ? 'var(--danger)' : 'rgba(16, 185, 129, 0.1)', 
                      color: isListening === 'incidentDescription' ? 'white' : 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      animation: isListening === 'incidentDescription' ? 'pulse 1.5s infinite' : 'none'
                    }}
                  >
                    {isListening === 'incidentDescription' ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening === 'incidentDescription' ? 'Stop Listening' : 'Dictate (Voice)'}
                  </button>
                </div>
                <textarea 
                  name="incidentDescription" 
                  value={formData.incidentDescription} 
                  onChange={handleChange} 
                  required 
                  className="glass-input" 
                  rows={4}
                  placeholder="Provide detailed description of the event..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Investigation Clues */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: 'var(--primary)' }}>
              <Users size={20} />
              <h2 style={{ fontSize: '1.25rem' }}>Initial Investigation Details</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ marginBottom: 0 }}>Suspect Details (if any)</label>
                  <button 
                    type="button"
                    onClick={() => startListening('suspectDetails')}
                    style={{ padding: '4px 8px', borderRadius: '8px', background: isListening === 'suspectDetails' ? 'var(--danger)' : 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    {isListening === 'suspectDetails' ? <MicOff size={14} /> : <Mic size={14} />}
                  </button>
                </div>
                <textarea 
                  name="suspectDetails" 
                  value={formData.suspectDetails} 
                  onChange={handleChange} 
                  className="glass-input" 
                  rows={3}
                  placeholder="Name, appearance, vehicle details..."
                />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ marginBottom: 0 }}>Witness Details (if any)</label>
                  <button 
                    type="button"
                    onClick={() => startListening('witnessDetails')}
                    style={{ padding: '4px 8px', borderRadius: '8px', background: isListening === 'witnessDetails' ? 'var(--danger)' : 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    {isListening === 'witnessDetails' ? <MicOff size={14} /> : <Mic size={14} />}
                  </button>
                </div>
                <textarea 
                  name="witnessDetails" 
                  value={formData.witnessDetails} 
                  onChange={handleChange} 
                  className="glass-input" 
                  rows={3}
                  placeholder="Names and contact of witnesses..."
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '20px',
              transition: 'all 0.2s'
            }}
            className="submit-btn"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : (
              <>
                <FileText size={22} />
                Register Case & Generate Complaint ID
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .form-group input, .form-group select, .form-group textarea {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 1rem;
          width: 100%;
        }
        .submit-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
        }
        .submit-btn:active {
          transform: translateY(0);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .ai-tool-card {
          transition: all 0.3s;
          border: 1px solid var(--border-color);
        }
        .ai-tool-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1);
        }
        .ai-btn {
          width: 100%;
          padding: 8px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          color: white;
          border: 1px solid var(--border-color);
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .ai-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .ai-btn-active {
          width: 100%;
          padding: 8px;
          border-radius: 10px;
          background: var(--danger);
          color: white;
          border: none;
          font-size: 0.85rem;
          font-weight: 600;
          animation: pulse 1.5s infinite;
        }
        .ai-btn-primary {
          width: 100%;
          padding: 8px;
          border-radius: 10px;
          background: var(--primary);
          color: white;
          border: none;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .ai-btn-primary:hover {
          background: var(--primary-dark);
          transform: scale(1.02);
        }
        .ai-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }
      `}</style>
    </Layout>
  );
};

export default CaseRegistrationPage;
