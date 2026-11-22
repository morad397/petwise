import { useParams, useNavigate } from 'react-router-dom';
import usePet from '../hooks/usePet';

function Vaccinations() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { pet, loading } = usePet(petId);

  if (loading) return <p>Loading...</p>;
  if (!pet) return null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="btn btn-ghost" onClick={() => navigate(`/pets/${pet.id}`)}>← Back to {pet.name}'s Profile</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary">Add Vaccination</button>
          <button className="btn btn-secondary">Add Medication</button>
        </div>
      </div>

      <section className="section-card">
        <h2>Vaccinations for {pet.name}</h2>
        <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>No vaccination records added for {pet.name}.</p>
        </div>
      </section>

      <section className="section-card">
        <h2>Medications for {pet.name}</h2>
        <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>No medications added for {pet.name}.</p>
        </div>
      </section>
    </>
  );
}

export default Vaccinations;