import { useState, useEffect } from 'react';
import SosHero from '../components/sos/SosHero';
import SosTriage from '../components/sos/SosTriage';
import SosFirstAid from '../components/sos/SosFirstAid';
import SosClinics from '../components/sos/SosClinics';

import { getEmergencySettings, getActiveGuides } from '../services/emergencyService';
import { getClinics } from '../services/dataService';

export default function Sos() {
  const [settings, setSettings] = useState(null);
  const [guides, setGuides] = useState([]);
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    // Set by the admin on the System page, shared with every user
    getEmergencySettings()
      .then(setSettings)
      .catch((error) => console.error('Failed to load emergency settings', error));
    getActiveGuides()
      .then(setGuides)
      .catch((error) => console.error('Failed to load first-aid guides', error));
    getClinics()
      .then(setClinics)
      .catch((error) => console.error('Failed to load clinics', error));
  }, []);

  return (
    <>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          
          <SosHero settings={settings} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
            
            {/* LEFT COLUMN: Triage & First Aid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <SosTriage />
              <SosFirstAid guides={guides} />
            </div>

            {/* RIGHT COLUMN: Map & Clinics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <SosClinics allClinics={clinics} />
            </div>

          </div>

          {settings?.emergencyDisclaimer && (
            <div style={{ marginTop: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              {settings.emergencyDisclaimer}
            </div>
          )}
        </div>
      </>
  );
}
