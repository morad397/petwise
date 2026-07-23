import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Dashboard() {
  const [pets, setPets] = useState([]);
  const [userName, setUserName] = useState('Pet Owner');

  useEffect(() => {
    const savedPets = JSON.parse(localStorage.getItem('petwise-pets') || '[]');
    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    const currentUserEmail = savedUser.email || '';

    const userPets = savedPets.filter((pet) => {
      if (!pet.ownerEmail) {
        return true;
      }

      return pet.ownerEmail === currentUserEmail;
    });

    setPets(userPets);
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
          <Link to="/appointments">Appointments</Link>
          <Link to="/reminders">Reminders</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/community">Community</Link>
          <Link to="/ai-vet">AI Vet</Link>
          <Link to="/sos">SOS</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/">Logout</Link>
        </nav>
      </header>

      <main className="page-inner dashboard-layout">
        <section className="section-card hero-panel dashboard-hero">
          <div>
            <p className="eyebrow">Your pet family</p>
            <h1>Welcome back, {userName}</h1>
            <p>Track appointments, reminders, health notes, and emergency support from one polished home dashboard.</p>
          </div>
          <div className="hero-actions">
            <Link to="/add-pet" className="btn btn-primary">+ Add New Pet</Link>
            <Link to="/appointments" className="btn btn-secondary">View Calendar</Link>
          </div>
        </section>

        <section className="module-grid">
          <Link to="/appointments" className="module-card">
            <span className="module-icon">🗓️</span>
            <strong>Appointments</strong>
            <small>Schedule visits and wellness checkups</small>
          </Link>
          <Link to="/reminders" className="module-card">
            <span className="module-icon">⏰</span>
            <strong>Reminders</strong>
            <small>Never miss meals, meds, or walks</small>
          </Link>
          <Link to="/shop" className="module-card">
            <span className="module-icon">🛍️</span>
            <strong>Shop</strong>
            <small>Find trusted care essentials</small>
          </Link>
          <Link to="/community" className="module-card">
            <span className="module-icon">💬</span>
            <strong>Community</strong>
            <small>Join owner discussions and care tips</small>
          </Link>
          <Link to="/ai-vet" className="module-card">
            <span className="module-icon">🤖</span>
            <strong>AI Vet</strong>
            <small>Quick guidance for health questions</small>
          </Link>
          <Link to="/sos" className="module-card">
            <span className="module-icon">🚨</span>
            <strong>SOS</strong>
            <small>Quick emergency support access</small>
          </Link>
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