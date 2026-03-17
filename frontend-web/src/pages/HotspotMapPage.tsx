import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Layers, 
  Navigation,
  Loader2,
  Filter,
  ShieldAlert
} from 'lucide-react';
import api from '../services/api';

const HotspotMapPage: React.FC = () => {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState('CRIME_DENSITY');

  useEffect(() => {
    const fetchHotspots = async () => {
      setLoading(true);
      try {
        const response = await api.get('/analytics/hotspots');
        if (response.data.success) {
          setHotspots(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch hotspots', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);

  useEffect(() => {
    const iframe = document.querySelector('iframe[title="Real Map"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow && hotspots.length > 0) {
        iframe.contentWindow.postMessage({ type: 'SET_HOTSPOTS', data: hotspots }, '*');
    }
  }, [hotspots]);

  return (
    <Layout>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Crime Hotspot Analysis</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Predictive heatmaps and incident distribution across sectors.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="glass" style={{ display: 'flex', padding: '6px', borderRadius: '12px' }}>
            <button 
              onClick={() => setActiveTheme('CRIME_DENSITY')}
              className={`theme-btn ${activeTheme === 'CRIME_DENSITY' ? 'active' : ''}`}
            >
              Density
            </button>
            <button 
              onClick={() => setActiveTheme('SATELLITE')}
              className={`theme-btn ${activeTheme === 'SATELLITE' ? 'active' : ''}`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        {/* Real Leaflet Map Container */}
        <div className="glass" style={{ height: '700px', borderRadius: '32px', position: 'relative', overflow: 'hidden', padding: '0' }}>
          <iframe 
            title="Real Map"
            style={{ width: '100%', height: '100%', border: 'none' }}
            srcDoc={`
              <!DOCTYPE html>
              <html>
              <head>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <style>
                  body, html, #map { margin:0; padding:0; height:100%; width:100%; background: #020617; }
                  .custom-marker { 
                    background: var(--danger); 
                    border: 2px solid white; 
                    border-radius: 50%; 
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
                  }
                  .leaflet-popup-content-wrapper {
                    background: #1e293b;
                    color: white;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.1);
                  }
                  .leaflet-popup-tip { background: #1e293b; }
                </style>
              </head>
              <body>
                <div id="map"></div>
                <script>
                  const map = L.map('map', { zoomControl: false }).setView([28.6139, 77.2090], 12);
                  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap &copy; CARTO'
                  }).addTo(map);

                  window.addEventListener('message', (event) => {
                    const { type, data } = event.data;
                    if (type === 'SET_HOTSPOTS') {
                      data.forEach(spot => {
                        const marker = L.circleMarker([spot.latitude, spot.longitude], {
                          radius: 10,
                          fillColor: "#ef4444",
                          color: "#fff",
                          weight: 2,
                          opacity: 1,
                          fillOpacity: 0.8
                        }).addTo(map);

                        marker.bindPopup(\`
                          <div style="font-family: Arial, sans-serif;">
                            <strong style="color: #ef4444; font-size: 14px;">\${spot.crimeCategory}</strong><br/>
                            <span style="font-size: 12px; opacity: 0.8;">Case ID: \${spot.complaintId}</span><br/>
                            <p style="margin-top: 5px; font-size: 12px;">\${spot.locationDesc || 'Location Details N/A'}</p>
                          </div>
                        \`);
                      });
                      if (data.length > 0) {
                        const group = L.featureGroup(data.map(d => L.marker([d.latitude, d.longitude])));
                        map.fitBounds(group.getBounds().pad(0.2));
                      }
                    }
                  });
                </script>
              </body>
              </html>
            `}
            onLoad={(e: any) => {
                const iframe = e.target;
                if (hotspots.length > 0) {
                    iframe.contentWindow.postMessage({ type: 'SET_HOTSPOTS', data: hotspots }, '*');
                }
            }}
          />
          
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(2, 6, 23, 0.7)' }}>
              <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
          )}

          {/* Map Floating Tools */}
          <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <button className="glass map-tool"><Navigation size={18} /></button>
             <button className="glass map-tool"><Layers size={18} /></button>
             <button className="glass map-tool"><Filter size={18} /></button>
          </div>
        </div>

        {/* Sidebar: Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={20} color="var(--danger)" />
              Safety Alerts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="alert-item">
                <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>Sector 12: Vehicle Theft Spike</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Increased activity between 10 PM - 2 AM.</p>
              </div>
              <div className="alert-item">
                <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>Sector 4: Public Nuisance</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Multiple reports near Main Market area.</p>
              </div>
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Top Categories</h3>
            {[
              { label: 'Theft', count: 12, color: 'var(--danger)' },
              { label: 'Public Nuisance', count: 8, color: 'var(--accent)' },
              { label: 'Assault', count: 5, color: 'var(--info)' }
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: '700' }}>{item.count}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${(item.count/25)*100}%`, height: '100%', background: item.color }}></div>
                </div>
              </div>
            ))}
          </div>

          <button className="action-btn-primary" style={{ width: '100%', padding: '16px', marginTop: 'auto' }}>
            Report Patrol Dispatch
          </button>
        </div>
      </div>

      <style>{`
        .theme-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .theme-btn.active {
          background: var(--primary);
          color: white;
        }
        .theme-btn:hover:not(.active) {
          background: rgba(255,255,255,0.05);
        }
        .map-tool {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: white;
        }
        .map-tool:hover {
          border-color: var(--primary);
          background: rgba(59, 130, 246, 0.1);
        }
        .hotspot-marker {
          width: 28px;
          height: 28px;
          background: var(--bg-main);
          border: 2px solid var(--danger);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        .hotspot-marker svg {
          transform: rotate(45deg);
        }
        .marker-tooltip {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: 12px;
          width: 180px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s;
          pointer-events: none;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .hotspot-marker:hover .marker-tooltip {
          opacity: 1;
          visibility: visible;
          bottom: 50px;
        }
        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border: 2px solid var(--danger);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .alert-item {
          padding: 12px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
        }
        .action-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--primary);
          color: white;
          border-radius: 16px;
          font-weight: 700;
          transition: all 0.2s;
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

export default HotspotMapPage;
