/**
 * Data Store Utility for Hospital Management System
 * Handles all CRUD operations with localStorage and provides a structured data layer.
 */

const STORAGE_KEYS = {
  PATIENTS: 'hospital_patients',
  DOCTORS: 'hospital_doctors',
  APPOINTMENTS: 'hospital_appointments',
  BILLS: 'hospital_bills',
  PRESCRIPTIONS: 'hospital_prescriptions',
  NOTIFICATIONS: 'hospital_notifications'
};

// --- INITIAL SEED DATA ---
const INITIAL_DOCTORS = [
  { id: 1, name: 'Dr. Sarah Wilson', specialization: 'Cardiology', phone: '+1 555-0101', email: 'sarah.w@hospital.com', status: 'Available', location: 'Wing A, Floor 2' },
  { id: 2, name: 'Dr. James Miller', specialization: 'Neurology', phone: '+1 555-0102', email: 'james.m@hospital.com', status: 'On Break', location: 'Wing B, Floor 1' },
  { id: 3, name: 'Dr. Emily Chen', specialization: 'Pediatrics', phone: '+1 555-0103', email: 'emily.c@hospital.com', status: 'Available', location: 'Wing C, Ground Floor' },
];

const INITIAL_PATIENTS = [
  { 
    id: 1, name: 'John Smith', age: 45, gender: 'Male', phone: '+1 555-0201', email: 'john.s@email.com', 
    healthInfo: 'Type 2 Diabetes, Hypertension',
    history: [
      { date: '2026-04-15', type: 'Checkup', detail: 'Regular quarterly checkup. Sugar levels slightly high.', doctor: 'Dr. James Miller' }
    ]
  },
  { 
    id: 2, name: 'Maria Garcia', age: 32, gender: 'Female', phone: '+1 555-0202', email: 'm.garcia@email.com', 
    healthInfo: 'No known allergies',
    history: []
  }
];

// --- CORE UTILITIES ---

const get = (key) => JSON.parse(localStorage.getItem(key)) || [];
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const dataStore = {
  // Initialize store if empty
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) save(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) save(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) save(STORAGE_KEYS.APPOINTMENTS, []);
    if (!localStorage.getItem(STORAGE_KEYS.BILLS)) save(STORAGE_KEYS.BILLS, []);
  },

  // Generic CRUD
  getAll: (entity) => get(STORAGE_KEYS[entity.toUpperCase()]),
  
  getById: (entity, id) => {
    const items = get(STORAGE_KEYS[entity.toUpperCase()]);
    return items.find(item => item.id === Number(id) || item.id === id);
  },

  add: (entity, data) => {
    const items = get(STORAGE_KEYS[entity.toUpperCase()]);
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const newItem = { ...data, id: newId };
    save(STORAGE_KEYS[entity.toUpperCase()], [newItem, ...items]);
    return newItem;
  },

  update: (entity, id, data) => {
    const items = get(STORAGE_KEYS[entity.toUpperCase()]);
    const updatedItems = items.map(item => (item.id === id ? { ...item, ...data } : item));
    save(STORAGE_KEYS[entity.toUpperCase()], updatedItems);
    return updatedItems;
  },

  delete: (entity, id) => {
    const items = get(STORAGE_KEYS[entity.toUpperCase()]);
    const filteredItems = items.filter(item => item.id !== id);
    save(STORAGE_KEYS[entity.toUpperCase()], filteredItems);
    return filteredItems;
  },

  // Specialized Queries
  getAppointmentsDetailed: () => {
    const appointments = get(STORAGE_KEYS.APPOINTMENTS);
    const patients = get(STORAGE_KEYS.PATIENTS);
    const doctors = get(STORAGE_KEYS.DOCTORS);

    return appointments.map(apt => ({
      ...apt,
      patient: patients.find(p => p.id === apt.patientId) || { name: apt.patientName }, // Fallback for legacy data
      doctor: doctors.find(d => d.id === apt.doctorId) || { name: 'Unknown Doctor' }
    }));
  }
};
