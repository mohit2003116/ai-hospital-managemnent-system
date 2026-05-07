import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertCircle, 
  UserPlus, 
  Send, 
  Loader2, 
  Info, 
  CheckCircle2, 
  ShieldAlert, 
  HeartPulse, 
  Pill, 
  Thermometer, 
  ChevronRight, 
  Stethoscope, 
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DISEASE_DATABASE = [
  {
    keywords: ['chest pain', 'heart', 'shortness of breath', 'arm pain', 'sweating', 'palpitations'],
    diagnosis: 'Acute Coronary Syndrome / Angina',
    department: 'Cardiology',
    doctor: 'Dr. Sarah Wilson',
    urgency: 'critical',
    confidence: 92,
    actions: ['Go to Emergency Room', 'Do not drive yourself', 'Take aspirin if prescribed'],
    commonSymptoms: ['Chest pressure', 'Pain radiating to jaw', 'Nausea']
  },
  {
    keywords: ['fever', 'cough', 'sore throat', 'chills', 'body ache', 'nose', 'congestion'],
    diagnosis: 'Influenza (Flu) or Respiratory Infection',
    department: 'General Medicine',
    doctor: 'General Physician',
    urgency: 'medium',
    confidence: 85,
    actions: ['Rest and hydrate', 'Monitor temperature', 'Consult GP if symptoms persist'],
    commonSymptoms: ['Fatigue', 'Congestion', 'Mild headache']
  },
  {
    keywords: ['headache', 'vision', 'dizziness', 'light sensitivity', 'migraine', 'aura', 'temple'],
    diagnosis: 'Migraine or Cluster Headache',
    department: 'Neurology',
    doctor: 'Dr. James Miller',
    urgency: 'medium',
    confidence: 78,
    actions: ['Rest in a dark room', 'Avoid bright screens', 'Check blood pressure'],
    commonSymptoms: ['Nausea', 'Pulsating pain', 'Aura']
  },
  {
    keywords: ['stomach', 'abdomen', 'nausea', 'vomiting', 'diarrhea', 'cramp', 'bloating'],
    diagnosis: 'Gastroenteritis or Acute Gastritis',
    department: 'Gastroenterology',
    doctor: 'Gastroenterologist',
    urgency: 'medium',
    confidence: 82,
    actions: ['Drink electrolytes', 'Brat diet (Bananas, Rice, Applesauce)', 'Avoid dairy'],
    commonSymptoms: ['Cramping', 'Loss of appetite', 'Low-grade fever']
  },
  {
    keywords: ['joint', 'bone', 'fracture', 'knee', 'back pain', 'sprain', 'swelling'],
    diagnosis: 'Orthopedic Musculoskeletal Injury',
    department: 'Orthopedics',
    doctor: 'Orthopedic Surgeon',
    urgency: 'normal',
    confidence: 75,
    actions: ['R.I.C.E (Rest, Ice, Compression, Elevation)', 'Limit weight bearing', 'Pain relief'],
    commonSymptoms: ['Swelling', 'Limited mobility', 'Bruising']
  },
  {
    keywords: ['skin', 'rash', 'itch', 'hives', 'allergy', 'redness', 'eczema'],
    diagnosis: 'Dermatitis or Allergic Reaction',
    department: 'Dermatology',
    doctor: 'Dermatologist',
    urgency: 'normal',
    confidence: 88,
    actions: ['Apply soothing lotion', 'Identify allergens', 'Avoid scratching'],
    commonSymptoms: ['Redness', 'Scaling', 'Small bumps']
  },
  {
    keywords: ['thirst', 'urination', 'fatigue', 'weight loss', 'sugar', 'blurry vision'],
    diagnosis: 'Type 2 Diabetes Mellitus',
    department: 'Endocrinology',
    doctor: 'Endocrinologist',
    urgency: 'medium',
    confidence: 70,
    actions: ['Check blood sugar levels', 'Monitor diet', 'Schedule fasting blood test'],
    commonSymptoms: ['Increased thirst', 'Frequent urination', 'Blurred vision']
  },
  {
    keywords: ['wheezing', 'breath', 'chest tightness', 'asthma', 'inhaler', 'pollen'],
    diagnosis: 'Bronchial Asthma / Bronchitis',
    department: 'Pulmonology',
    doctor: 'Pulmonologist',
    urgency: 'medium',
    confidence: 80,
    actions: ['Use rescue inhaler', 'Avoid triggers', 'Check oxygen saturation'],
    commonSymptoms: ['Shortness of breath', 'Coughing at night', 'Wheezing']
  }
];

