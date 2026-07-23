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
    <div className="app-shell">
      <header className="page-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">PetPal</span>
        </div>
        <nav className="main-nav">
          <Link to={`/pets/${id}`}>Back to Profile</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <main className="page-inner">
        <section className="section-card">
          <p className="eyebrow">Clinic history</p>
          <h1>Vet Visits</h1>
          <div className="timeline-list">
            {visits.length === 0 ? (
              <p className="empty-state">No vet visits recorded.</p>
            ) : (
              visits.map((visit) => (
                <article className="event-card" key={visit.id}>
                  <div className="event-time">{visit.date}</div>
                  <div>
                    <h3>{visit.reason}</h3>
                    <p>Vet: {visit.vet}</p>
                    <p>{visit.notes}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default VetVisits;