import { Link } from 'react-router-dom';

function Settings() {
  return (
    <div className="app-shell">
      <header className="page-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">PetPal</span>
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

          <div className="settings-grid">
            <div className="form-card">
              <h3>Profile</h3>
              <label className="form-group">
                <span>Full Name</span>
                <input type="text" placeholder="Enter your name" />
              </label>

              <label className="form-group">
                <span>Email</span>
                <input type="email" placeholder="Enter your email" />
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
          </div>

          <Link to="/dashboard" className="btn btn-primary">Save Settings</Link>
        </section>
      </main>
    </div>
  );
}

export default Settings;