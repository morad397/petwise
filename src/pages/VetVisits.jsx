import { useParams, Link } from 'react-router-dom';

const sampleVisits = [
  { id: 1, petId: 1, date: '2026-01-15', vet: 'Dr. Cohen', reason: 'Annual checkup', notes: 'Healthy, weight is normal' },
  { id: 2, petId: 1, date: '2025-08-20', vet: 'Dr. Cohen', reason: 'Ear infection', notes: 'Prescribed ear drops for 7 days' },
  { id: 3, petId: 2, date: '2026-02-10', vet: 'Dr. Levy', reason: 'Annual checkup', notes: 'Slight weight gain, recommended more exercise' },
  { id: 4, petId: 2, date: '2025-10-05', vet: 'Dr. Levy', reason: 'Limping on front leg', notes: 'X-ray done, no fracture, rest recommended' },
];

function VetVisits() {
  const { id } = useParams();
  const visits = sampleVisits.filter((v) => v.petId === Number(id));

  return (
    <div>
      <Link to={`/pets/${id}`}>← Back to Pet Profile</Link>
      <h1>Vet Visits</h1>

      {visits.length === 0 ? (
        <p>No vet visits recorded.</p>
      ) : (
        visits.map((visit) => (
          <div key={visit.id}>
            <h3>{visit.date}</h3>
            <p>Vet: {visit.vet}</p>
            <p>Reason: {visit.reason}</p>
            <p>Notes: {visit.notes}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default VetVisits;