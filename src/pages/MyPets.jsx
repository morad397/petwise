import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PetImage from '../components/PetImage';
import { getMyPets } from '../services/dataService';

function MyPets() {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyPets()
      .then(setPets)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
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
        ) : error ? (
          <section className="section-card empty-state">
            <p style={{ color: '#ff5a79' }}>{error}</p>
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
                  <PetImage pet={pet} style={{width: 52, height: 52, borderRadius: 18, objectFit: 'cover'}} />
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
      </>
  );
}

export default MyPets;
