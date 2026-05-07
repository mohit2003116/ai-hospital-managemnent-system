import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  UserPlus, 
  MoreVertical,
  Play,
  SkipForward,
  X,
  Edit2,
  Trash2,
  RefreshCcw,
  Check
} from 'lucide-react';
import { dataStore } from '../utils/dataStore';
import { useLanguage } from '../context/LanguageContext';

function QueueManagement() {
  const { t } = useLanguage();
  const [queues, setQueues] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    patientName: '',
    status: 'Waiting'
  });

  useEffect(() => {
    loadData();
    const unsubscribe = dataStore.subscribe(loadData);
    return unsubscribe;
  }, []);

  const loadData = () => {
    setDoctors(dataStore.getAll('doctors'));
    setQueues(dataStore.getAll('queues'));
  };

  const getDoctorQueues = (doctorId) => {
    return queues.filter(q => q.doctorId === doctorId).sort((a, b) => a.position - b.position);
  };

  const handleNextPatient = (doctorId) => {
    const doctorQueue = getDoctorQueues(doctorId);
    if (doctorQueue.length > 0) {
      const nextPatient = doctorQueue[0];
      dataStore.delete('queues', nextPatient.id);
      // Optional: Log to a history log
    }
  };

  const handleCompletePatient = (id) => {
    dataStore.delete('queues', id);
  };

  const handleOpenModal = (doctorId, patient = null) => {
    setCurrentDoctorId(doctorId);
    if (patient) {
      setEditingPatient(patient);
      setFormData({ patientName: patient.patientName, status: patient.status });
    } else {
      setEditingPatient(null);
      setFormData({ patientName: '', status: 'Waiting' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPatient) {
      dataStore.update('queues', editingPatient.id, { 
        patientName: formData.patientName,
        status: formData.status
      });
    } else {
      const doctorQueue = getDoctorQueues(currentDoctorId);
      const lastPosition = doctorQueue.length > 0 ? Math.max(...doctorQueue.map(q => q.position)) : 0;
      
      dataStore.add('queues', {
        doctorId: currentDoctorId,
        patientName: formData.patientName,
        position: lastPosition + 1,
        arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: formData.status
      });
    }
    setIsModalOpen(false);
  };

  const handleDeletePatient = (id) => {
    if (window.confirm('Remove this patient from queue?')) {
      dataStore.delete('queues', id);
    }
  };

  return (
    <div className="queue-page animate-fade-in">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Live Patient Queues</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Monitor and manage real-time patient flow for each department.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} style={{ gap: '0.5rem' }}>
          <RefreshCcw size={18} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {doctors.map(doctor => {
          const doctorQueue = getDoctorQueues(doctor.id);
          const activePatient = doctorQueue.length > 0 ? doctorQueue[0] : null;

          return (
            <div key={doctor.id} className="card" style={{ display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 102, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{doctor.name}</h3>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{doctor.specialization}</span>
                  </div>
                </div>
                <div className="badge badge-success" style={{ fontSize: '0.7rem' }}>ACTIVE</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Currently Serving</span>
                  {activePatient && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       <button className="btn-icon" style={{ color: 'var(--success)' }} onClick={() => handleCompletePatient(activePatient.id)} title="Complete">
                        <Check size={18} />
                      </button>
                      <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDeletePatient(activePatient.id)} title="Cancel">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
                {activePatient ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1.125rem', display: 'block' }}>{activePatient.patientName}</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Arrived at {activePatient.arrivalTime}</span>
                    </div>
                    <div className="pulse-animation" style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>No patients currently being served</span>
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>Up Next ({Math.max(0, doctorQueue.length - 1)})</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {doctorQueue.length > 1 ? (
                    doctorQueue.slice(1, 6).map((p, idx) => (
                      <div key={p.id} className="queue-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', padding: '0.75rem', backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 700, width: '20px' }}>{idx + 1}</span>
                          <span style={{ fontWeight: 500 }}>{p.patientName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.arrivalTime}</span>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn-icon" onClick={() => handleOpenModal(doctor.id, p)} title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDeletePatient(p.id)} title="Remove">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      Queue is empty
                    </div>
                  )}
                  {doctorQueue.length > 6 && (
                    <span style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 600 }}>
                      + {doctorQueue.length - 6} more in waiting
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, gap: '0.5rem' }}
                  onClick={() => handleNextPatient(doctor.id)}
                  disabled={doctorQueue.length === 0}
                >
                  <SkipForward size={18} /> Call Next
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, gap: '0.5rem' }}
                  onClick={() => handleOpenModal(doctor.id)}
                >
                  <UserPlus size={18} /> Add Patient
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingPatient ? 'Edit Patient' : 'Add to Queue'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Patient Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter patient name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Priority Status</label>
                <select 
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Waiting">Waiting (Standard)</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>
              <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingPatient ? 'Update Patient' : 'Add to Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .queue-item:hover {
          transform: translateX(4px);
          transition: all 0.2s;
          border-color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
}

export default QueueManagement;
