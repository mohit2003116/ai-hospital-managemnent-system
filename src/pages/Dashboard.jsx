import { Users, UserPlus, Calendar, Activity, TrendingUp, Clock, Stethoscope, ClipboardList, PieChart as PieIcon, BarChart as BarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

function Dashboard() {
  const navigate = useNavigate();

  // Read actual data from localStorage
  const patients = JSON.parse(localStorage.getItem('hospital_patients') || '[]');
  const doctors = JSON.parse(localStorage.getItem('hospital_doctors') || '[]');
  const appointments = JSON.parse(localStorage.getItem('hospital_appointments') || '[]');

  const today = new Date().toISOString().split('T')[0];
  const appointmentsToday = appointments.filter(a => a.date === today);
  const pendingAppointments = appointmentsToday.filter(a => a.status === 'Scheduled' || a.status === 'Waiting');

  // Sort appointments by date/time descending for recent activity
  const recentAppointments = [...appointments].sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`)).slice(0, 5);

  // Process data for charts
  // 1. Appointments trend (Last 7 days)
  const apptCountsByDate = appointments.reduce((acc, appt) => {
    acc[appt.date] = (acc[appt.date] || 0) + 1;
    return acc;
  }, {});

  let apptTrendData = Object.keys(apptCountsByDate).sort().slice(-7).map(date => ({
    date: date.split('-').slice(1).join('/'), // MM/DD
    count: apptCountsByDate[date]
  }));

  // Fallback Sample Data if no appointments exist
  if (apptTrendData.length === 0) {
    apptTrendData = [
      { date: '05/01', count: 4 },
      { date: '05/02', count: 7 },
      { date: '05/03', count: 5 },
      { date: '05/04', count: 8 },
      { date: '05/05', count: 12 },
      { date: '05/06', count: 10 },
      { date: '05/07', count: 15 },
    ];
  }


  // 2. Common Diseases (from healthInfo and history)
  const diseaseMap = {};
  patients.forEach(p => {
    // Check healthInfo
    if (p.healthInfo) {
      const keywords = ['Diabetes', 'Hypertension', 'Asthma', 'Heart', 'Thyroid', 'Flu', 'Covid'];
      keywords.forEach(key => {
        if (p.healthInfo.includes(key)) {
          diseaseMap[key] = (diseaseMap[key] || 0) + 1;
        }
      });
    }
    // Check history
    if (p.history) {
      p.history.forEach(h => {
        if (h.type === 'Disease') {
          const detail = h.detail;
          const keywords = ['Diabetes', 'Hypertension', 'Asthma', 'Heart', 'Thyroid', 'Flu', 'Covid'];
          keywords.forEach(key => {
            if (detail.includes(key)) {
              diseaseMap[key] = (diseaseMap[key] || 0) + 1;
            }
          });
        }
      });
    }
  });

  let diseaseChartData = Object.keys(diseaseMap).map(name => ({
    name,
    value: diseaseMap[name]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  // Fallback Sample Data if no patient data exists
  if (diseaseChartData.length === 0) {
    diseaseChartData = [
      { name: 'Hypertension', value: 35 },
      { name: 'Diabetes', value: 25 },
      { name: 'Asthma', value: 15 },
      { name: 'Flu', value: 20 },
      { name: 'Covid', value: 5 },
    ];
  }


  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Helper to get doctor name
  const getDoctorName = (id) => {
    const doc = doctors.find(d => d.id === id);
    return doc ? doc.name : 'Unknown Doctor';
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Welcome back, here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Patients</h3>
            <div className="stat-value">{patients.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
              <TrendingUp size={12} /> Active records
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <Stethoscope size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Doctors</h3>
            <div className="stat-value">{doctors.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
              <TrendingUp size={12} /> Available staff
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <ClipboardList size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Appointments</h3>
            <div className="stat-value">{appointments.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Lifetime bookings
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <Calendar size={24} />
          </div>
          <div className="stat-details">
            <h3>Appointments Today</h3>
            <div className="stat-value">{appointmentsToday.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {pendingAppointments.length} pending
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <BarIcon size={20} color="var(--primary)" />
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Appointment Trends (Last 7 Records)</h2>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apptTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <PieIcon size={20} color="var(--success)" />
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Patient Disease Distribution</h2>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diseaseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {diseaseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="recent-activity">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>Recent Appointments</h2>
            <button className="btn" style={{ color: 'var(--primary)', padding: 0 }} onClick={() => navigate('/appointments')}>View All</button>
          </div>
          <ul className="activity-list">
            {recentAppointments.length === 0 ? (
              <li style={{ color: 'var(--text-muted)' }}>No recent appointments</li>
            ) : (
              recentAppointments.map((apt, i) => (
                <li key={i} className="activity-item">
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', flexShrink: 0, fontWeight: 'bold', color: 'var(--primary)' }}>
                    {apt.patientName.charAt(0)}
                  </div>
                  <div className="activity-content" style={{ flex: 1 }}>
                    <h4>{apt.patientName}</h4>
                    <p>with {getDoctorName(apt.doctorId)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="activity-time">{apt.date} {apt.time}</div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '1rem',
                      backgroundColor: apt.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 
                                       apt.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 
                                       'rgba(79, 70, 229, 0.1)',
                      color: apt.status === 'Completed' ? 'var(--success)' : 
                             apt.status === 'Cancelled' ? 'var(--danger)' : 
                             'var(--primary)',
                      fontWeight: 500,
                      display: 'inline-block',
                      marginTop: '0.25rem'
                    }}>
                      {apt.status}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="recent-activity">
          <h2 style={{ marginBottom: '1.5rem' }}>System Notifications</h2>
          <ul className="activity-list">
            <li className="activity-item">
              <div className="activity-icon"><Clock size={20} /></div>
              <div className="activity-content">
                <h4>System Update Scheduled</h4>
                <p>Maintenance planned for tonight at 2 AM.</p>
              </div>
              <div className="activity-time">2h ago</div>
            </li>
            <li className="activity-item">
              <div className="activity-icon" style={{ color: 'var(--danger)' }}><Activity size={20} /></div>
              <div className="activity-content">
                <h4>Emergency Ward Alert</h4>
                <p>Capacity reached 90% in Emergency Ward.</p>
              </div>
              <div className="activity-time">4h ago</div>
            </li>
            <li className="activity-item">
              <div className="activity-icon" style={{ color: 'var(--success)' }}><UserPlus size={20} /></div>
              <div className="activity-content">
                <h4>New Staff Member Added</h4>
                <p>Dr. Smith has been added to the Cardiology department.</p>
              </div>
              <div className="activity-time">Yesterday</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
