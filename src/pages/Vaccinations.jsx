import { useParams, Link } from 'react-router-dom';

const sampleVaccinations = [
  { id: 1, petId: 1, name: 'Rabies', date: '2026-01-15', nextDue: '2027-01-15', status: 'Done' },
  { id: 2, petId: 1, name: 'FVRCP', date: '2025-11-20', nextDue: '2026-11-20', status: 'Done' },
  { id: 3, petId: 2, name: 'Rabies', date: '2026-02-10', nextDue: '2027-02-10', status: 'Done' },
  { id: 4, petId: 2, name: 'DHPP', date: '2025-12-05', nextDue: '2026-12-05', status: 'Done' },
  { id: 5, petId: 2, name: 'Bordetella', date: '2026-06-01', nextDue: '2026-12-01', status: 'Upcoming' },
];

const sampleMedications = [
  { id: 1, petId: 1, name: 'Flea Treatment', frequency: 'Monthly', nextDose: '2026-07-10' },
  { id: 2, petId: 2, name: 'Heartworm Prevention', frequency: 'Monthly', nextDose: '2026-07-15' },
  { id: 3, petId: 2, name: 'Joint Supplement', frequency: 'Daily', nextDose: '2026-06-24' },
];

function Vaccinations() {
  const { id } = useParams();
  const vaccinations = sampleVaccinations.filter((v) => v.petId === Number(id));
  const medications = sampleMedications.filter((m) => m.petId === Number(id));

  return (
    <div>
      <Link to={`/pets/${id}`}>← Back to Pet Profile</Link>

      <h1>Vaccinations</h1>
      {vaccinations.length === 0 ? (
        <p>No vaccinations recorded.</p>
      ) : (
        vaccinations.map((vac) => (
          <div key={vac.id}>
            <h3>{vac.name}</h3>
            <p>Date: {vac.date}</p>
            <p>Next Due: {vac.nextDue}</p>
            <p>Status: {vac.status}</p>
            <hr />
          </div>
        ))
      )}

      <h1>Medications</h1>
      {medications.length === 0 ? (
        <p>No medications recorded.</p>
      ) : (
        medications.map((med) => (
          <div key={med.id}>
            <h3>{med.name}</h3>
            <p>Frequency: {med.frequency}</p>
            <p>Next Dose: {med.nextDose}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Vaccinations;