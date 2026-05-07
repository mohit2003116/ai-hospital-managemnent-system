import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  Activity,
  Stethoscope,
  CreditCard,
  Brain,
  FileText,
  MapPin,
  Truck,
  TestTube
} from 'lucide-react';

function Sidebar({ isOpen, onClose }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Basic logout logic
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Activity color="var(--primary)" size={28} />
        <h2>HealthAdmin</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <LayoutDashboard size={20} />
          <span>{t('dashboard')}</span>
        </NavLink>
        <NavLink to="/patients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Users size={20} />
          <span>{t('patients')}</span>
        </NavLink>
        <NavLink to="/doctors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Stethoscope size={20} />
          <span>{t('doctors')}</span>
        </NavLink>
        <NavLink to="/appointments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Calendar size={20} />
          <span>{t('appointments')}</span>
        </NavLink>
        <NavLink to="/billing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <CreditCard size={20} />
          <span>{t('billing')}</span>
        </NavLink>
        <NavLink to="/symptom-checker" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Brain size={20} />
          <span>{t('diseasePredictor')}</span>
        </NavLink>
        <NavLink to="/prescriptions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <FileText size={20} />
          <span>{t('prescriptions')}</span>
        </NavLink>
        <NavLink to="/lab-tests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <TestTube size={20} />
          <span>{t('labTests')}</span>
        </NavLink>
        <NavLink to="/nearby-help" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <MapPin size={20} />
          <span>{t('findHelp')}</span>
        </NavLink>
        <NavLink to="/ambulance-tracking" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Truck size={20} />
          <span>{t('ambulances')}</span>
        </NavLink>
        <NavLink to="/queue-management" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Users size={20} />
          <span>{t('queueManagement')}</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Settings size={20} />
          <span>{t('settings')}</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
