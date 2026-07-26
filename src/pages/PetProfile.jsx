import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Feeding Schedule', path: 'feeding' },
  { label: 'Vaccinations & Medications', path: 'vaccinations' },
  { label: 'Vet Visits', path: 'vet-visits' },
  { label: 'Weight & Habits', path: 'weight' },
  { label: 'Recommendations', path: 'recommendations' },
];

function PetProfile() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);

  useEffect(() => {
    const savedPets = JSON.parse(localStorage.getItem('petwise-pets') || '[]');
    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    const currentUserEmail = savedUser.email || '';

    const matchedPet = savedPets.find((p) => {
      if (!p.ownerEmail) {
        return p.id === Number(id);
      }

      return p.ownerEmail === currentUserEmail && p.id === Number(id);
    });

    setPet(matchedPet || null);
  }, [id]);

  if (!pet) {
    return <p className="empty-state">Pet not found</p>;
  }

  return (
    <div className="app-shell">
      <header className="page-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">Petwise</span>
        </div>

        <nav className="main-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>

      <main className="page-inner profile-layout">
        <section className="section-card profile-header-card">
          <img src={pet.image} alt={pet.name} className="profile-image" />
          <div>
            <p className="eyebrow">Pet Profile</p>
            <h1>{pet.name}</h1>
            <p>{pet.species} • {pet.breed}</p>
            <div className="metrics-inline">
              <span>Weight: {pet.weight}</span>
              <span>Age: {pet.age} years</span>
              <span>Status: Healthy</span>
            </div>
          </div>
        </section>

        <section className="section-card">
          <h2>Quick Links</h2>
          <div className="link-grid">
            {quickLinks.map((item) => (
              <Link key={item.label} to={`/pets/${pet.id}/${item.path}`} className="quick-link-card">
                <span>{item.label}</span>
                <strong>Open</strong>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default PetProfile;