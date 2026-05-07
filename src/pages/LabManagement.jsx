import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Eye, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  User,
  Calendar,
  ClipboardList
} from 'lucide-react';
import { dataStore } from '../utils/dataStore';
import './LabManagement.css';

function LabManagement() {
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    type: 'Blood Test',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    status: 'Pending',
    result: '',
    notes: '',
    fileUrl: ''
  });

  useEffect(() => {
    loadData();
    const unsubscribe = dataStore.subscribe(loadData);
    return unsubscribe;
  }, []);

  const loadData = () => {
    const tests = dataStore.getAll('lab_tests');
    const pts = dataStore.getAll('patients');
    const docs = dataStore.getAll('doctors');
    setLabTests(tests);
    setPatients(pts);
    setDoctors(docs);
    if (docs.length > 0) {
      setFormData(prev => ({ ...prev, doctor: docs[0].name }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === Number(formData.patientId));
    const newTest = {
      ...formData,
      patientId: Number(formData.patientId),
      patientName: patient ? patient.name : 'Unknown Patient',
      // Simulating a file URL if none provided
      fileUrl: formData.fileUrl || 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=400'
    };
    
    dataStore.add('lab_tests', newTest);
    loadData();
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      type: 'Blood Test',
      date: new Date().toISOString().split('T')[0],
      doctor: doctors.length > 0 ? doctors[0].name : '',
      status: 'Pending',
      result: '',
      notes: '',
      fileUrl: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      dataStore.delete('lab_tests', id);
      loadData();
    }
  };

  const handleView = (test) => {
    setSelectedTest(test);
    setIsViewModalOpen(true);
  };

  const filteredTests = labTests.filter(test => {
    const matchesSearch = test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          test.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || test.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={16} className="text-success" />;
      case 'Pending': return <Clock size={16} className="text-warning" />;
      case 'Urgent': return <AlertCircle size={16} className="text-danger" />;
      default: return null;
    }
  };

  return (
    <div className="lab-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lab Test Management</h1>
          <p className="page-subtitle">Upload and manage patient medical reports and diagnostic tests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>New Lab Test</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue-soft text-blue">
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Tests</span>
            <span className="stat-value">{labTests.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-orange-soft text-orange">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Analysis</span>
            <span className="stat-value">{labTests.filter(t => t.status === 'Pending').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-soft text-green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Completed Reports</span>
            <span className="stat-value">{labTests.filter(t => t.status === 'Completed').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red-soft text-red">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Urgent Reports</span>
            <span className="stat-value">{labTests.filter(t => t.status === 'Urgent').length}</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by patient or test type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <div className="filter-group">
            <Filter size={18} className="text-muted" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="All">All Types</option>
              <option value="Blood Test">Blood Test</option>
              <option value="X-Ray">X-Ray</option>
              <option value="MRI">MRI</option>
              <option value="CT Scan">CT Scan</option>
              <option value="Medical Report">Medical Report</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="lab-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Test Type</th>
              <th>Assigned Doctor</th>
              <th>Date</th>
              <th>Status</th>
              <th>Result</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <tr key={test.id} className="table-row">
                  <td>
                    <div className="patient-cell">
                      <div className="avatar-sm">
                        <User size={14} />
                      </div>
                      <span className="font-medium">{test.patientName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="test-type-badge">{test.type}</span>
                  </td>
                  <td>{test.doctor}</td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {test.date}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${test.status.toLowerCase()}`}>
                      {getStatusIcon(test.status)}
                      {test.status}
                    </span>
                  </td>
                  <td>
                    <span className={`result-text ${test.result === 'Normal' ? 'text-green' : 'text-orange'}`}>
                      {test.result || 'Pending'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-btns">
                      <button className="action-btn view" title="View Report" onClick={() => handleView(test)}>
                        <Eye size={18} />
                      </button>
                      <button className="action-btn delete" title="Delete" onClick={() => handleDelete(test.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-content">
                    <TestTube size={48} className="empty-icon" />
                    <p>No lab tests found matching your criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Lab Test Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <div className="modal-header">
              <h2 className="modal-title">New Lab Test Report</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Select Patient</label>
                  <select 
                    name="patientId" 
                    value={formData.patientId} 
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Choose Patient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Test Type</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleInputChange}
                  >
                    <option value="Blood Test">Blood Test</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="MRI">MRI</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="Medical Report">Medical Report</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assigned Doctor</label>
                  <select 
                    name="doctor" 
                    value={formData.doctor} 
                    onChange={handleInputChange}
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Test Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Initial Result / Summary</label>
                  <input 
                    type="text" 
                    name="result" 
                    placeholder="e.g. Normal, High Glucose, etc."
                    value={formData.result} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange}
                  >
                    <option value="Pending">Pending Analysis</option>
                    <option value="Completed">Completed</option>
                    <option value="Urgent">Urgent Review</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Doctor's Notes</label>
                <textarea 
                  name="notes" 
                  rows="3" 
                  placeholder="Additional observations..."
                  value={formData.notes} 
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Upload Report Image / PDF</label>
                <div className="file-upload-zone">
                  <Upload size={32} />
                  <p>Click or drag file to upload report</p>
                  <span>Supported formats: JPG, PNG, PDF</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {isViewModalOpen && selectedTest && (
        <div className="modal-overlay">
          <div className="modal-content view-modal animate-slide-up">
            <div className="modal-header">
              <h2 className="modal-title">Lab Report Details</h2>
              <button className="close-btn" onClick={() => setIsViewModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="report-detail-layout">
              <div className="report-info-panel">
                <div className="detail-section">
                  <label>Patient Information</label>
                  <p className="detail-value">{selectedTest.patientName}</p>
                </div>
                <div className="detail-grid">
                  <div className="detail-section">
                    <label>Test Type</label>
                    <p className="detail-value">{selectedTest.type}</p>
                  </div>
                  <div className="detail-section">
                    <label>Date</label>
                    <p className="detail-value">{selectedTest.date}</p>
                  </div>
                </div>
                <div className="detail-section">
                  <label>Assigned Doctor</label>
                  <p className="detail-value">{selectedTest.doctor}</p>
                </div>
                <div className="detail-section">
                  <label>Analysis Result</label>
                  <p className={`detail-value ${selectedTest.result === 'Normal' ? 'text-green' : 'text-orange'}`}>
                    {selectedTest.result}
                  </p>
                </div>
                <div className="detail-section">
                  <label>Notes</label>
                  <p className="detail-notes">{selectedTest.notes || 'No additional notes provided.'}</p>
                </div>
              </div>
              <div className="report-image-panel">
                <label>Report Document</label>
                <div className="report-image-wrapper">
                  <img src={selectedTest.fileUrl} alt="Medical Report" />
                  <div className="image-overlay">
                    <button className="btn btn-white">
                      <FileText size={18} />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabManagement;
