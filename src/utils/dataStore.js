/**
 * Data Store Utility for Hospital Management System
 * Handles all CRUD operations with localStorage and provides a structured data layer.
 * Includes an event-based system to notify components of data changes.
 */

const STORAGE_KEYS = {
  PATIENTS: 'hospital_patients',
  DOCTORS: 'hospital_doctors',
  APPOINTMENTS: 'hospital_appointments',
  BILLS: 'hospital_bills',
  PRESCRIPTIONS: 'hospital_prescriptions',
  NOTIFICATIONS: 'hospital_notifications',
  LAB_TESTS: 'hospital_lab_tests',
  QUEUES: 'hospital_queues',
  SETTINGS: 'hospital_settings'
};

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

const INITIAL_LAB_TESTS = [
  { id: 1, patientId: 1, patientName: 'John Smith', type: 'Blood Test', date: '2026-04-10', doctor: 'Dr. Sarah Wilson', status: 'Completed', result: 'Normal', notes: 'CBC and Glucose levels within range.', fileUrl: 'https://images.unsplash.com/photo-1579154273821-3991ad3c784e?auto=format&fit=crop&q=80&w=400' },
  { id: 2, patientId: 2, patientName: 'Maria Garcia', type: 'X-Ray', date: '2026-05-01', doctor: 'Dr. James Miller', status: 'Pending', result: 'Awaiting Analysis', notes: 'Chest X-ray for persistent cough.', fileUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=400' }
];

const get = (key) => JSON.parse(localStorage.getItem(key)) || [];
const save = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
  // Dispatch custom event to notify listeners
  window.dispatchEvent(new CustomEvent('hospitalDataChanged', { detail: { key } }));
};

export const dataStore = {
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) save(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) save(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) save(STORAGE_KEYS.APPOINTMENTS, []);
    if (!localStorage.getItem(STORAGE_KEYS.BILLS)) save(STORAGE_KEYS.BILLS, []);
    if (!localStorage.getItem(STORAGE_KEYS.LAB_TESTS)) save(STORAGE_KEYS.LAB_TESTS, INITIAL_LAB_TESTS);
    if (!localStorage.getItem(STORAGE_KEYS.QUEUES)) save(STORAGE_KEYS.QUEUES, []);
  },

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
    const updatedItems = items.map(item => (Number(item.id) === Number(id) ? { ...item, ...data } : item));
    save(STORAGE_KEYS[entity.toUpperCase()], updatedItems);
    return updatedItems;
  },

  delete: (entity, id) => {
    const items = get(STORAGE_KEYS[entity.toUpperCase()]);
    const filteredItems = items.filter(item => Number(item.id) !== Number(id));
    save(STORAGE_KEYS[entity.toUpperCase()], filteredItems);
    return filteredItems;
  },

  // Event Listener Helper
  subscribe: (callback) => {
    window.addEventListener('hospitalDataChanged', callback);
    return () => window.removeEventListener('hospitalDataChanged', callback);
  }
};
