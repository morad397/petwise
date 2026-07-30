import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { getPetById } from '../services/dataService';

function PetFeedingSchedule() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    const foundPet = getPetById(petId);
    
    if (foundPet && String(foundPet.ownerId) === String(savedUser.id)) {
      setPet(foundPet);
    } else {
      alert("Access Denied: You do not have permission to view this pet.");
      navigate('/pets', { replace: true });
    }
    setLoading(false);
  }, [petId, navigate]);

  if (loading) {
    return (
      <div className="app-shell">
        <TopBar />
        <main className="page-inner profile-layout"><p>Loading...</p></main>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="app-shell">
      <TopBar />
      <main className="page-inner profile-layout">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button className="btn btn-ghost" onClick={() => navigate(`/pets/${pet.id}`)}>← Back to {pet.name}'s Profile</button>
          <button className="btn btn-primary">Add Feeding Schedule</button>
        </div>

        <section className="section-card">
          <h2>Feeding Schedule for {pet.name}</h2>
          <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p>No feeding records added for {pet.name}.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PetFeedingSchedule;