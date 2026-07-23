import { useParams, Link } from 'react-router-dom';

const samplePets = [
  {
    id: 1,
    name: 'Luna',
    species: 'Cat',
    breed: 'British Shorthair',
    weight: '4.2 kg',
    age: 3,
    image:
      'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Rex',
    species: 'Dog',
    breed: 'Golden Retriever',
    weight: '28 kg',
    age: 5,
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
  },
];

const quickLinks = [
  { label: 'Feeding Schedule', path: 'feeding' },
  { label: 'Vaccinations & Medications', path: 'vaccinations' },
  { label: 'Vet Visits', path: 'vet-visits' },
  { label: 'Weight & Habits', path: 'weight' },
  { label: 'Recommendations', path: 'recommendations' },
];

function PetProfile() {
  const { id } = useParams();
  const pet = samplePets.find((p) => p.id === Number(id));

  if (!pet) {
    return <p className="empty-state">Pet not found</p>;
  }

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