const QUICK_SYMPTOMS = [
  'Fever', 'Chest Pain', 'Headache', 'Stomach Ache', 
  'Joint Pain', 'Skin Rash', 'Shortness of Breath', 'Cough'
];

function SymptomChecker() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const analyzeSymptoms = () => {
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    setResults(null);

    // Simulate AI deep analysis
    setTimeout(() => {
      const text = symptoms.toLowerCase();
      
      // Smart Multi-Match Scoring
      const matchedResults = DISEASE_DATABASE.map(disease => {
        let score = 0;
        disease.keywords.forEach(keyword => {
          if (text.includes(keyword)) score += 1;
        });
        
        // Add partial matches for common terms
        const words = text.split(/\s+/);
        words.forEach(word => {
          if (word.length > 3 && disease.keywords.some(k => k.includes(word) || word.includes(k))) {
            score += 0.5;
          }
        });

        return { ...disease, matchScore: score };
      })
      .filter(d => d.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

      if (matchedResults.length > 0) {
        // Normalize confidence based on match score
        const topResult = { ...matchedResults[0] };
        setResults(matchedResults.slice(0, 3)); // Top 3 possibilities
      } else {
        setResults([{
          diagnosis: 'General Malaise / Non-Specific Symptoms',
          department: 'General Medicine',
          doctor: 'General Physician',
          urgency: 'normal',
          confidence: 40,
          actions: ['Monitor symptoms for 24h', 'Maintain hydration', 'Rest'],
          commonSymptoms: ['Mild fatigue', 'General discomfort'],
          matchScore: 0
        }]);
      }
      setIsAnalyzing(false);
      setActiveStep(1);
    }, 2500);
  };

  const handleQuickSymptom = (s) => {
    setSymptoms(prev => prev ? `${prev}, ${s}` : s);
  };

  return (
    <div className="disease-predictor animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="ai-icon-wrapper">
            <Sparkles className="ai-sparkle" size={24} />
          </div>
          <div>
            <h1 className="page-title">Smart Disease Predictor</h1>
            <p className="page-subtitle">Advanced AI-powered symptom analysis and department recommendation</p>
          </div>
        </div>
      </div>

      <div className="predictor-container">
        {/* Input Section */}
        <div className={`input-section ${activeStep === 1 ? 'minimized' : ''}`}>
          <div className="card predictor-card">
            <div className="card-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Step 1: Symptom Input</h2>
              <div className="step-indicator">Active Analysis</div>
            </div>
            
            <div className="form-group">
              <label className="form-label">How are you feeling? Describe in detail:</label>
              <textarea
                className="form-control predictor-input"
                rows="5"
                placeholder="E.g., I've been experiencing sharp chest pain when breathing and a dry cough for two days..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              ></textarea>
            </div>

            <div className="quick-tags">
              <span className="tags-label">Quick Add:</span>
              {QUICK_SYMPTOMS.map(s => (
                <button 
                  key={s} 
                  className="symptom-tag"
                  onClick={() => handleQuickSymptom(s)}
                >
                  +{s}
                </button>
              ))}
            </div>

            <button 
              className="btn btn-primary btn-analyze" 
              onClick={analyzeSymptoms}
              disabled={isAnalyzing || !symptoms.trim()}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={20} className="spin-animation" />
                  <span>Processing Clinical Data...</span>
                </>
              ) : (
                <>
                  <Activity size={20} />
                  <span>Analyze Symptoms</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
            
            <div className="disclaimer">
              <AlertCircle size={14} />
              <span>Medical Disclaimer: AI predictions are based on patterns and not a definitive diagnosis. Always consult a certified professional.</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {isAnalyzing && (
            <div className="analysis-loading card">
              <div className="dna-loader">
                <div className="dna-strand"></div>
                <div className="dna-strand"></div>
              </div>
              <h3>Analyzing Symptoms Against Medical Database</h3>
              <p>Evaluating patterns for Respiratory, Cardiovascular, and Neurological conditions...</p>
            </div>
          )}

          {results && !isAnalyzing && (
            <div className="analysis-results">
              <div className="results-summary card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={20} color="var(--primary)" />
                    Prediction Analysis
                  </h3>
                  <button className="btn btn-outline" onClick={() => setActiveStep(0)}>
                    Reset Analysis
                  </button>
                </div>

                <div className="primary-prediction">
                  <div className={`prediction-header urgency-${results[0].urgency}`}>
                    <div className="urgency-badge">
                      {results[0].urgency === 'critical' ? <AlertCircle size={14} /> : <Info size={14} />}
                      {results[0].urgency.toUpperCase()} PRIORITY
                    </div>
                    <div className="confidence-score">
                      <Sparkles size={14} />
                      <span>{results[0].confidence}% AI Confidence</span>
                    </div>
                  </div>

                  <div className="prediction-main">
                    <div className="diagnosis-info">
                      <label>Most Likely Condition</label>
                      <h2>{results[0].diagnosis}</h2>
                    </div>
                    <div className="department-recommendation">
                      <div className="dept-icon">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <label>Recommended Department</label>
                        <p>{results[0].department}</p>
                      </div>
                    </div>
                  </div>

                  <div className="prediction-footer">
                    <div className="specialist-info">
                      <Stethoscope size={18} />
                      <span>Suggested Specialist: <strong>{results[0].doctor}</strong></span>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/appointments')}>
                      Book Consult Now <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="action-plan-grid">
                  <div className="plan-column">
                    <h4><CheckCircle2 size={16} /> Recommended Action Plan</h4>
                    <ul>
                      {results[0].actions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="plan-column">
                    <h4><Thermometer size={16} /> Observed Patterns</h4>
                    <div className="symptom-chips">
                      {results[0].commonSymptoms.map((s, i) => (
                        <span key={i} className="symptom-chip">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {results.length > 1 && (
                <div className="secondary-predictions">
                  <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Other Possible Conditions</h4>
                  <div className="secondary-grid">
                    {results.slice(1).map((r, i) => (
                      <div key={i} className="secondary-card card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span className="confidence-tag">{r.confidence}% Match</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>{r.department}</span>
                        </div>
                        <h5>{r.diagnosis}</h5>
                        <p>{r.doctor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .disease-predictor {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .predictor-container {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 992px) {
          .predictor-container {
            grid-template-columns: 1fr;
          }
        }

        .predictor-card {
          padding: 2rem;
          border-radius: var(--radius-lg);
          border-top: 4px solid var(--primary);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .step-indicator {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary);
          padding: 0.25rem 0.5rem;
          background: rgba(0, 102, 255, 0.1);
          border-radius: 4px;
        }

        .predictor-input {
          border: 1px solid var(--border-color);
          padding: 1.25rem;
          font-size: 1rem;
          line-height: 1.6;
          border-radius: var(--radius-md);
          background-color: #F8FAFC;
        }

        .quick-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 1.5rem 0 2rem;
        }

        .tags-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          width: 100%;
          margin-bottom: 0.25rem;
        }

        .symptom-tag {
          padding: 0.35rem 0.75rem;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .symptom-tag:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(0, 102, 255, 0.05);
        }

        .btn-analyze {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          border-radius: var(--radius-md);
          gap: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 102, 255, 0.2);
        }

        .disclaimer {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #F1F5F9;
          border-radius: var(--radius-md);
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        /* Analysis Results */
        .primary-prediction {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-md);
        }

        .prediction-header {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
        }

        .urgency-critical { background-color: rgba(239, 68, 68, 0.05); color: var(--danger); border-left: 6px solid var(--danger); }
        .urgency-medium { background-color: rgba(245, 158, 11, 0.05); color: var(--warning); border-left: 6px solid var(--warning); }
        .urgency-normal { background-color: rgba(16, 185, 129, 0.05); color: var(--success); border-left: 6px solid var(--success); }

        .urgency-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .confidence-score {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .prediction-main {
          padding: 2rem 1.5rem;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2rem;
          align-items: center;
        }

        .diagnosis-info label, .department-recommendation label {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-muted);
          display: block;
          margin-bottom: 0.5rem;
        }

        .diagnosis-info h2 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-main);
        }

        .department-recommendation {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: var(--bg-main);
          border-radius: var(--radius-md);
        }

        .dept-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        .department-recommendation p {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0;
        }

        .prediction-footer {
          padding: 1.25rem 1.5rem;
          background: #F8FAFC;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
        }

        .specialist-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .action-plan-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .plan-column h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .plan-column ul {
          padding-left: 1.25rem;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .plan-column li {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .symptom-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .symptom-chip {
          padding: 0.25rem 0.75rem;
          background: #F1F5F9;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .secondary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .secondary-card {
          padding: 1.25rem;
          border-bottom: 3px solid var(--border-color);
        }

        .secondary-card h5 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 0.25rem;
        }

        .secondary-card p {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        .confidence-tag {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--success);
        }

        /* Animations */
        .ai-icon-wrapper {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--primary) 0%, #4F46E5 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
        }

        .ai-sparkle {
          animation: sparkle 2s infinite ease-in-out;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        .spin-animation {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .dna-loader {
          height: 60px;
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 1.5rem;
        }

        .analysis-loading {
          padding: 3rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
}

export default SymptomChecker;
