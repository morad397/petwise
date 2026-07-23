import { useParams, Link } from 'react-router-dom';

const sampleWeightLog = [
  { id: 1, petId: 1, date: '2026-06-01', weight: '4.2 kg' },
  { id: 2, petId: 1, date: '2026-05-01', weight: '4.1 kg' },
  { id: 3, petId: 1, date: '2026-04-01', weight: '4.0 kg' },
  { id: 4, petId: 2, date: '2026-06-01', weight: '28 kg' },
  { id: 5, petId: 2, date: '2026-05-01', weight: '27.5 kg' },
  { id: 6, petId: 2, date: '2026-04-01', weight: '27 kg' },
];

const sampleHabits = [
  { id: 1, petId: 1, habit: 'Sleeps 14 hours a day', status: 'Normal' },
  { id: 2, petId: 1, habit: 'Drinks water 3-4 times daily', status: 'Normal' },
  { id: 3, petId: 2, habit: 'Walks twice a day', status: 'Normal' },
  { id: 4, petId: 2, habit: 'Scratches ears frequently', status: 'Monitor' },
];

function WeightHabits() {
  const { id } = useParams();
  const weightLog = sampleWeightLog.filter((w) => w.petId === Number(id));
  const habits = sampleHabits.filter((h) => h.petId === Number(id));

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
          <p className="eyebrow">Progress tracking</p>
          <h1>Weight Log</h1>
          <div className="card-grid">
            {weightLog.length === 0 ? (
              <p className="empty-state">No weight records found.</p>
            ) : (
              weightLog.map((entry) => (
                <article className="mini-card" key={entry.id}>
                  <h3>{entry.date}</h3>
                  <p>Weight: {entry.weight}</p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="section-card margin-top-24">
          <h1>Daily Habits</h1>
          <div className="card-grid">
            {habits.length === 0 ? (
              <p className="empty-state">No habits recorded.</p>
            ) : (
              habits.map((habit) => (
                <article className="mini-card" key={habit.id}>
                  <h3>{habit.habit}</h3>
                  <span className="status-pill">{habit.status}</span>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default WeightHabits;