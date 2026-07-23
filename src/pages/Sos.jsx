import { Link } from 'react-router-dom';

function Sos() {
  return (
    <div className="app-shell">
      <header className="page-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">PetPal</span>
        </div>
        <nav className="main-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/appointments">Appointments</Link>
          <Link to="/reminders">Reminders</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/sos">SOS</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>

      <main className="page-inner dashboard-layout">
        <section className="section-card hero-panel dashboard-hero">
          <div>
            <p className="eyebrow">SOS Center</p>
            <h1>Emergency support</h1>
            <p>Instant access to urgent care, veterinary contacts, and your pet’s critical info in one place.</p>
          </div>
        </section>

        <section className="appointment-grid">
          <article className="mini-card emergency-card">
            <span className="eyebrow">Emergency Vet</span>
            <h3>City Pet Hospital</h3>
            <p>Call now: +1 (555) 801-2400</p>
            <a href="tel:+15558012400" className="btn btn-primary">Call now</a>
          </article>

          <article className="mini-card emergency-card">
            <span className="eyebrow">Emergency Contact</span>
            <h3>Owner Support</h3>
            <p>Family contact: +1 (555) 420-1188</p>
            <a href="tel:+15554201188" className="btn btn-secondary">Contact</a>
          </article>

          <article className="mini-card emergency-card">
            <span className="eyebrow">Critical Notes</span>
            <h3>Allergies & Meds</h3>
            <p>Allergy: none. Important med: daily anti-inflammatory.</p>
            <button className="btn btn-secondary">Show profile</button>
          </article>
        </section>
      </main>
    </div>
  );
}

export default Sos;
