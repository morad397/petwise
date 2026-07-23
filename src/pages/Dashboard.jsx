import { Link } from 'react-router-dom';

const samplePets = [
  {
    id: 1,
    name: 'Luna',
    species: 'Cat',
    breed: 'British Shorthair',
    age: '3 years',
    image:
      'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Rex',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: '5 years',
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
  },
];

function Dashboard() {
  return (
    <div className="app-shell">
      <header className="page-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">PetPal</span>
        </div>

        <nav className="main-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/">Logout</Link>
        </nav>
      </header>

      <main className="page-inner dashboard-layout">
        <section className="section-card hero-panel">
          <div>
            <p className="eyebrow">Your pet family</p>
            <h1>Welcome back, Mia</h1>
            <p>Keep every pet healthy, scheduled, and cared for from one elegant home dashboard.</p>
          </div>
          <Link to="/add-pet" className="btn btn-primary">+ Add New Pet</Link>
        </section>

        <section className="metrics-grid">
          <div className="metric-card">
            <strong>2</strong>
            <span>Active pets</span>
          </div>
          <div className="metric-card">
            <strong>9</strong>
            <span>Upcoming reminders</span>
          </div>
          <div className="metric-card">
            <strong>96%</strong>
            <span>Care completion</span>
          </div>
        </section>

        <section className="pet-grid">
          {samplePets.map((pet) => (
            <Link key={pet.id} to={`/pets/${pet.id}`} className="pet-card-link">
              <article className="pet-summary-card">
                <img src={pet.image} alt={pet.name} className="pet-card-media" />
                <div className="pet-card-body">
                  <div className="pet-card-heading">
                    <div>
                      <h3>{pet.name}</h3>
                      <p>{pet.species} • {pet.breed}</p>
                    </div>
                    <span className="status-pill">Healthy</span>
                  </div>
                  <div className="pet-card-meta">
                    <span>Age: {pet.age}</span>
                    <span>Next check: 3 days</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;