import React, { useState, useEffect } from 'react';
import { dataStore } from '../utils/dataStore';
import { Plus, Edit2, Trash2, X, Calendar as CalendarIcon, Clock, Search, Filter, Download, ChevronUp, ChevronDown, CreditCard, Smartphone, CheckCircle } from 'lucide-react';
import './Doctors.css';

export default function Appointments() {
  const [appointments, setAppointments] = useState(dataStore.getAll('appointments'));

  useEffect(() => {
    const refresh = () => setAppointments(dataStore.getAll('appointments'));
    const unsubscribe = dataStore.subscribe(refresh);
    return unsubscribe;
  }, []);

  // Read doctors from localStorage to get the real list
  const allDoctors = JSON.parse(localStorage.getItem('hospital_doctors') || '[]');
  // Fallback to initial dummy data if none exists
  const mockDoctors = allDoctors.length > 0 ? allDoctors : [
    { id: 1, name: 'Dr. John Smith', specialization: 'Cardiology', status: 'Available' },
    { id: 2, name: 'Dr. Sarah Johnson', specialization: 'Pediatrics', status: 'On Leave' },
    { id: 3, name: 'Dr. Michael Chen', specialization: 'Neurology', status: 'Available' },
    { id: 4, name: 'Dr. Emily Davis', specialization: 'General Practice', status: 'Available' }
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentAppt, setCurrentAppt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });
  
  // Payment state
  const [paymentStep, setPaymentStep] = useState(1); // 1: Method, 2: Details, 3: Success
  const [paymentMethod, setPaymentMethod] = useState('');
  
  
  // Only show available doctors
  const availableDoctors = mockDoctors.filter(d => d.status === 'Available');

  const [formData, setFormData] = useState({
    patientName: '',
    doctorId: availableDoctors.length > 0 ? availableDoctors[0].id : '',
    date: '',
    time: '',
    status: 'Scheduled',
    notes: '',
    paymentStatus: 'Pending',
    amount: 150,
    type: 'In-Person'
  });

  const handleOpenModal = (appt = null) => {
    if (appt) {
      setCurrentAppt(appt);
      setFormData({
        patientName: appt.patientName,
        doctorId: appt.doctorId,
        date: appt.date,
        time: appt.time,
        status: appt.status,
        notes: appt.notes || '',
        type: appt.type || 'In-Person'
      });
    } else {
      setCurrentAppt(null);
      setFormData({ 
        patientName: '', 
        doctorId: availableDoctors.length > 0 ? availableDoctors[0].id : '', 
        date: '', 
        time: '', 
        status: 'Scheduled', 
        notes: '',
        type: 'In-Person'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsPaymentModalOpen(false);
    setCurrentAppt(null);
    setPaymentStep(1);
  };

  const handleOpenPayment = (appt) => {
    setCurrentAppt(appt);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentStep(3);
    const updatedAppts = appointments.map(a => 
      a.id === currentAppt.id ? { ...a, paymentStatus: 'Paid' } : a
    );
    setAppointments(updatedAppts);

    // Sync with Billing
    const savedBills = JSON.parse(localStorage.getItem('hospital_bills') || '[]');
    const newBill = {
      id: savedBills.length > 0 ? Math.max(...savedBills.map(b => b.id)) + 1 : 1,
      patientName: currentAppt.patientName,
      doctorName: getDoctorName(currentAppt.doctorId),
      date: new Date().toISOString().split('T')[0],
      treatmentCost: currentAppt.amount,
      tax: currentAppt.amount * 0.1,
      totalAmount: currentAppt.amount * 1.1,
      status: 'Paid'
    };
    localStorage.setItem('hospital_bills', JSON.stringify([newBill, ...savedBills]));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'doctorId' ? parseInt(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentAppt) {
      setAppointments(appointments.map(a => 
        a.id === currentAppt.id ? { ...formData, id: currentAppt.id } : a
      ));
    } else {
      const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
      setAppointments([...appointments, { ...formData, id: newId }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to cancel and delete this appointment?')) {
      setAppointments(appointments.filter(a => a.id !== id));
    }
  };

  const getDoctorName = (id) => {
    const doc = mockDoctors.find(d => d.id === id);
    return doc ? doc.name : 'Unknown Doctor';
  };

  const handleExport = () => {
    const headers = ['Patient Name', 'Doctor Name', 'Date', 'Time', 'Status', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...appointments.map(a => `"${a.patientName}","${getDoctorName(a.doctorId)}",${a.date},${a.time},${a.status},"${a.notes || ''}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'appointments_report.csv');
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

  const filteredAppointments = appointments.filter(appt => {
    const docName = getDoctorName(appt.doctorId).toLowerCase();
    const patName = appt.patientName.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = patName.includes(searchLower) || docName.includes(searchLower);
    const matchesDate = dateFilter === '' || appt.date === dateFilter;
    
    return matchesSearch && matchesDate;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
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
          <h1>Appointments</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Schedule and manage patient appointments.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Book Appointment
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by patient or doctor name..." 
            className="form-control" 
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
          <Filter size={18} color="var(--text-muted)" />
          <input 
            type="date"
            className="form-control" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="Filter by Date"
          />
          {dateFilter && (
            <button className="btn-icon" onClick={() => setDateFilter('')} title="Clear Date Filter" style={{ padding: '0.25rem' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('patientName')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Patient Name {getSortIcon('patientName')}</div>
              </th>
              <th>Doctor</th>
              <th onClick={() => requestSort('date')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Date & Time {getSortIcon('date')}</div>
              </th>
              <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Status {getSortIcon('status')}</div>
              </th>
              <th>Payment</th>
              <th>Notes</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAppointments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No appointments found matching your criteria.</td>
              </tr>
            ) : (
              sortedAppointments.map(appt => (
                <tr key={appt.id}>
                  <td style={{ fontWeight: 500 }}>{appt.patientName}</td>
                  <td>{getDoctorName(appt.doctorId)}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <CalendarIcon size={14} color="var(--text-muted)" /> {appt.date}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <Clock size={14} color="var(--text-muted)" /> {appt.time}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      appt.status === 'Completed' ? 'badge-success' : 
                      appt.status === 'Cancelled' ? 'badge-danger' : 
                      'badge-success' // Default for scheduled, could use a different color but success works for now
                    }`} style={{ 
                      backgroundColor: appt.status === 'Scheduled' ? 'rgba(79, 70, 229, 0.1)' : undefined,
                      color: appt.status === 'Scheduled' ? 'var(--primary)' : undefined
                    }}>
                      {appt.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${appt.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`} style={{ 
                        backgroundColor: appt.paymentStatus === 'Pending' ? 'rgba(239, 68, 68, 0.1)' : undefined,
                        color: appt.paymentStatus === 'Pending' ? 'var(--danger)' : undefined
                      }}>
                        {appt.paymentStatus || 'Pending'}
                      </span>
                      {appt.paymentStatus !== 'Paid' && (
                        <button className="btn-icon" onClick={() => handleOpenPayment(appt)} title="Pay Now" style={{ color: 'var(--primary)' }}>
                          <CreditCard size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.875rem' }}>
                    {appt.notes || '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {appt.type === 'Video' && appt.status === 'Scheduled' && (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', marginRight: '0.5rem', gap: '0.4rem' }}
                        onClick={() => navigate(`/video-consultation/${appt.id}`)}
                      >
                        <Smartphone size={14} /> Join Call
                      </button>
                    )}
                    <button className="btn-icon edit" onClick={() => handleOpenModal(appt)} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(appt.id)} title="Delete">
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
              <h2>{currentAppt ? 'Edit Appointment' : 'Book Appointment'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Patient Name</label>
                  <input 
                    type="text" 
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    className="form-control" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Select Doctor (Available Only)</label>
                  <select 
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    {availableDoctors.length === 0 && <option value="" disabled>No doctors available</option>}
                    {availableDoctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input 
                      type="date" 
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="form-control" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input 
                      type="time" 
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="form-control" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Consultation Type</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input type="radio" name="type" value="In-Person" checked={formData.type === 'In-Person'} onChange={handleChange} />
                      In-Person
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input type="radio" name="type" value="Video" checked={formData.type === 'Video'} onChange={handleChange} />
                      Video Consultation
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Reason for Visit</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="form-control"
                    rows="2"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={availableDoctors.length === 0}>
                  {currentAppt ? 'Save Changes' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && currentAppt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Secure Payment</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Amount to Pay</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>${currentAppt.amount || 150}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, marginTop: '0.5rem' }}>Appointment with {getDoctorName(currentAppt.doctorId)}</div>
              </div>

              {paymentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label className="form-label">Select Payment Method</label>
                  <button className="btn btn-secondary" onClick={() => {setPaymentMethod('Card'); setPaymentStep(2);}} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CreditCard size={20} /> Credit / Debit Card
                    </div>
                    <span>&rarr;</span>
                  </button>
                  <button className="btn btn-secondary" onClick={() => {setPaymentMethod('UPI'); setPaymentStep(2);}} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Smartphone size={20} /> UPI / Online Banking
                    </div>
                    <span>&rarr;</span>
                  </button>
                </div>
              )}

              {paymentStep === 2 && (
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Pay via {paymentMethod}</h3>
                  <div className="form-group">
                    <label className="form-label">{paymentMethod === 'Card' ? 'Card Number' : 'UPI ID / Mobile Number'}</label>
                    <input type="text" className="form-control" placeholder={paymentMethod === 'Card' ? '0000 0000 0000 0000' : 'user@upi'} />
                  </div>
                  {paymentMethod === 'Card' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Expiry</label>
                        <input type="text" className="form-control" placeholder="MM/YY" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input type="password" className="form-control" placeholder="***" />
                      </div>
                    </div>
                  )}
                  <button className="btn btn-primary btn-block" onClick={handlePaymentSuccess} style={{ marginTop: '1rem' }}>
                    Confirm Payment
                  </button>
                  <button className="btn btn-secondary btn-block" onClick={() => setPaymentStep(1)} style={{ marginTop: '0.5rem' }}>
                    Back
                  </button>
                </div>
              )}

              {paymentStep === 3 && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>
                    <CheckCircle size={64} style={{ margin: '0 auto' }} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Payment Successful!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Your appointment is now confirmed. The invoice has been generated.</p>
                  <button className="btn btn-primary btn-block" onClick={handleCloseModal} style={{ marginTop: '2rem' }}>
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
