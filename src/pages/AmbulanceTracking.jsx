import React, { useState, useEffect } from 'react';
import { Truck, Phone, Navigation, AlertCircle, CheckCircle2, MapPin, X, Plus } from 'lucide-react';
import './Doctors.css';

const mapImagePath = 'file:///C:/Users/kumar/.gemini/antigravity/brain/9848f54a-81fa-4e3f-8588-8a7d102207d0/city_map_dark_1778067332769.png';

export default function AmbulanceTracking() {
  const [ambulances, setAmbulances] = useState([
    { id: 'AMB-101', driver: 'John Doe', status: 'Available', x: 20, y: 30, phone: '+1 555-0199' },
    { id: 'AMB-102', driver: 'Jane Smith', status: 'On Call', x: 75, y: 45, phone: '+1 555-0188' },
    { id: 'AMB-103', driver: 'Mike Ross', status: 'Available', x: 50, y: 80, phone: '+1 555-0177' },
  ]);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState('none'); // none, searching, assigned, arrived
  const [assignedAmbulance, setAssignedAmbulance] = useState(null);

  // Simulation: Move "On Call" ambulances slightly
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances(prev => prev.map(amb => {
        if (amb.status === 'On Call' || (assignedAmbulance && amb.id === assignedAmbulance.id)) {
          // Move towards target (target is mock user location at 60, 60)
          const targetX = 60;
          const targetY = 60;
          const dx = (targetX - amb.x) * 0.05;
          const dy = (targetY - amb.y) * 0.05;
          
          if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 && amb.id === assignedAmbulance?.id) {
            setRequestStatus('arrived');
          }

          return { ...amb, x: amb.x + dx, y: amb.y + dy };
        }
        return amb;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [assignedAmbulance]);

  const handleRequestAmbulance = () => {
    setIsRequestModalOpen(true);
    setRequestStatus('searching');
    
    setTimeout(() => {
      const available = ambulances.find(a => a.status === 'Available');
      if (available) {
        setAssignedAmbulance(available);
        setAmbulances(prev => prev.map(a => a.id === available.id ? { ...a, status: 'On Call' } : a));
        setRequestStatus('assigned');
      }
    }, 3000);
  };

  return (
    <div className="page-content">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Live Ambulance Tracking</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Real-time GPS tracking and emergency dispatch system.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleRequestAmbulance}
          disabled={requestStatus !== 'none' && requestStatus !== 'arrived'}
          style={{ backgroundColor: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Truck size={20} /> Request Emergency Ambulance
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', marginTop: '2rem' }}>
        {/* Map View */}
        <div style={{ 
          position: 'relative', 
          height: '600px', 
          backgroundColor: '#0f172a', 
          borderRadius: 'var(--radius-lg)', 
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          border: '1px solid var(--border-color)'
        }}>
          {/* Map Background */}
          <img 
            src={mapImagePath} 
            alt="City Map" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />

          {/* User Location Marker */}
          <div style={{ 
            position: 'absolute', 
            left: '60%', 
            top: '60%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: 'var(--primary)', 
                borderRadius: '50%',
                boxShadow: '0 0 15px var(--primary)'
              }}></div>
              <div className="pulse-animation" style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                width: '30px', 
                height: '30px', 
                border: '2px solid var(--primary)', 
                borderRadius: '50%'
              }}></div>
              <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', whiteSpace: 'nowrap', fontWeight: 600 }}>You are here</span>
            </div>
          </div>

          {/* Ambulance Markers */}
          {ambulances.map(amb => (
            <div key={amb.id} style={{ 
              position: 'absolute', 
              left: `${amb.x}%`, 
              top: `${amb.y}%`, 
              transition: 'all 1s linear',
              zIndex: 20
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                cursor: 'pointer' 
              }}>
                <div style={{ 
                  backgroundColor: amb.status === 'On Call' ? 'var(--danger)' : 'var(--success)', 
                  padding: '8px', 
                  borderRadius: '50%', 
                  color: 'white',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}>
                  <Truck size={20} />
                </div>
                <span style={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                  color: 'white', 
                  fontSize: '10px', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  marginTop: '4px',
                  fontWeight: 600
                }}>
                  {amb.id}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Status Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} color="var(--primary)" /> Dispatch Status
            </h2>
            
            {requestStatus === 'none' && (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                <Truck size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>No active ambulance requests.</p>
              </div>
            )}

            {requestStatus === 'searching' && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p style={{ fontWeight: 600 }}>Searching for nearest available ambulance...</p>
              </div>
            )}

            {(requestStatus === 'assigned' || requestStatus === 'arrived') && assignedAmbulance && (
              <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '10px', borderRadius: '12px' }}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{assignedAmbulance.id}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{requestStatus === 'arrived' ? 'Arrived at Location' : 'Heading to your location'}</p>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}><strong>Driver:</strong> {assignedAmbulance.driver}</p>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}><strong>Contact:</strong> {assignedAmbulance.phone}</p>
                  <a href={`tel:${assignedAmbulance.phone}`} className="btn btn-primary btn-block" style={{ fontSize: '0.875rem' }}>
                    <Phone size={16} style={{ marginRight: '0.5rem' }} /> Call Driver
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Available Fleet</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ambulances.map(amb => (
                <div key={amb.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{amb.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Driver: {amb.driver}</div>
                  </div>
                  <span className={`badge ${amb.status === 'Available' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                    {amb.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && requestStatus === 'searching' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ padding: '2rem' }}>
              <div className="pulse-animation" style={{ width: '80px', height: '80px', border: '4px solid var(--danger)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={40} color="var(--danger)" />
              </div>
              <h2 style={{ marginBottom: '1rem' }}>Emergency Request</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Contacting dispatch and locating nearest ambulance...</p>
              <button className="btn btn-secondary btn-block" onClick={() => {setIsRequestModalOpen(false); setRequestStatus('none');}}>Cancel Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
