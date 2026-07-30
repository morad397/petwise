import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Search, Clock, AlertCircle } from 'lucide-react';

// Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function isClinicOpen(clinic) {
  if (clinic.isOpen24Hours) return { status: 'Open 24 Hours', color: '#10b981' };
  if (!clinic.openingHours) return { status: 'Hours Unavailable', color: '#64748b' };
  
  // Real check based on openingHours { start: "09:00", end: "17:00" }
  const now = new Date();
  const currentHours = now.getHours();
  const currentMins = now.getMinutes();
  const currentTime = currentHours + (currentMins / 60);

  const [startH, startM] = clinic.openingHours.start.split(':').map(Number);
  const [endH, endM] = clinic.openingHours.end.split(':').map(Number);
  
  const startTime = startH + (startM / 60);
  const endTime = endH + (endM / 60);

  if (currentTime >= startTime && currentTime <= endTime) {
    return { status: 'Open Now', color: '#10b981' };
  }
  return { status: 'Closed', color: '#ef4444' };
}

export default function SosClinics({ allClinics }) {
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, denied, unavailable
  const [userCoords, setUserCoords] = useState(null);
  const [searchCity, setSearchCity] = useState('');

  // Filter for ACTIVE emergency clinics
  const emergencyClinics = allClinics.filter(c => c.status === 'ACTIVE' && c.isEmergencyClinic);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }
    
    setLocationStatus('loading');
    
    // NOTE: In development on HTTP without localhost, this might auto-fail.
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        setLocationStatus('success');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('unavailable');
        }
      }
    );
  };

  // Calculate distances and sort
  const processedClinics = emergencyClinics.map(clinic => {
    let dist = null;
    if (userCoords && clinic.latitude && clinic.longitude) {
      dist = getDistanceFromLatLonInKm(userCoords.lat, userCoords.lon, clinic.latitude, clinic.longitude);
    }
    return { ...clinic, distance: dist };
  });

  // Filter by city if denied location
  let displayedClinics = processedClinics;
  if (locationStatus === 'denied' || locationStatus === 'unavailable') {
    if (searchCity.trim()) {
      displayedClinics = displayedClinics.filter(c => c.city?.toLowerCase().includes(searchCity.toLowerCase()) || c.address?.toLowerCase().includes(searchCity.toLowerCase()));
    }
  } else if (userCoords) {
    displayedClinics = displayedClinics.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }

  return (
    <div id="nearest-clinics" className="section-card">
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#0f2138' }}>Nearby Emergency Clinics</h2>
      </div>

      {/* Map Placeholder */}
      <div style={{ background: '#e2e8f0', borderRadius: '12px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid #cbd5e1' }}>
        <MapPin size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
        <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>Interactive clinic map will be available after map-service integration.</p>
      </div>

      {/* Location Bar */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {locationStatus === 'idle' && (
          <div>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#334155' }}>Allow location access to find the nearest open emergency clinics automatically.</p>
            <button className="btn btn-primary" onClick={handleRequestLocation} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} /> Use My Location
            </button>
          </div>
        )}
        
        {locationStatus === 'loading' && <p style={{ margin: 0, color: '#3b82f6' }}>Determining your location...</p>}
        
        {locationStatus === 'success' && <p style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}><Navigation size={18} /> Location access granted. Sorting by distance.</p>}
        
        {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
          <div>
            <p style={{ margin: '0 0 8px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> Location access was not granted or is unavailable. Search for a clinic manually.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Search by city or address..." 
                value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <button className="btn btn-secondary"><Search size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Clinics List */}
      {emergencyClinics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '12px' }}>
          <AlertCircle size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h3 style={{ color: '#475569', margin: '0 0 8px 0' }}>No emergency clinics are currently configured in PetWise.</h3>
        </div>
      ) : displayedClinics.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No clinics match your search.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayedClinics.map(clinic => {
            const openInfo = isClinicOpen(clinic);
            const sanitizedPhone = clinic.phone?.replace(/[^\d+]/g, '') || '';
            const encodedAddress = encodeURIComponent(`${clinic.name} ${clinic.address} ${clinic.city || ''}`);
            
            // Map link logic
            const mapLink = (clinic.latitude && clinic.longitude) 
              ? `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`
              : `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

            return (
              <div key={clinic.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', color: '#0f2138', fontSize: '1.15rem' }}>{clinic.name}</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {clinic.address}{clinic.city ? `, ${clinic.city}` : ''} 
                      {clinic.distance !== null && <span style={{ marginLeft: '8px', color: '#3b82f6', fontWeight: 600 }}>({clinic.distance.toFixed(1)} km away)</span>}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ background: `${openInfo.color}15`, color: openInfo.color, padding: '4px 10px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {openInfo.status}
                    </span>
                  </div>
                </div>

                {clinic.emergencyServices && clinic.emergencyServices.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {clinic.emergencyServices.map((srv, idx) => (
                      <span key={idx} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px' }}>
                        {srv}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  {clinic.phone ? (
                    <a href={`tel:${sanitizedPhone}`} className="btn" style={{ background: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.95rem', textDecoration: 'none' }}>
                      <Phone size={16} /> Call {clinic.phone}
                    </a>
                  ) : (
                    <button disabled className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.95rem' }}>
                      <Phone size={16} /> No Phone Provided
                    </button>
                  )}
                  
                  <a href={mapLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.95rem', textDecoration: 'none' }}>
                    <Navigation size={16} /> Get Directions
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
