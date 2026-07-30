import React from 'react';
import { Phone, MapPin, AlertTriangle } from 'lucide-react';

export default function SosHero({ settings }) {
  
  const hasPhone = settings?.emergencyPhone && settings.emergencyPhone.trim().length > 0;
  
  // Clean phone number for tel: link (remove everything except numbers and +)
  const sanitizedPhone = hasPhone ? settings.emergencyPhone.replace(/[^\d+]/g, '') : '';

  const handleCall = (e) => {
    if (!hasPhone) {
      e.preventDefault();
      return;
    }
    
    const confirmMsg = `You are about to call ${settings.emergencyContactName || 'the emergency clinic'} at ${settings.emergencyPhone}.`;
    if (!window.confirm(confirmMsg)) {
      e.preventDefault();
    }
  };

  const scrollToClinics = () => {
    const clinicsSection = document.getElementById('nearest-clinics');
    if (clinicsSection) {
      clinicsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="section-card hero-panel dashboard-hero" style={{ background: '#0f2138', color: 'white', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: -50, left: 100, width: 150, height: 150, background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}></div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '6px 12px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, width: 'fit-content' }}>
          <AlertTriangle size={16} /> EMERGENCY MODE
        </div>
        
        <h1 style={{ color: 'white', margin: 0, fontSize: '2.5rem' }}>Emergency Support</h1>
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
          Get immediate help for your pet. Contact an emergency veterinary clinic or locate the nearest available clinic.
        </p>

        <div style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '20px', marginTop: '16px' }}>
          
          {hasPhone ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1.3rem' }}>{settings.emergencyContactName || 'Emergency Hotline'}</h3>
              <p style={{ margin: 0, color: '#fca5a5', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '1px' }}>{settings.emergencyPhone}</p>
              {settings.availabilityText && (
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{settings.availabilityText}</span>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ margin: 0, color: '#fca5a5' }}>No emergency hotline is currently configured.</h3>
              <p style={{ margin: 0, color: '#94a3b8' }}>Please view the emergency clinics list or contact your local vet.</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '24px' }}>
            <a 
              href={hasPhone ? `tel:${sanitizedPhone}` : '#'}
              onClick={handleCall}
              className="btn" 
              style={{ 
                background: hasPhone ? '#ef4444' : '#475569', 
                color: 'white', 
                border: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '12px 24px',
                fontSize: '1.1rem',
                cursor: hasPhone ? 'pointer' : 'not-allowed',
                pointerEvents: hasPhone ? 'auto' : 'none',
                opacity: hasPhone ? 1 : 0.7
              }}
            >
              <Phone size={20} />
              Call Emergency Clinic
            </a>

            <button 
              onClick={scrollToClinics}
              className="btn" 
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                color: 'white', 
                border: '1px solid rgba(255,255,255,0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '12px 24px',
                fontSize: '1.1rem'
              }}
            >
              <MapPin size={20} />
              Find Nearest Clinic
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
