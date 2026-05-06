import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, Filter, Download, ChevronUp, ChevronDown } from 'lucide-react';
import './Doctors.css';

// Initial dummy data
const initialDoctors = [
  { id: 1, name: 'Dr. John Smith', specialization: 'Cardiology', phone: '+1 234-567-8900', status: 'Available', location: 'Downtown Medical Center' },
  { id: 2, name: 'Dr. Sarah Johnson', specialization: 'Pediatrics', phone: '+1 234-567-8901', status: 'On Leave', location: 'Westside Clinic' },
  { id: 3, name: 'Dr. Michael Chen', specialization: 'Neurology', phone: '+1 234-567-8902', status: 'Available', location: 'Central Hospital' },
];

export default function Doctors() {
  const [doctors, setDoctors] = useState(() => {
    const saved = localStorage.getItem('hospital_doctors');
    return saved ? JSON.parse(saved) : initialDoctors;
  });
  
  useEffect(() => {
    localStorage.setItem('hospital_doctors', JSON.stringify(doctors));
  }, [doctors]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    phone: '',
    status: 'Available',
    location: ''
  });

  const handleOpenModal = (doc = null) => {
    if (doc) {
      setCurrentDoctor(doc);
      setFormData({
        name: doc.name,
        specialization: doc.specialization,
        phone: doc.phone,
        status: doc.status,
        location: doc.location || ''
      });
    } else {
      setCurrentDoctor(null);
      setFormData({ name: '', specialization: '', phone: '', status: 'Available', location: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDoctor(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentDoctor) {
      // Update
      setDoctors(doctors.map(d => 
        d.id === currentDoctor.id ? { ...formData, id: currentDoctor.id } : d
      ));
    } else {
      // Add
      const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
      setDoctors([...doctors, { ...formData, id: newId }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      setDoctors(doctors.filter(d => d.id !== id));
    }
  };

  const handleExport = () => {
    const headers = ['Name', 'Specialization', 'Phone', 'Status'];
    const csvContent = [
      headers.join(','),
      ...doctors.map(d => `"${d.name}","${d.specialization}","${d.phone}","${d.status}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'doctors_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get unique specializations for the filter dropdown
  const specializations = [...new Set(doctors.map(d => d.specialization))];

  // Filter doctors based on search term and specialization
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.phone.includes(searchTerm);
    const matchesSpecialization = specializationFilter === '' || doc.specialization === specializationFilter;
    return matchesSearch && matchesSpecialization;
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Doctors Management</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage hospital doctors and their details.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Doctor
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search doctors by name or phone..." 
            className="form-control" 
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select 
            className="form-control" 
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((spec, i) => (
              <option key={i} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Name {getSortIcon('name')}</div>
              </th>
              <th onClick={() => requestSort('specialization')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Specialization {getSortIcon('specialization')}</div>
              </th>
              <th>Location</th>
              <th>Phone Number</th>
              <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Status {getSortIcon('status')}</div>
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDoctors.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No doctors found matching your criteria.</td>
              </tr>
            ) : (
              sortedDoctors.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 500 }}>{doc.name}</td>
                  <td>{doc.specialization}</td>
                  <td>{doc.location || 'N/A'}</td>
                  <td>{doc.phone}</td>
                  <td>
                    <span className={`badge ${doc.status === 'Available' ? 'badge-success' : 'badge-danger'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon edit" onClick={() => handleOpenModal(doc)} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(doc.id)} title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input 
                    type="text" 
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="form-control" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinic/Hospital Location</label>
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-control" 
                    placeholder="e.g. Downtown Medical Center"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="Available">Available</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentDoctor ? 'Save Changes' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
