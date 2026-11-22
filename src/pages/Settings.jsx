import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { getCurrentUser, updateMe } from '../services/authService';

const ROLE_LABELS = { PET_OWNER: 'Pet Owner', CLINIC_STAFF: 'Clinic Staff', ADMIN: 'Admin' };

function Settings() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    const savedUser = getCurrentUser();
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      // The role cannot be changed here; only an admin can change roles.
      await updateMe({ fullName: form.fullName, email: form.email });
      navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
        <section className="section-card">
          <p className="eyebrow">Preferences</p>
          <h1>Settings</h1>

          {error && <p style={{ color: '#ff5a79', fontWeight: 'bold' }}>{error}</p>}
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
                <input type="text" value={ROLE_LABELS[form.role] || form.role} disabled />
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
      </>
  );
}

export default Settings;