import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPet } from '../services/dataService';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function AddPet() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    setError('');
    
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG, or WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image file is too large (max 5MB).');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Only for preview
    } else {
      setImageFile(null);
      setImagePreview('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    if (!savedUser.id) {
      alert("You must be logged in to add a pet.");
      return;
    }
    
    let persistentImageUrl = '';
    
    if (imageFile) {
      try {
        persistentImageUrl = await fileToDataUrl(imageFile);
      } catch (e) {
        console.error("Failed to process image", e);
        setError("Failed to process image. Please try again.");
        return;
      }
    }

    createPet({
      ownerId: savedUser.id,
      name: form.name,
      species: form.species,
      breed: form.breed,
      age: form.age,
      weight: `${form.weight} kg`,
      imageUrl: persistentImageUrl, // Saved as persistent Base64
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
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <label className="form-group">
              <span>Pet Name</span>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter pet name" required />
            </label>

            <label className="form-group">
              <span>Species</span>
              <select name="species" value={form.species} onChange={handleChange} required>
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
            
            <label className="form-group">
              <span>Pet Photo (Optional)</span>
              <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
              <small style={{ color: '#64748b' }}>A real backend will later upload images to cloud storage.</small>
            </label>
            
            {imagePreview && (
              <div style={{ marginBottom: '16px' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full">Save Pet</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPet;