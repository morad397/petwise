import { useState, useEffect } from 'react';
import PetImage from '../../components/PetImage';
import { getPetById } from '../../services/dataService';

function StaffPatients() {
  const [patients, setPatients] = useState([]);
  const staffMember = JSON.parse(localStorage.getItem('petwise-user') || '{}');

  useEffect(() => {
    // 1. Get all appointments for this clinic
    const allAppointments = JSON.parse(localStorage.getItem('petwise-appointments') || '[]');
    const clinicAppointments = staffMember.clinicId 
      ? allAppointments.filter(app => String(app.clinicId) === String(staffMember.clinicId))
      : allAppointments;

    // 2. Extract unique pet IDs
    const uniquePetIds = [...new Set(clinicAppointments.map(app => app.petId).filter(Boolean))];

    // 3. Fetch full pet objects
    const loadedPatients = uniquePetIds.map(id => getPetById(id)).filter(Boolean);
    
    // Fallback logic if appointments contain petName but no actual Pet record in DB yet
    // Just to make the demo robust if the user hasn't added pets properly.
    if (loadedPatients.length === 0 && clinicAppointments.length > 0) {
      const fallbackPatients = [];
      const seen = new Set();
      clinicAppointments.forEach(app => {
        if (!seen.has(app.petId || app.petName)) {
          seen.add(app.petId || app.petName);
          fallbackPatients.push({
            id: app.petId,
            name: app.petName,
            species: app.petSpecies,
            imageUrl: app.petImage,
            ownerName: app.ownerName
          });
        }
      });
      setPatients(fallbackPatients);
    } else {
      setPatients(loadedPatients);
    }
    
  }, [staffMember.clinicId]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#0f2138' }}>Clinic Patients</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Pets connected to appointments at your clinic.</p>
      </div>

      <section className="section-card">
        <div className="pet-cards">
          {patients.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <p>No patients are currently connected to this clinic.</p>
            </div>
          ) : (
            patients.map((pet, idx) => (
              <article key={pet.id || idx} className="pet-card">
                <div className="pet-card-header">
                  <PetImage pet={pet} style={{ width: 52, height: 52, borderRadius: 18, objectFit: 'cover' }} />
                  <div>
                    <strong style={{ color: '#0f2138' }}>{pet.name}</strong>
                    <br />
                    <small style={{ color: '#64748b' }}>{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</small>
                  </div>
                  <button className="btn btn-secondary" onClick={() => alert("Patient summary (Vaccinations, Medications, History) would open here.")}>
                    View Summary
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default StaffPatients;
