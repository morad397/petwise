import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const TRIAGE_LEVELS = [
  {
    id: 'critical',
    title: 'Critical',
    subtitle: 'Possible immediate threat to life or breathing.',
    icon: AlertCircle,
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fca5a5',
    examples: [
      'Difficulty breathing or choking',
      'Unconsciousness or severe collapse',
      'Profuse bleeding that won’t stop',
      'Suspected poisoning',
      'Seizures lasting more than 2 minutes'
    ],
    action: 'Seek emergency veterinary care IMMEDIATELY.'
  },
  {
    id: 'urgent',
    title: 'Urgent',
    subtitle: 'Symptoms that may require prompt veterinary attention.',
    icon: AlertTriangle,
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fcd34d',
    examples: [
      'Repeated vomiting or diarrhea',
      'Lethargy or severe weakness',
      'Inability to urinate',
      'Signs of severe pain (crying, panting, hiding)',
      'Eye injuries or sudden blindness'
    ],
    action: 'Contact a vet or emergency clinic for prompt assessment.'
  },
  {
    id: 'non-urgent',
    title: 'Non-Urgent',
    subtitle: 'Less severe symptoms that still may require professional advice.',
    icon: Info,
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    examples: [
      'Mild scratching or itching',
      'Small, superficial cuts',
      'Decreased appetite for 1 day (if otherwise acting normal)',
      'Minor limping',
      'Mild coughing without respiratory distress'
    ],
    action: 'Monitor closely and schedule a regular vet appointment.'
  }
];

export default function SosTriage() {
  const [activeLevel, setActiveLevel] = useState(null);

  return (
    <div className="section-card" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <h2 style={{ fontSize: '1.25rem', color: '#0f2138' }}>Quick Triage</h2>
      </div>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
        Select a category to view examples. <strong>These are educational aids, not a diagnosis.</strong>
      </p>

      <div style={{ display: 'grid', gap: '12px' }}>
        {TRIAGE_LEVELS.map(level => (
          <button
            key={level.id}
            onClick={() => setActiveLevel(level)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: 'white',
              border: `2px solid ${level.border}`,
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ background: level.bg, padding: '12px', borderRadius: '12px', display: 'flex' }}>
              <level.icon size={28} color={level.color} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: level.color, fontSize: '1.1rem' }}>{level.title}</h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>{level.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      {activeLevel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <button 
              onClick={() => setActiveLevel(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={24} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <activeLevel.icon size={32} color={activeLevel.color} />
              <h2 style={{ color: activeLevel.color, margin: 0, fontSize: '1.5rem' }}>{activeLevel.title}</h2>
            </div>
            
            <p style={{ color: '#334155', fontWeight: 600, fontSize: '1.05rem', marginBottom: '16px' }}>
              {activeLevel.subtitle}
            </p>

            <div style={{ background: activeLevel.bg, border: `1px solid ${activeLevel.border}`, borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <h4 style={{ color: activeLevel.color, marginTop: 0, marginBottom: '12px' }}>Examples:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeLevel.examples.map((ex, i) => <li key={i}>{ex}</li>)}
              </ul>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #94a3b8', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#0f2138' }}>Recommended Action:</h4>
              <p style={{ margin: 0, color: '#334155' }}>{activeLevel.action}</p>
            </div>

            <div style={{ padding: '16px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '24px' }}>
              <strong>Important Disclaimer:</strong> PetWise does not provide a veterinary diagnosis. If you are unsure or your pet’s condition is worsening, contact a licensed veterinarian immediately.
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setActiveLevel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
