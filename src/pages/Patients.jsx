import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, FileText, Search, Download, ChevronUp, ChevronDown, ClipboardList, Calendar, Pill, Activity, FileDigit } from 'lucide-react';
import './Doctors.css'; // Reusing the table and modal styles
import { dataStore } from '../utils/dataStore';

const initialPatients = [
  { id: 1, name: 'Alice Cooper', age: 45, gender: 'Female', phone: '+1 555-0100', healthInfo: 'Hypertension, Type 2 Diabetes', history: [
    { date: '2023-10-15', type: 'Disease', detail: 'Diagnosed with Type 2 Diabetes', doctor: 'Dr. John Smith' },
    { date: '2023-11-20', type: 'Medicine', detail: 'Metformin 500mg daily', doctor: 'Dr. John Smith' }
  ]},
  { id: 2, name: 'Bob Marley', age: 36, gender: 'Male', phone: '+1 555-0101', healthInfo: 'No known allergies, generally healthy', history: [] },
  { id: 3, name: 'Charlie Brown', age: 28, gender: 'Male', phone: '+1 555-0102', healthInfo: 'Asthma', history: [
    { date: '2024-01-05', type: 'Treatment', detail: 'Nebulization for acute asthma attack', doctor: 'Dr. Michael Chen' }
  ]},
];

export default function Patients() {
  const [patients, setPatients] = useState(dataStore.getAll('patients'));
  
  useEffect(() => {
    // Keep internal state in sync if needed, though direct dataStore calls are better
    setPatients(dataStore.getAll('patients'));
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  // History form state
  const [historyForm, setHistoryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Treatment',
    detail: '',
    doctor: ''
  });
  
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    healthInfo: ''
  });

  const handleOpenModal = (patient = null) => {
    if (patient) {
      setCurrentPatient(patient);
      setFormData({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        healthInfo: patient.healthInfo
      });
    } else {
      setCurrentPatient(null);
      setFormData({ name: '', age: '', gender: 'Male', phone: '', healthInfo: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsHistoryModalOpen(false);
    setCurrentPatient(null);
  };

  const handleOpenHistory = (patient) => {
    setCurrentPatient(patient);
    setIsHistoryModalOpen(true);
  };

  const handleAddHistory = (e) => {
    e.preventDefault();
    const updatedPatient = { 
      ...currentPatient, 
      history: [historyForm, ...(currentPatient.history || [])] 
    };
    dataStore.update('patients', currentPatient.id, updatedPatient);
    
    // Refresh states
    setPatients(dataStore.getAll('patients'));
    setCurrentPatient(updatedPatient);
    
    setHistoryForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Treatment',
      detail: '',
      doctor: ''
    });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentPatient) {
      dataStore.update('patients', currentPatient.id, formData);
    } else {
      dataStore.add('patients', { ...formData, history: [] });
    }
    setPatients(dataStore.getAll('patients'));
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      dataStore.delete('patients', id);
      setPatients(dataStore.getAll('patients'));
    }
  };


  const handleExport = () => {
    const headers = ['Name', 'Age', 'Gender', 'Phone', 'Health Info'];
    const csvContent = [
      headers.join(','),
      ...patients.map(p => `"${p.name}",${p.age},"${p.gender}","${p.phone}","${p.healthInfo || ''}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'patients_report.csv');
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

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  const sortedPatients = [...filteredPatients].sort((a, b) => {
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
          <h1>Patient Records</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage hospital patients and their health details.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Patient
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '500px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search patients by name or phone..." 
            className="form-control" 
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Name {getSortIcon('name')}</div>
              </th>
              <th onClick={() => requestSort('age')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Age/Gender {getSortIcon('age')}</div>
              </th>
              <th>Phone Number</th>
              <th>Basic Health Info</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPatients.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No patients found matching your search.</td>
              </tr>
            ) : (
              sortedPatients.map(patient => (
                <tr key={patient.id}>
                  <td style={{ fontWeight: 500 }}>{patient.name}</td>
                  <td>{patient.age} / {patient.gender}</td>
                  <td>{patient.phone}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <FileText size={16} color="var(--text-muted)" />
                      <span style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {patient.healthInfo || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon history" onClick={() => handleOpenHistory(patient)} title="Health History" style={{ color: 'var(--primary)' }}>
                      <ClipboardList size={18} />
                    </button>
                    <button className="btn-icon edit" onClick={() => handleOpenModal(patient)} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(patient.id)} title="Delete">
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
              <h2>{currentPatient ? 'Edit Patient' : 'Add New Patient'}</h2>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input 
                      type="number" 
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="form-control" 
                      min="0"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select 
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
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
                  <label className="form-label">Basic Health Information</label>
                  <textarea 
                    name="healthInfo"
                    value={formData.healthInfo}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    placeholder="Allergies, chronic conditions, etc."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentPatient ? 'Save Changes' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isHistoryModalOpen && currentPatient && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ClipboardList color="var(--primary)" /> 
                  Health History: {currentPatient.name}
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  View and manage medical records, treatments, and prescriptions.
                </p>
              </div>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
              {/* Add Record Form */}
              <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Add New Record</h3>
                <form onSubmit={handleAddHistory}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={historyForm.date}
                      onChange={(e) => setHistoryForm({...historyForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Record Type</label>
                    <select 
                      className="form-control"
                      value={historyForm.type}
                      onChange={(e) => setHistoryForm({...historyForm, type: e.target.value})}
                    >
                      <option value="Disease">Disease/Diagnosis</option>
                      <option value="Treatment">Treatment/Procedure</option>
                      <option value="Medicine">Medicine/Prescription</option>
                      <option value="Report">Medical Report/Lab</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Doctor In-charge</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Dr. Name"
                      value={historyForm.doctor}
                      onChange={(e) => setHistoryForm({...historyForm, doctor: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Details</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      placeholder="Enter specific details..."
                      value={historyForm.detail}
                      onChange={(e) => setHistoryForm({...historyForm, detail: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Record
                  </button>
                </form>
              </div>

              {/* History Timeline */}
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Medical Timeline</h3>
                {(!currentPatient.history || currentPatient.history.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <Activity size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No medical history records found.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {currentPatient.history.map((item, index) => (
                      <div key={index} style={{ 
                        padding: '1rem', 
                        backgroundColor: 'var(--bg-main)', 
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${
                          item.type === 'Disease' ? 'var(--danger)' : 
                          item.type === 'Medicine' ? 'var(--success)' : 
                          item.type === 'Report' ? 'var(--warning)' : 'var(--primary)'
                        }`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            textTransform: 'uppercase',
                            color: item.type === 'Disease' ? 'var(--danger)' : 
                                   item.type === 'Medicine' ? 'var(--success)' : 
                                   item.type === 'Report' ? 'var(--warning)' : 'var(--primary)'
                          }}>
                            {item.type}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} /> {item.date}
                          </span>
                        </div>
                        <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.detail}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recorded by: {item.doctor}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
