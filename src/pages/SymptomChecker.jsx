import React, { useState } from 'react';
import { Activity, AlertCircle, UserPlus, Send, Loader2, Info, CheckCircle2, ShieldAlert, HeartPulse, Pill, Thermometer } from 'lucide-react';

function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeSymptoms = () => {
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    // Simulate API delay for AI processing
    setTimeout(() => {
      const text = symptoms.toLowerCase();
      
      const conditions = [
        {
          keywords: ['chest pain', 'heart', 'shortness of breath', 'arm pain', 'sweating'],
          diagnosis: 'Acute Coronary Syndrome / Angina',
          doctor: 'Cardiologist',
          urgency: 'critical',
          riskLevel: 95,
          actions: ['Go to Emergency Room', 'Do not drive yourself', 'Take aspirin if prescribed'],
          commonSymptoms: ['Chest pressure', 'Pain radiating to jaw', 'Nausea']
        },
        {
          keywords: ['fever', 'cough', 'sore throat', 'chills', 'body ache'],
          diagnosis: 'Influenza (Flu) or Respiratory Infection',
          doctor: 'General Physician',
          urgency: 'medium',
          riskLevel: 45,
          actions: ['Rest and hydrate', 'Monitor temperature', 'Consult GP if symptoms persist'],
          commonSymptoms: ['Fatigue', 'Congestion', 'Mild headache']
        },
        {
          keywords: ['headache', 'vision', 'dizziness', 'light sensitivity', 'migraine'],
          diagnosis: 'Migraine or Cluster Headache',
          doctor: 'Neurologist',
          urgency: 'medium',
          riskLevel: 30,
          actions: ['Rest in a dark room', 'Avoid bright screens', 'Check blood pressure'],
          commonSymptoms: ['Nausea', 'Pulsating pain', 'Aura']
        },
        {
          keywords: ['stomach', 'abdomen', 'nausea', 'vomiting', 'diarrhea'],
          diagnosis: 'Gastroenteritis or Acute Gastritis',
          doctor: 'Gastroenterologist',
          urgency: 'medium',
          riskLevel: 40,
          actions: ['Drink electrolytes', 'Brat diet (Bananas, Rice, Applesauce)', 'Avoid dairy'],
          commonSymptoms: ['Cramping', 'Loss of appetite', 'Low-grade fever']
        },
        {
          keywords: ['joint', 'bone', 'fracture', 'knee', 'back pain', 'sprain'],
          diagnosis: 'Orthopedic Musculoskeletal Injury',
          doctor: 'Orthopedic Surgeon',
          urgency: 'normal',
          riskLevel: 25,
          actions: ['R.I.C.E (Rest, Ice, Compression, Elevation)', 'Limit weight bearing', 'Pain relief'],
          commonSymptoms: ['Swelling', 'Limited mobility', 'Bruising']
        },
        {
          keywords: ['skin', 'rash', 'itch', 'hives', 'allergy'],
          diagnosis: 'Dermatitis or Allergic Reaction',
          doctor: 'Dermatologist',
          urgency: 'normal',
          riskLevel: 15,
          actions: ['Apply soothing lotion', 'Identify allergens', 'Avoid scratching'],
          commonSymptoms: ['Redness', 'Scaling', 'Small bumps']
        }
      ];

      // Smart Matching
      const matched = conditions.find(c => c.keywords.some(k => text.includes(k)));

      if (matched) {
        setResult(matched);
      } else {
        setResult({
          diagnosis: 'Non-Specific General Symptoms',
          doctor: 'General Physician',
          urgency: 'normal',
          riskLevel: 10,
          actions: ['Monitor symptoms for 24h', 'Maintain hydration', 'Rest'],
          commonSymptoms: ['Mild fatigue', 'General discomfort']
        });
      }
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="page-content">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity color="var(--primary)" /> 
          AI Symptom Checker
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Describe your symptoms in simple terms and our AI will suggest possible conditions and the right specialist.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Input Section */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>Describe Your Symptoms</h2>
          <div className="form-group">
            <textarea
              className="form-control"
              rows="6"
              placeholder="E.g., I have been having a severe headache for the past two days along with dizziness..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>
          <button 
            className="btn btn-primary btn-block" 
            onClick={analyzeSymptoms}
            disabled={isAnalyzing || !symptoms.trim()}
            style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing...
              </>
            ) : (
              <>
                <Send size={18} />
                Analyze Symptoms
              </>
            )}
          </button>
          
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
             <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
             <span>Disclaimer: This AI symptom checker is for informational purposes only and does not replace professional medical advice.</span>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className="card" style={{ 
            animation: 'fadeIn 0.5s ease',
            borderTop: result.urgency === 'critical' ? '6px solid var(--danger)' : 
                       result.urgency === 'medium' ? '6px solid var(--warning)' : '6px solid var(--success)',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Diagnostic Report</h2>
              <span className={`badge ${
                result.urgency === 'critical' ? 'badge-danger' : 
                result.urgency === 'medium' ? 'badge-warning' : 'badge-success'
              }`} style={{ padding: '0.5rem 1rem' }}>
                {result.urgency.toUpperCase()} RISK
              </span>
            </div>
            
            {/* Urgency Progress Bar */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Health Risk Level</span>
                <span>{result.riskLevel}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${result.riskLevel}%`, 
                  backgroundColor: result.riskLevel > 70 ? 'var(--danger)' : result.riskLevel > 30 ? 'var(--warning)' : 'var(--success)',
                  transition: 'width 1s ease-in-out'
                }}></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  <HeartPulse size={18} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Possible Condition</span>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{result.diagnosis}</p>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--success)' }}>
                  <UserPlus size={18} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Specialist</span>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{result.doctor}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                   <Pill size={16} color="var(--primary)" /> Recommended Action Plan
                </h4>
                <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {result.actions.map((action, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <CheckCircle2 size={14} color="var(--success)" /> {action}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                   <Thermometer size={16} color="var(--warning)" /> Common Symptoms
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {result.commonSymptoms.map((sym, i) => (
                    <span key={i} style={{ padding: '0.25rem 0.6rem', backgroundColor: 'var(--bg-main)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {result.urgency === 'critical' && (
              <div style={{ 
                marginTop: '2rem', 
                padding: '1.25rem', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                color: 'var(--danger)', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'center',
                border: '1px solid var(--danger)'
              }}>
                <ShieldAlert size={28} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700 }}>EMERGENCY ALERT</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Seek immediate medical attention at the nearest Emergency Room.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default SymptomChecker;
