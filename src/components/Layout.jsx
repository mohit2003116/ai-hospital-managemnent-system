import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, User, Settings, LogOut, AlertTriangle, Phone, Stethoscope, FileText, Search as SearchIcon, X, Calendar as CalendarIcon, Pill, MapPin, Truck, ShieldAlert, Zap, Activity, TestTube } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatAssistant from './ChatAssistant';
import { useLanguage } from '../context/LanguageContext';

function Layout() {
  const { language, toggleLanguage, t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [emergencySearch, setEmergencySearch] = useState('');
  const [emergencyPatient, setEmergencyPatient] = useState(null);
  const [emergencyAlertStatus, setEmergencyAlertStatus] = useState(null); // null, 'Code Blue', 'Trauma Alert'
  
  const [adminProfile, setAdminProfile] = useState({ name: 'Admin User', email: 'admin@hospital.com' });
  
  const loadProfile = () => {
    const saved = localStorage.getItem('hospital_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAdminProfile({
        name: parsed.adminName || 'Admin User',
        email: parsed.adminEmail || 'admin@hospital.com'
      });
    }
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('profileUpdated', loadProfile);
    
    // Generate Notifications logic
    const generateNotifications = () => {
      const today = new Date().toISOString().split('T')[0];
      const newNotifications = [];

      // 1. Appointment Notifications
      const savedAppts = localStorage.getItem('hospital_appointments');
      if (savedAppts) {
        const appts = JSON.parse(savedAppts);
        appts.forEach(appt => {
          if (appt.date === today && appt.status === 'Scheduled') {
            newNotifications.push({
              id: `appt-${appt.id}`,
              type: 'Appointment',
              title: 'Upcoming Appointment',
              desc: `Meeting with ${appt.patientName} at ${appt.time}`,
              time: 'Starting Soon',
              icon: <CalendarIcon size={16} />
            });
          }
        });
      }

      // 2. Medicine Notifications (Mocked from patient history)
      const savedPatients = localStorage.getItem('hospital_patients');
      if (savedPatients) {
        const patients = JSON.parse(savedPatients);
        patients.forEach(patient => {
          if (patient.history) {
            patient.history.forEach(h => {
              if (h.type === 'Medicine') {
                newNotifications.push({
                  id: `med-${patient.id}-${h.date}`,
                  type: 'Medicine',
                  title: 'Medication Timing',
                  desc: `${patient.name}: ${h.detail}`,
                  time: 'Take Now',
                  icon: <Pill size={16} />
                });
              }
            });
          }
        });
      }

      // 3. Follow-up Notifications
      if (savedAppts) {
        const appts = JSON.parse(savedAppts);
        appts.forEach(appt => {
          if (appt.notes && appt.notes.toLowerCase().includes('follow-up')) {
            newNotifications.push({
              id: `follow-${appt.id}`,
              type: 'Follow-up',
              title: 'Follow-up Required',
              desc: `Checkup for ${appt.patientName} due today`,
              time: 'Today',
              icon: <Activity size={16} />
            });
          }
        });
      }

      // 4. Lab Results Notifications
      const savedLabs = localStorage.getItem('hospital_lab_tests');
      if (savedLabs) {
        const labs = JSON.parse(savedLabs);
        labs.forEach(lab => {
          if (lab.status === 'Urgent') {
            newNotifications.push({
              id: `lab-${lab.id}`,
              type: 'Urgent',
              title: 'Urgent Lab Result',
              desc: `${lab.patientName}: ${lab.type} result needs review`,
              time: 'Immediate',
              icon: <TestTube size={16} />
            });
          }
        });
      }

      setNotifications(newNotifications);
    };

    generateNotifications();
    const interval = setInterval(generateNotifications, 30000); // Refresh every 30s

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'e') {
        setIsEmergencyOpen(true);
      }
      if (e.key === 'Escape') {
        setIsEmergencyOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('profileUpdated', loadProfile);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  const navigate = useNavigate();

  // Close dropdowns if clicking anywhere outside (simplified by just overlay or closing one when opening another)
  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const getAvailableDoctors = () => {
    const saved = localStorage.getItem('hospital_doctors');
    if (saved) {
      const docs = JSON.parse(saved);
      return docs.filter(d => d.status === 'Available');
    }
    return [{ name: 'Dr. John Smith', phone: '+1 234-567-8900', specialization: 'Cardiology' }];
  };

  const searchEmergencyPatient = () => {
    if (!emergencySearch.trim()) {
      setEmergencyPatient(null);
      return;
    }
    const saved = localStorage.getItem('hospital_patients');
    if (saved) {
      const patients = JSON.parse(saved);
      const found = patients.find(p => p.name.toLowerCase().includes(emergencySearch.toLowerCase()) || p.id.toString() === emergencySearch);
      setEmergencyPatient(found || { notFound: true });
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <div style={{ position: 'relative', display: 'none' }} className="search-bar">
              {/* Optional Search Bar */}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button 
              className="emergency-btn"
              onClick={() => setIsEmergencyOpen(true)}
              title="Emergency Protocol (Ctrl+Alt+E)"
            >
              <AlertTriangle size={18} />
              <span className="emergency-text">{t('emergency')}</span>
            </button>

            <div className="language-switcher" style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-main)', padding: '0.25rem', borderRadius: '2rem', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => toggleLanguage('en')}
                style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '1.5rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: language === 'en' ? 'var(--primary)' : 'transparent',
                  color: language === 'en' ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
              >
                EN
              </button>
              <button 
                onClick={() => toggleLanguage('hi')}
                style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '1.5rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: language === 'hi' ? 'var(--primary)' : 'transparent',
                  color: language === 'hi' ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
              >
                हिन्दी
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={toggleNotification}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative' }}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, backgroundColor: 'var(--danger)', borderRadius: '50%', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {isNotificationOpen && (
                <div className="dropdown-menu" style={{ width: '320px' }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Notifications</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])}
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Bell size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                        <p>No new notifications</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <button key={n.id} className="notification-item" style={{ borderLeft: `3px solid ${n.type === 'Medicine' ? 'var(--success)' : n.type === 'Appointment' ? 'var(--primary)' : 'var(--warning)'}` }}>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div style={{ color: n.type === 'Medicine' ? 'var(--success)' : n.type === 'Appointment' ? 'var(--primary)' : 'var(--warning)', marginTop: '0.25rem' }}>
                              {n.icon}
                            </div>
                            <div>
                              <span className="notification-title">{n.title}</span>
                              <span className="notification-desc">{n.desc}</span>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>{n.time}</div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                onClick={toggleProfile}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, display: 'none' }} className="user-name">{adminProfile.name}</span>
              </div>
              
              {isProfileOpen && (
                <div className="dropdown-menu">
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{adminProfile.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{adminProfile.email}</div>
                  </div>
                  <div style={{ padding: '0.5rem 0' }}>
                    <button className="dropdown-item" onClick={() => navigate('/settings')}>
                      <Settings size={16} /> Settings
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
      
      {/* Global Chat Assistant */}
      <ChatAssistant />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Emergency Modal */}
      {isEmergencyOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(239, 68, 68, 0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: emergencyAlertStatus ? '#000' : 'var(--danger)', color: 'white', transition: 'background-color 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle size={28} className={emergencyAlertStatus ? 'pulse-animation' : ''} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
                  {emergencyAlertStatus ? `${emergencyAlertStatus.toUpperCase()} ACTIVE` : 'EMERGENCY PROTOCOL ACTIVE'}
                </h2>
              </div>
              <button 
                onClick={() => { setIsEmergencyOpen(false); setEmergencyPatient(null); setEmergencySearch(''); setEmergencyAlertStatus(null); }}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={28} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-main)', display: 'flex', gap: '1rem', overflowX: 'auto', borderBottom: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => setEmergencyAlertStatus('Code Blue')}
                className="btn" 
                style={{ backgroundColor: '#1e40af', color: 'white', flexShrink: 0, gap: '0.5rem', padding: '0.75rem 1.25rem' }}
              >
                <Zap size={18} /> CODE BLUE
              </button>
              <button 
                onClick={() => setEmergencyAlertStatus('Trauma Alert')}
                className="btn" 
                style={{ backgroundColor: '#b91c1c', color: 'white', flexShrink: 0, gap: '0.5rem', padding: '0.75rem 1.25rem' }}
              >
                <ShieldAlert size={18} /> TRAUMA ALERT
              </button>
              <button 
                onClick={() => navigate('/ambulance-tracking')}
                className="btn" 
                style={{ backgroundColor: 'var(--primary)', color: 'white', flexShrink: 0, gap: '0.5rem', padding: '0.75rem 1.25rem' }}
              >
                <Truck size={18} /> REQUEST AMBULANCE
              </button>
            </div>

            
            <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }} className="grid-2-col">
              {/* Quick Contacts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                    <Phone size={20} /> Emergency Contacts
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontWeight: 500 }}>Ambulance</span>
                      <a href="tel:911" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>911</a>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontWeight: 500 }}>Local Police</span>
                      <a href="tel:911" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>911</a>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontWeight: 500 }}>Hospital Code Blue</span>
                      <a href="tel:555-0000" style={{ color: 'var(--danger)', fontWeight: 600, textDecoration: 'none' }}>Ext. 0000</a>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Stethoscope size={20} /> Available Doctors
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {getAvailableDoctors().slice(0, 2).map((doc, i) => (
                      <div key={i} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontWeight: 600 }}>{doc.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{doc.specialization}</div>
                        <div style={{ marginTop: '0.5rem', fontWeight: 500, color: 'var(--primary)' }}>{doc.phone}</div>
                      </div>
                    ))}
                    {getAvailableDoctors().length === 0 && (
                      <div style={{ padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No doctors currently listed as available.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Quick Access */}
              <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} /> Quick Patient Access
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Quickly retrieve critical patient medical history during an emergency.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter Patient Name or ID..." 
                    value={emergencySearch}
                    onChange={(e) => setEmergencySearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchEmergencyPatient()}
                  />
                  <button className="btn btn-primary" onClick={searchEmergencyPatient}>
                    <SearchIcon size={18} />
                  </button>
                </div>

                {emergencyPatient && !emergencyPatient.notFound && (
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>{emergencyPatient.name}</h4>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <span>Age: {emergencyPatient.age}</span>
                      <span>Gender: {emergencyPatient.gender}</span>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>Emergency Contact</span>
                      <div style={{ fontWeight: 500 }}>{emergencyPatient.phone}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--danger)' }}>Critical Health Info</span>
                      <div style={{ fontWeight: 500, color: 'var(--danger)', marginTop: '0.25rem' }}>{emergencyPatient.healthInfo || 'No major health information on record.'}</div>
                    </div>
                  </div>
                )}
                
                {emergencyPatient && emergencyPatient.notFound && (
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    No patient found matching "{emergencySearch}".
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
