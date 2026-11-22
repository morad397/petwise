import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PetImage from '../components/PetImage';
import { getPetById, updatePet, deletePet, formatWeight } from '../services/dataService';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // The server checks that this pet belongs to the logged-in user.
    getPetById(petId)
      .then((found) => {
        if (!cancelled) setPet(found);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.status === 403) {
          alert("Access Denied: You do not have permission to view this pet.");
          navigate('/pets', { replace: true });
        }
        setPet(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [petId, navigate]);

  function startEditing() {
    setEditForm({
      name: pet.name || '',
      species: pet.species || 'dog',
      breed: pet.breed || '',
      age: pet.age ?? '',
      weightKg: pet.weightKg ?? '',
    });
    setSaveError('');
    setIsEditing(true);
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError('');
    try {
      const updated = await updatePet(pet.id, {
        name: editForm.name.trim(),
        species: editForm.species,
        breed: editForm.breed.trim() || null,
        age: editForm.age === '' ? null : Number(editForm.age),
        weightKg: editForm.weightKg === '' ? null : Number(editForm.weightKg),
      });
      setPet(updated);
      setIsEditing(false);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${pet.name}? This cannot be undone.`)) return;
    try {
      await deletePet(pet.id);
      navigate('/pets', { replace: true });
    } catch (error) {
      alert(error.message);
    }
  }

  if (loading) return <p>Loading pet profile...</p>;

  if (!pet) {
    return (
      <section className="section-card empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🐾</div>
        <h2>Pet not found</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>We couldn't find this pet, or you don't have permission to view it.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/pets')}>Back to My Pets</button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      </section>
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
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/pets')}>← Back to My Pets</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={startEditing}>Edit Pet</button>
          <button className="btn btn-secondary" onClick={handleDelete} style={{ color: '#e11d48' }}>Delete Pet</button>
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
            <span>Weight: {formatWeight(pet, 'No information added yet')}</span>
            <span>Age: {pet.age != null ? `${pet.age} years` : 'No information added yet'}</span>
            <span>Status: Healthy</span>
          </div>
        </div>
      </section>

      {isEditing && (
        <section className="section-card">
          <h2>Edit {pet.name}</h2>
          <form className="form-card" onSubmit={handleSave}>
            {saveError && <p style={{ color: '#ff5a79', fontWeight: 'bold' }}>{saveError}</p>}
            <label className="form-group">
              <span>Pet Name</span>
              <input type="text" name="name" value={editForm.name} onChange={handleEditChange} required />
            </label>
            <label className="form-group">
              <span>Species</span>
              <select name="species" value={editForm.species} onChange={handleEditChange} required>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </label>
            <label className="form-group">
              <span>Breed</span>
              <input type="text" name="breed" value={editForm.breed} onChange={handleEditChange} />
            </label>
            <label className="form-group">
              <span>Age</span>
              <input type="number" min="0" max="40" name="age" value={editForm.age} onChange={handleEditChange} />
            </label>
            <label className="form-group">
              <span>Weight (kg)</span>
              <input type="number" min="0" step="0.1" name="weightKg" value={editForm.weightKg} onChange={handleEditChange} />
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        </section>
      )}

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
    </>
  );
}

export default PetProfile;