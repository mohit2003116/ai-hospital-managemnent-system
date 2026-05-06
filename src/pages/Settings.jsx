import React, { useState, useEffect } from 'react';
import { Save, Building, Mail, Phone, MapPin, Shield, User } from 'lucide-react';
import './Doctors.css';

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hospital_settings');
    const defaultSettings = {
      hospitalName: 'HealthAdmin Medical Center',
      email: 'contact@healthadmin.com',
      phone: '+1 234-567-8900',
      address: '123 Medical Plaza, Health City, NY 10001',
      adminName: 'Admin User',
      adminEmail: 'admin@hospital.com',
      notifications: true,
      twoFactor: false
    };
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => setIsSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('hospital_settings', JSON.stringify(settings));
    setIsSaved(true);
    // Dispatch custom event so Layout.jsx knows to re-render the profile name
    window.dispatchEvent(new Event('profileUpdated'));
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1>Hospital Settings</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage hospital profile and system configurations.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} color="var(--primary)" />
          Admin Profile
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Profile Name</label>
              <input 
                type="text" 
                name="adminName"
                value={settings.adminName}
                onChange={handleChange}
                className="form-control" 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input 
                type="email" 
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleChange}
                className="form-control" 
                required 
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={20} color="var(--primary)" />
            Hospital Information
          </h2>
          <div className="form-group">
            <label className="form-label">Hospital Name</label>
            <input 
              type="text" 
              name="hospitalName"
              value={settings.hospitalName}
              onChange={handleChange}
              className="form-control" 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={16} /> Contact Email</div>
              </label>
              <input 
                type="email" 
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="form-control" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={16} /> Contact Phone</div>
              </label>
              <input 
                type="text" 
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="form-control" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={16} /> Address</div>
            </label>
            <textarea 
              name="address"
              value={settings.address}
              onChange={handleChange}
              className="form-control" 
              rows="2"
              required 
            ></textarea>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--primary)" />
            Security & Notifications
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>Enable System Notifications</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="twoFactor"
                checked={settings.twoFactor}
                onChange={handleChange}
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>Require Two-Factor Authentication (2FA) for Admins</span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Settings
            </button>
            {isSaved && (
              <span style={{ color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Settings saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
