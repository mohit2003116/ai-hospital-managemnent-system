import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download, X, Eye, User, Stethoscope, Clock, Pill } from 'lucide-react';
import './Doctors.css'; // Reusing common modal and table styles

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState(() => {
    const saved = localStorage.getItem('hospital_prescriptions');
    const initial = [
      { 
        id: 'RX-1001', 
        patientName: 'Alice Cooper', 
        doctorName: 'Dr. John Smith', 
        date: '2026-05-04',
        medicines: [
          { name: 'Metformin', dosage: '500mg', duration: '30 days', instructions: 'Once daily after dinner' },
          { name: 'Lisinopril', dosage: '10mg', duration: 'Ongoing', instructions: 'Once daily in morning' }
        ]
      }
    ];
    return saved ? JSON.parse(saved) : initial;
  });

  const [patients, setPatients] = useState(() => JSON.parse(localStorage.getItem('hospital_patients') || '[]'));
  const [doctors, setDoctors] = useState(() => JSON.parse(localStorage.getItem('hospital_doctors') || '[]'));

  useEffect(() => {
    localStorage.setItem('hospital_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    date: new Date().toISOString().split('T')[0],
    medicines: [{ name: '', dosage: '', duration: '', instructions: '' }]
  });

  const handleOpenModal = () => {
    setFormData({
      patientName: patients.length > 0 ? patients[0].name : '',
      doctorName: doctors.length > 0 ? doctors[0].name : '',
      date: new Date().toISOString().split('T')[0],
      medicines: [{ name: '', dosage: '', duration: '', instructions: '' }]
    });
    setIsModalOpen(true);
  };

  const handleAddMedicineField = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: '', dosage: '', duration: '', instructions: '' }]
    });
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index][field] = value;
    setFormData({ ...formData, medicines: updatedMedicines });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newId = `RX-${1000 + prescriptions.length + 1}`;
    setPrescriptions([{ ...formData, id: newId }, ...prescriptions]);
    setIsModalOpen(false);
  };

  const handleView = (rx) => {
    setCurrentPrescription(rx);
    setIsViewModalOpen(true);
  };

  const filteredPrescriptions = prescriptions.filter(rx => 
    rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rx.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Digital Prescriptions</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Create and manage digital medical prescriptions.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Create Prescription
        </button>
      </div>

      <div style={{ margin: '1.5rem 0' }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by RX ID or Patient Name..." 
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
              <th>RX ID</th>
              <th>Patient Name</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Medicines</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrescriptions.map(rx => (
              <tr key={rx.id}>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{rx.id}</td>
                <td style={{ fontWeight: 500 }}>{rx.patientName}</td>
                <td>{rx.doctorName}</td>
                <td>{rx.date}</td>
                <td>
                  <span className="badge" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                    {rx.medicines.length} Medicine(s)
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-icon" onClick={() => handleView(rx)} title="View Prescription">
                    <Eye size={18} />
                  </button>
                  <button className="btn-icon" title="Download PDF">
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Create Digital Prescription</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Patient</label>
                    <select 
                      className="form-control" 
                      value={formData.patientName}
                      onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                      required
                    >
                      {patients.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Doctor</label>
                    <select 
                      className="form-control" 
                      value={formData.doctorName}
                      onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                      required
                    >
                      {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Medicines</h3>
                {formData.medicines.map((med, index) => (
                  <div key={index} style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <input 
                        placeholder="Medicine Name" 
                        className="form-control" 
                        value={med.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                        required
                      />
                      <input 
                        placeholder="Dosage (e.g. 500mg)" 
                        className="form-control" 
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        required
                      />
                      <input 
                        placeholder="Duration" 
                        className="form-control" 
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        required
                      />
                    </div>
                    <input 
                      placeholder="Special Instructions" 
                      className="form-control" 
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                    />
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={handleAddMedicineField} style={{ fontSize: '0.8rem' }}>
                  + Add Another Medicine
                </button>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal (Digital Prescription Style) */}
      {isViewModalOpen && currentPrescription && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', padding: 0 }}>
            <div style={{ padding: '2rem', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ color: 'var(--primary)', margin: 0 }}>HealthAdmin</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Digital Healthcare Solutions</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ margin: 0 }}>PRESCRIPTION</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {currentPrescription.id}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Patient Details</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <User size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 600 }}>{currentPrescription.patientName}</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Doctor</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <Stethoscope size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 600 }}>{currentPrescription.doctorName}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <Pill size={20} color="var(--primary)" />
                  <h4 style={{ margin: 0 }}>Prescribed Medicines</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentPrescription.medicines.map((med, i) => (
                    <div key={i} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{med.name} ({med.dosage})</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{med.duration}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>{med.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} /> Date: {currentPrescription.date}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '150px', borderBottom: '1px solid var(--text-main)', marginBottom: '0.5rem' }}></div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Doctor's Signature</span>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-secondary" onClick={() => setIsViewModalOpen(false)}>Close</button>
              <button className="btn btn-primary">Print Prescription</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
