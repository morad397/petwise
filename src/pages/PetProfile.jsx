import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import PetImage from '../components/PetImage';
import { getPetById } from '../services/dataService';

const breedDisplayNames = {
  haski: "Husky",
  husky: "Husky"
};

const normalizeSpecies = (species) => {
  const value = species?.trim().toLowerCase();
  if (value === 'dog') return 'Dog';
  if (value === 'cat') return 'Cat';
  return species || 'Unknown';
};

const normalizeBreed = (breed) => {
  if (!breed) return '';
  const value = breed.trim().toLowerCase();
  return breedDisplayNames[value] || (breed.charAt(0).toUpperCase() + breed.slice(1));
};

function PetProfile() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    const foundPet = getPetById(petId);
    
    if (foundPet) {
      if (String(foundPet.ownerId) === String(savedUser.id)) {
        setPet(foundPet);
      } else {
        alert("Access Denied: You do not have permission to view this pet.");
        navigate('/pets', { replace: true });
      }
    } else {
      setPet(null);
    }
    setLoading(false);
  }, [petId, navigate]);

  if (loading) {
    return (
      <div className="app-shell">
        <TopBar />
        <main className="page-inner profile-layout">
          <p>Loading pet profile...</p>
        </main>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="app-shell">
        <TopBar />
        <main className="page-inner profile-layout">
          <section className="section-card empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🐾</div>
            <h2>Pet not found</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>We couldn’t find this pet, or you don’t have permission to view it.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/pets')}>Back to My Pets</button>
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const quickLinks = [
    { label: "Feeding Schedule", path: `/pets/${pet.id}/feeding` },
    { label: "Vaccinations & Medications", path: `/pets/${pet.id}/medical` },
    { label: "Vet Visits", path: `/pets/${pet.id}/vet-visits` },
    { label: "Weight & Habits", path: `/pets/${pet.id}/weight-habits` },
    { label: "Recommendations", path: `/pets/${pet.id}/recommendations` }
  ];

  return (
    <div className="app-shell">
      <TopBar />

      <main className="page-inner profile-layout">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/pets')}>← Back to My Pets</button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary">Edit Pet</button>
            <button className="btn btn-secondary" onClick={() => navigate('/appointments')}>Book Appointment</button>
            <button className="btn btn-secondary" onClick={() => navigate('/reminders')}>Add Reminder</button>
          </div>
        </div>

        <section className="section-card profile-header-card">
          <PetImage pet={pet} className="profile-image" />
          <div>
            <p className="eyebrow">Pet Profile</p>
            <h1>{pet.name}</h1>
            <p>{normalizeSpecies(pet.species)} {normalizeBreed(pet.breed) ? `• ${normalizeBreed(pet.breed)}` : ''}</p>
            <div className="metrics-inline">
              <span>Weight: {pet.weight || 'No information added yet'}</span>
              <span>Age: {pet.age ? `${pet.age} years` : 'No information added yet'}</span>
              <span>Status: Healthy</span>
            </div>
          </div>
        </section>

        <section className="section-card">
          <h2>Quick Links</h2>
          <div className="link-grid">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                className="quick-link-card"
                onClick={() => navigate(link.path)}
                aria-label={`Open ${link.label} for ${pet.name}`}
                style={{ cursor: 'pointer', textAlign: 'left', background: 'none', border: '1px solid #eef1f6', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: '500', color: '#0d1b2a' }}>{link.label}</span>
                <span style={{ color: '#ff5a79', fontWeight: 'bold' }}>Open →</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default PetProfile;