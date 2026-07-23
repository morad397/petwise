import { Link } from 'react-router-dom';

function Homepage() {
  return (
    <div className="homepage-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">Petwise</span>
        </div>
      </header>

      <main>
        <section className="hero-grid simple-hero">
          <div className="hero-copy hero-copy-centered">
            <div className="pill-badge">
              <span>✨</span>
              <span>Pet care made simple</span>
            </div>

            <h1>Welcome to Petwise</h1>
            <p>
              A clean and modern place to manage your pet’s daily care, routine, and health records.
            </p>

            <div className="hero-buttons hero-buttons-centered">
              <Link to="/login" className="btn btn-secondary btn-large">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-large">Sign Up</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Homepage;