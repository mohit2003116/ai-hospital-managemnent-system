import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import SymptomChecker from './pages/SymptomChecker';
import Prescriptions from './pages/Prescriptions';
import NearbyHelp from './pages/NearbyHelp';
import AmbulanceTracking from './pages/AmbulanceTracking';
import LabManagement from './pages/LabManagement';
import VideoConsultation from './pages/VideoConsultation';
import QueueManagement from './pages/QueueManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="patients" element={<Patients />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="billing" element={<Billing />} />
          <Route path="symptom-checker" element={<SymptomChecker />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="lab-tests" element={<LabManagement />} />
          <Route path="nearby-help" element={<NearbyHelp />} />
          <Route path="ambulance-tracking" element={<AmbulanceTracking />} />
          <Route path="video-consultation/:id" element={<VideoConsultation />} />
          <Route path="queue-management" element={<QueueManagement />} />
          <Route path="settings" element={<Settings />} />
          {/* Add more routes here as needed */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
