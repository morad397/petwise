import React, { useState } from 'react';
import { BookOpen, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export default function SosFirstAid({ guides = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!guides || guides.length === 0) {
    return (
      <div className="section-card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ShieldAlert size={24} color="#64748b" />
          <h2 style={{ fontSize: '1.25rem', color: '#64748b', margin: 0 }}>First Aid Quick Guide</h2>
        </div>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Emergency guidance content is currently awaiting professional review. Please consult a licensed veterinarian.
        </p>
      </div>
    );
  }

  const toggleGuide = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="section-card">
      <div className="card-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={24} color="#10b981" />
        <h2 style={{ fontSize: '1.25rem', color: '#0f2138', margin: 0 }}>First Aid Quick Guide</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {guides.map(guide => {
          const isExpanded = expandedId === guide.id;

          return (
            <div key={guide.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <button 
                onClick={() => toggleGuide(guide.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: isExpanded ? '#f8fafc' : 'white',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ color: '#0f2138', fontSize: '1.05rem' }}>{guide.title}</strong>
                  {!isExpanded && <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{guide.summary}</span>}
                </div>
                {isExpanded ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
              </button>

              {isExpanded && (
                <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
                  
                  {guide.warning && (
                    <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                      <span>{guide.warning}</span>
                    </div>
                  )}

                  <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>Instructions:</h4>
                  <ol style={{ margin: 0, paddingLeft: '20px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {guide.instructions.map((step, idx) => (
                      <li key={idx} style={{ lineHeight: 1.5 }}>{step}</li>
                    ))}
                  </ol>

                  <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Source: {guide.sourceUrl ? <a href={guide.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>{guide.sourceName}</a> : guide.sourceName}</span>
                    <span>Reviewed: {new Date(guide.reviewedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
        These guides do not replace professional emergency veterinary care. Do not induce vomiting or administer medication without explicit direction from a vet.
      </p>
    </div>
  );
}
