import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPet } from '../services/dataService';

function AddPet() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    image: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80',
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    if (!savedUser.id) {
      alert("You must be logged in to add a pet.");
      return;
    }
    
    createPet({
      ownerId: savedUser.id,
      name: form.name,
      species: form.species,
      breed: form.breed,
      age: form.age,
      weight: `${form.weight} kg`,
      imageUrl: form.image, // Saved as imageUrl
    });

    navigate('/dashboard');
  }

  return (
    <div className="app-shell auth-shell">
      <div className="auth-card onboarding-card">
        <div className="auth-visual">
          <div className="brand-lockup brand-lockup-large">
            <span className="brand-icon">🐾</span>
            <span className="brand-name">Petwise</span>
          </div>
          <h1>Start with your first pet.</h1>
          <p>Add your companion’s details and jump straight into your pet dashboard.</p>
          <img
            src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80"
            alt="Pet onboarding illustration"
            className="auth-image"
          />
        </div>

        <div className="auth-form-area">
          <p className="eyebrow">First-time setup</p>
          <h2>Add your pet</h2>

          <form className="form-card" onSubmit={handleSubmit}>
            <label className="form-group">
              <span>Pet Name</span>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter pet name" />
            </label>

            <label className="form-group">
              <span>Species</span>
              <select name="species" value={form.species} onChange={handleChange}>
                <option value="">Select species</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </label>

            <label className="form-group">
              <span>Breed</span>
              <input type="text" name="breed" value={form.breed} onChange={handleChange} placeholder="Enter breed" />
            </label>

            <label className="form-group">
              <span>Age</span>
              <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="Enter age" />
            </label>

            <label className="form-group">
              <span>Weight (kg)</span>
              <input type="text" name="weight" value={form.weight} onChange={handleChange} placeholder="Enter weight" />
            </label>

            <button type="submit" className="btn btn-primary btn-full">Save Pet</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPet;