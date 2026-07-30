import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { getPetsByOwnerId } from '../services/dataService';

function MyPets() {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure DB is initialized and migrated
    import('../services/dataService').then(({ initializeDB, getPetsByOwnerId }) => {
      initializeDB();
      try {
        const user = JSON.parse(localStorage.getItem('petwise-user') || '{}');
        if (user.id) {
          // dataService now uses strict String() comparisons
          setPets(getPetsByOwnerId(user.id));
        }
      } catch (e) {
        console.error('Failed to parse pets', e);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  return (
    <div className="app-shell">
      <TopBar />

      <main className="page-inner dashboard-layout">
        <section className="section-card hero-panel dashboard-hero">
          <div>
            <p className="eyebrow">My Pets</p>
            <h1>Your Pet Family</h1>
            <p>Manage your pets, their health records, and daily habits all in one place.</p>
          </div>
          <div className="hero-actions">
            <Link to="/add-pet" className="btn btn-primary">+ Add New Pet</Link>
          </div>
        </section>

        {isLoading ? (
          <section className="section-card empty-state">
            <p>Loading your pets…</p>
          </section>
        ) : pets.length === 0 ? (
          <section className="section-card empty-state">
            <p>You haven't added any pets yet. Let's get started!</p>
          </section>
        ) : (
          <section className="pet-cards">
            {pets.map((pet) => (
              <article key={pet.id || pet.name} className="pet-card">
                <div className="pet-card-header">
                  {pet.avatar ? (
                    <img src={pet.avatar} alt={pet.name} style={{width: 52, height: 52, borderRadius: 18, objectFit: 'cover'}} />
                  ) : (
                    <div className="pet-avatar">
                      {pet.species === 'cat' || pet.type === 'cat' ? '🐱' : '🐶'}
                    </div>
                  )}
                  <div>
                    <strong>{pet.name}</strong>
                    <br />
                    <small>{pet.breed || pet.type || pet.species} • {pet.age} years</small>
                  </div>
                  <Link to={`/pets/${encodeURIComponent(String(pet.id))}`} className="btn btn-secondary">
                    View Profile
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default MyPets;
