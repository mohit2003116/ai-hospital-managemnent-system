import React, { useState } from 'react';
import { MapPin, Search, Phone, ExternalLink, Navigation, Building2, Stethoscope, Star } from 'lucide-react';
import './Doctors.css';

export default function NearbyHelp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  
  const allDoctors = JSON.parse(localStorage.getItem('hospital_doctors') || '[]');
  
  const nearbyHospitals = [
    { name: 'City General Hospital', distance: '1.2 km', rating: 4.8, type: 'Multi-specialty', address: '123 Health Ave, Downtown', phone: '+1 555-0011' },
    { name: 'St. Mary Childrens Hospital', distance: '2.5 km', rating: 4.9, type: 'Pediatrics', address: '456 Care Road, Westside', phone: '+1 555-0022' },
    { name: 'Central Surgical Clinic', distance: '3.1 km', rating: 4.5, type: 'Surgery', address: '789 Main St, Central', phone: '+1 555-0033' },
    { name: 'East Side Community Health', distance: '4.0 km', rating: 4.2, type: 'General', address: '101 East Blvd', phone: '+1 555-0044' },
  ];

  const filteredDoctors = allDoctors.filter(doc => 
    (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (doc.location || '').toLowerCase().includes(locationTerm.toLowerCase())
  );

  const filteredHospitals = nearbyHospitals.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.address.toLowerCase().includes(locationTerm.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="dashboard-header">
        <h1>Find Nearby Help</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Locate the nearest specialized doctors and hospitals in your area.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '2rem 0', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Specialization or Doctor/Hospital name..." 
            className="form-control" 
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Enter Location (e.g. Downtown, Westside)..." 
            className="form-control" 
            style={{ paddingLeft: '2.5rem' }}
            value={locationTerm}
            onChange={(e) => setLocationTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Hospitals Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Building2 size={24} /> Nearby Hospitals
          </h2>
          {filteredHospitals.map((h, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{h.name}</h3>
                <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-main)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>{h.distance}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>{h.type} • {h.address}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
                <Star size={14} color="var(--warning)" fill="var(--warning)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{h.rating}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem', gap: '0.4rem' }}>
                  <Navigation size={14} /> Navigate
                </button>
                <a href={`tel:${h.phone}`} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', gap: '0.4rem', textDecoration: 'none' }}>
                  <Phone size={14} /> Call
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Doctors Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
            <Stethoscope size={24} /> Specialized Doctors
          </h2>
          {filteredDoctors.map((doc, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{doc.name}</h3>
                <span className={`badge ${doc.status === 'Available' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>{doc.status}</span>
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', margin: '0.25rem 0' }}>{doc.specialization}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <MapPin size={12} style={{ marginRight: '0.25rem' }} /> {doc.location || 'Location not listed'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem', gap: '0.4rem', backgroundColor: 'var(--success)' }}>
                   Book Now
                </button>
                <a href={`tel:${doc.phone}`} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', gap: '0.4rem', textDecoration: 'none' }}>
                  <Phone size={14} /> Contact
                </a>
              </div>
            </div>
          ))}
          {filteredDoctors.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
              No doctors found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
