import { useState, useEffect } from 'react';
import PetImage from '../../components/PetImage';
import { getClinicPatients } from '../../services/dataService';
import { vaccinationsApi, treatmentsApi, weightsApi, formatDate } from '../../services/medicalService';

function PatientSummary({ pet }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Staff may read these records because the pet has an appointment at their clinic
    Promise.all([vaccinationsApi.list(pet.id), treatmentsApi.list(pet.id), weightsApi.list(pet.id)])
      .then(([vaccinations, treatments, weights]) => setData({ vaccinations, treatments, weights }))
      .catch((e) => setError(e.message));
  }, [pet.id]);

  if (error) return <p style={{ color: '#d93025' }}>{error}</p>;
  if (!data) return <p style={{ color: '#64748b' }}>Loading medical history…</p>;

  const latestWeight = data.weights[0];
  const section = (title, items, render) => (
    <div style={{ marginTop: '12px' }}>
      <strong style={{ color: '#0f2138' }}>{title}</strong>
      {items.length === 0 ? (
        <p style={{ margin: '4px 0 0', color: '#94a3b8' }}>None recorded</p>
      ) : (
        <ul style={{ margin: '4px 0 0', paddingLeft: '18px', color: '#4a5568' }}>{items.slice(0, 5).map(render)}</ul>
      )}
    </div>
  );

  return (
    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eef1f6' }}>
      <p style={{ margin: 0, color: '#4a5568' }}>
        Owner: <strong>{pet.ownerName}</strong> • Visits at this clinic: {pet.appointmentCount}
        {pet.age != null && ` • Age: ${pet.age}`}
        {latestWeight ? ` • Weight: ${latestWeight.weightKg} kg (${formatDate(latestWeight.recordedDate)})` : pet.weightKg != null ? ` • Weight: ${pet.weightKg} kg` : ''}
      </p>
      {section('Vaccinations', data.vaccinations, (v) => (
        <li key={v.id}>{v.vaccineName}: {formatDate(v.dateAdministered)}{v.nextDueDate ? ` (next ${formatDate(v.nextDueDate)})` : ''}</li>
      ))}
      {section('Medications', data.treatments.filter((t) => t.kind === 'MEDICATION'), (m) => (
        <li key={m.id}>{m.medication} for {m.diagnosis} ({formatDate(m.treatmentDate)})</li>
      ))}
      {section('Vet visits', data.treatments.filter((t) => t.kind === 'VET_VISIT'), (v) => (
        <li key={v.id}>{formatDate(v.treatmentDate)}: {v.diagnosis}{v.clinicName ? ` at ${v.clinicName}` : ''}{v.notes ? ` ${v.notes}` : ''}</li>
      ))}
    </div>
  );
}

function StaffPatients() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    // The server returns pets that have appointments at this staff member's clinic
    getClinicPatients()
      .then(setPatients)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#0f2138' }}>Clinic Patients</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Pets connected to appointments at your clinic.</p>
      </div>

      {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}

      <section className="section-card">
        <div className="pet-cards">
          {isLoading ? (
            <p>Loading patients…</p>
          ) : patients.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <p>No patients are currently connected to this clinic.</p>
            </div>
          ) : (
            patients.map((pet) => (
              <article key={pet.id} className="pet-card">
                <div className="pet-card-header">
                  <PetImage pet={pet} style={{ width: 52, height: 52, borderRadius: 18, objectFit: 'cover' }} />
                  <div>
                    <strong style={{ color: '#0f2138' }}>{pet.name}</strong>
                    <br />
                    <small style={{ color: '#64748b' }}>
                      {pet.species} {pet.breed ? `• ${pet.breed}` : ''} • last visit {formatDate(pet.lastAppointmentDate)}
                    </small>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setOpenId(openId === pet.id ? null : pet.id)}>
                    {openId === pet.id ? 'Hide Summary' : 'View Summary'}
                  </button>
                </div>
                {openId === pet.id && <PatientSummary pet={pet} />}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default StaffPatients;
