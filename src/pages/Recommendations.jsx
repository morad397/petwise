import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPetById } from '../services/dataService';

function Recommendations() {
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
      </div>

      <section className="section-card">
        <h2>Recommendations for {pet.name}</h2>
        <p className="eyebrow" style={{ color: '#d43a57', marginBottom: '16px' }}>General frontend demonstration recommendations</p>
        <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>No specific recommendations currently generated for {pet.name}.</p>
          <p style={{ marginTop: '12px', color: '#64748b' }}>For medical concerns, consult a licensed veterinarian.</p>
        </div>
      </section>
    </>
  );
}

export default Recommendations;