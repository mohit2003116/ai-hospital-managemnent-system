import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Users, 
  Settings, 
  MoreVertical,
  Maximize,
  Shield,
  Send,
  User,
  Activity,
  FileText
} from 'lucide-react';
import './VideoConsultation.css';

function VideoConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'System', text: 'Secure encrypted connection established.', time: '10:00 AM' },
    { id: 2, sender: 'Assistant', text: 'Dr. Smith will be with you shortly.', time: '10:01 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('hospital_appointments');
    if (saved) {
      const appts = JSON.parse(saved);
      const found = appts.find(a => a.id === Number(id));
      if (found) {
        // Find doctor name from doctors list if possible
        const doctors = JSON.parse(localStorage.getItem('hospital_doctors') || '[]');
        const doc = doctors.find(d => d.id === found.doctorId);
        setAppointment({ ...found, doctorName: doc ? doc.name : 'Dr. Sarah Wilson' });
      }
    }
  }, [id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setMessages([...messages, {
      id: messages.length + 1,
      sender: 'You',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage('');
  };

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to end this consultation?')) {
      navigate('/appointments');
    }
  };

  if (!appointment) {
    return <div className="video-loading">Loading consultation room...</div>;
  }

  return (
    <div className="video-consultation-page">
      <div className="video-main-layout">
        {/* Video Area */}
        <div className="video-stream-container">
          <div className="video-header">
            <div className="call-info">
              <div className="live-indicator">
                <span className="dot"></span> LIVE
              </div>
              <span className="call-duration">04:12</span>
              <span className="separator">|</span>
              <span className="encryption-label">
                <Shield size={14} /> End-to-end Encrypted
              </span>
            </div>
            <div className="doctor-label">
              {appointment.doctorName} (Cardiologist)
            </div>
          </div>

          <div className="video-grid">
            {/* Remote Video (Doctor) */}
            <div className="remote-video">
              <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=1000" alt="Doctor" />
              <div className="participant-name">{appointment.doctorName}</div>
            </div>

            {/* Local Video (Patient) */}
            <div className={`local-video ${!isVideoOn ? 'video-off' : ''}`}>
              {isVideoOn ? (
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" alt="You" />
              ) : (
                <div className="video-placeholder">
                  <User size={48} />
                  <span>Camera Off</span>
                </div>
              )}
              <div className="participant-name">You ({appointment.patientName})</div>
            </div>
          </div>

          <div className="video-controls">
            <button 
              className={`control-btn ${!isMicOn ? 'off' : ''}`} 
              onClick={() => setIsMicOn(!isMicOn)}
              title={isMicOn ? 'Mute' : 'Unmute'}
            >
              {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            <button 
              className={`control-btn ${!isVideoOn ? 'off' : ''}`} 
              onClick={() => setIsVideoOn(!isVideoOn)}
              title={isVideoOn ? 'Stop Video' : 'Start Video'}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
            <button className="control-btn end-call" onClick={handleEndCall} title="End Call">
              <PhoneOff size={24} />
            </button>
            <div className="control-separator"></div>
            <button className={`control-btn ${isChatOpen ? 'active' : ''}`} onClick={() => setIsChatOpen(!isChatOpen)}>
              <MessageSquare size={24} />
            </button>
            <button className="control-btn">
              <Users size={24} />
            </button>
            <button className="control-btn">
              <Settings size={24} />
            </button>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className={`video-sidebar ${isChatOpen ? 'chat-open' : ''}`}>
          <div className="sidebar-tabs">
            <button className="tab active">Chat</button>
            <button className="tab">Patient Info</button>
          </div>

          <div className="chat-container">
            <div className="messages-list">
              {messages.map(m => (
                <div key={m.id} className={`message-item ${m.sender === 'You' ? 'own' : ''}`}>
                  <div className="message-sender">{m.sender}</div>
                  <div className="message-bubble">
                    <p>{m.text}</p>
                    <span className="message-time">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit">
                <Send size={18} />
              </button>
            </form>
          </div>

          <div className="patient-quick-stats">
            <h4>Quick Medical View</h4>
            <div className="stat-row">
              <Activity size={16} color="var(--danger)" />
              <span>Heart Rate: 72 bpm</span>
            </div>
            <div className="stat-row">
              <FileText size={16} color="var(--primary)" />
              <span>Last BP: 120/80</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem' }}>
              View Full Medical History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoConsultation;
