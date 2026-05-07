import React, { useState, useEffect } from 'react';
import { dataStore } from '../utils/dataStore';
import { Plus, Printer, FileText, X, DollarSign, Download } from 'lucide-react';
import './Doctors.css';



export default function Billing() {
  const [bills, setBills] = useState(dataStore.getAll('bills'));

  useEffect(() => {
    const refresh = () => setBills(dataStore.getAll('bills'));
    const unsubscribe = dataStore.subscribe(refresh);
    return unsubscribe;
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState(null); // For viewing/printing
  
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    date: new Date().toISOString().split('T')[0],
    treatmentCost: 0,
    tax: 0,
    status: 'Pending'
  });

  const handleOpenModal = () => {
    setFormData({ 
      patientName: '', 
      doctorName: '', 
      date: new Date().toISOString().split('T')[0],
      treatmentCost: 0, 
      tax: 0, 
      status: 'Pending' 
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'treatmentCost' || name === 'tax' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalAmount = formData.treatmentCost + formData.tax;
    dataStore.add('bills', { ...formData, totalAmount });
    handleCloseModal();
  };

  const handlePrint = (bill) => {
    alert(`Printing bill for ${bill.patientName}...\nTotal Amount: $${bill.totalAmount}`);
  };

  const handleMarkPaid = (id) => {
    dataStore.update('bills', id, { status: 'Paid' });
  };

  const handleExport = () => {
    const headers = ['Invoice ID', 'Patient Name', 'Doctor Name', 'Date', 'Treatment Cost', 'Tax', 'Total Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...bills.map(b => `INV-${b.id.toString().padStart(4, '0')},"${b.patientName}","${b.doctorName}",${b.date},${b.treatmentCost},${b.tax},${b.totalAmount},${b.status}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'billing_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Billing & Invoices</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage patient billing and generate invoices.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Generate Bill
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-details">
            <h3 style={{ fontSize: '0.875rem' }}>Total Revenue</h3>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>${bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.totalAmount, 0)}</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-details">
            <h3 style={{ fontSize: '0.875rem' }}>Pending Bills</h3>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{bills.filter(b => b.status === 'Pending').length}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Patient Name</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No bills generated yet.</td>
              </tr>
            ) : (
              bills.map(bill => (
                <tr key={bill.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>INV-{bill.id.toString().padStart(4, '0')}</td>
                  <td style={{ fontWeight: 500 }}>{bill.patientName}</td>
                  <td>{bill.doctorName}</td>
                  <td>{bill.date}</td>
                  <td style={{ fontWeight: 600 }}>${bill.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${bill.status === 'Paid' ? 'badge-success' : 'badge-danger'}`} style={{ 
                      backgroundColor: bill.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : undefined,
                      color: bill.status === 'Pending' ? 'var(--warning)' : undefined
                    }}>
                      {bill.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {bill.status === 'Pending' && (
                      <button className="btn-icon" style={{ color: 'var(--success)' }} onClick={() => handleMarkPaid(bill.id)} title="Mark as Paid">
                        <DollarSign size={18} />
                      </button>
                    )}
                    <button className="btn-icon" onClick={() => handlePrint(bill)} title="Print Invoice">
                      <Printer size={18} />
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
              <h2>Generate New Bill</h2>
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
                    placeholder="Enter patient name"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Doctor Name</label>
                  <input 
                    type="text" 
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    className="form-control" 
                    placeholder="Enter doctor name"
                    required 
                  />
                </div>

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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Treatment Cost ($)</label>
                    <input 
                      type="number" 
                      name="treatmentCost"
                      value={formData.treatmentCost || ''}
                      onChange={handleChange}
                      className="form-control" 
                      min="0"
                      step="0.01"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax / Additional Charges ($)</label>
                    <input 
                      type="number" 
                      name="tax"
                      value={formData.tax || ''}
                      onChange={handleChange}
                      className="form-control" 
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>Total Amount:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    ${((formData.treatmentCost || 0) + (formData.tax || 0)).toFixed(2)}
                  </span>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
