import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPetById } from '../services/dataService';

function WeightHabits() {
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

  if (loading) return <p>Loading...</p>;
  if (!pet) return null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="btn btn-ghost" onClick={() => navigate(`/pets/${pet.id}`)}>← Back to {pet.name}'s Profile</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary">Add Weight Entry</button>
          <button className="btn btn-secondary">Add Habit</button>
        </div>
      </div>

      <section className="section-card">
        <h2>Weight Tracker for {pet.name}</h2>
        <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>No weight entries added for {pet.name}. Current weight: {pet.weight || 'Unknown'}</p>
        </div>
      </section>

      <section className="section-card">
        <h2>Habits &amp; Activity for {pet.name}</h2>
        <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>No habits added for {pet.name}.</p>
        </div>
      </section>
    </>
  );
}

export default WeightHabits;