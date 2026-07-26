import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Settings() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    setForm({
      fullName: savedUser.fullName || '',
      email: savedUser.email || '',
      role: savedUser.role || '',
    });
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const previousUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    const savedPets = JSON.parse(localStorage.getItem('petwise-pets') || '[]');

    if (previousUser.email && previousUser.email !== form.email) {
      const updatedPets = savedPets.map((pet) => {
        if (pet.ownerEmail === previousUser.email) {
          return { ...pet, ownerEmail: form.email };
        }

        return pet;
      });

      localStorage.setItem('petwise-pets', JSON.stringify(updatedPets));
    }

    localStorage.setItem('petwise-user', JSON.stringify(form));
    navigate('/dashboard');
  }

  return (
    <div className="app-shell">
      <header className="page-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">Petwise</span>
        </div>
        <nav className="main-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/">Home</Link>
        </nav>
      </header>

      <main className="page-inner settings-layout">
        <section className="section-card">
          <p className="eyebrow">Preferences</p>
          <h1>Settings</h1>

          <form className="settings-grid" onSubmit={handleSubmit}>
            <div className="form-card">
              <h3>Profile</h3>
              <label className="form-group">
                <span>Full Name</span>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your name" />
              </label>

              <label className="form-group">
                <span>Email</span>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" />
              </label>

              <label className="form-group">
                <span>Role</span>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="">Select role</option>
                  <option value="owner">Pet Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>

            <div className="form-card">
              <h3>Notifications</h3>
              <label className="checkbox-row"><input type="checkbox" /> Feeding reminders</label>
              <label className="checkbox-row"><input type="checkbox" /> Vaccination reminders</label>
              <label className="checkbox-row"><input type="checkbox" /> Vet visit reminders</label>
            </div>

            <div className="form-card">
              <h3>Language</h3>
              <label className="form-group">
                <span>Preferred language</span>
                <select>
                  <option value="en">English</option>
                  <option value="he">עברית</option>
                  <option value="ar">العربية</option>
                </select>
              </label>
            </div>

            <button type="submit" className="btn btn-primary">Save Settings</button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Settings;