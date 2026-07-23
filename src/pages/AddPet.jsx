import { Link } from 'react-router-dom';

function AddPet() {
  return (
    <div className="app-shell">
      <header className="page-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">PetPal</span>
        </div>
        <nav className="main-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>

      <main className="page-inner form-layout">
        <section className="form-card add-pet-form">
          <p className="eyebrow">Add a new companion</p>
          <h1>Add New Pet</h1>

          <label className="form-group">
            <span>Pet Name</span>
            <input type="text" placeholder="Enter pet name" />
          </label>

          <label className="form-group">
            <span>Species</span>
            <select>
              <option value="">Select species</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
              <option value="rabbit">Rabbit</option>
            </select>
          </label>

          <label className="form-group">
            <span>Breed</span>
            <input type="text" placeholder="Enter breed" />
          </label>

          <label className="form-group">
            <span>Age</span>
            <input type="number" placeholder="Enter age" />
          </label>

          <label className="form-group">
            <span>Weight (kg)</span>
            <input type="text" placeholder="Enter weight" />
          </label>

          <label className="form-group">
            <span>Upload Photo</span>
            <input type="file" />
          </label>

          <Link to="/dashboard" className="btn btn-primary btn-full">Add Pet</Link>
        </section>
      </main>
    </div>
  );
}

export default AddPet;