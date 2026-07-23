import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Dashboard() {
  const [pets, setPets] = useState([]);
  const [userName, setUserName] = useState('Pet Owner');

  useEffect(() => {
    const savedPets = JSON.parse(localStorage.getItem('petwise-pets') || '[]');
    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');

    setPets(savedPets);
    setUserName(savedUser.fullName || 'Pet Owner');
  }, []);

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
            <h1>Welcome back, {userName}</h1>
            <p>Keep every pet healthy, scheduled, and cared for from one elegant home dashboard.</p>
          </div>
          <Link to="/add-pet" className="btn btn-primary">+ Add New Pet</Link>
        </section>

        <section className="metrics-grid">
          <div className="metric-card">
            <strong>{pets.length}</strong>
            <span>Active pets</span>
          </div>
          <div className="metric-card">
            <strong>{Math.max(1, pets.length * 3)}</strong>
            <span>Upcoming reminders</span>
          </div>
          <div className="metric-card">
            <strong>96%</strong>
            <span>Care completion</span>
          </div>
        </section>

        {pets.length === 0 ? (
          <section className="section-card empty-dashboard-state">
            <h2>No pets added yet</h2>
            <p>Add your first dog or cat to start building your care dashboard.</p>
            <Link to="/add-pet" className="btn btn-primary">Add Your First Pet</Link>
          </section>
        ) : (
          <section className="pet-grid">
            {pets.map((pet) => (
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
        )}
      </main>
    </div>
  );
}

export default Dashboard;