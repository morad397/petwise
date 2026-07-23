import { Link } from 'react-router-dom';

function Signup() {
  return (
    <div className="app-shell auth-shell">
      <div className="auth-card">
        <div className="auth-visual">
          <div className="brand-lockup brand-lockup-large">
            <span className="brand-icon">🐾</span>
            <span className="brand-name">PetPal</span>
          </div>
          <h1>Join the future of pet care.</h1>
          <p>Build a complete health profile for every furry family member and get AI-powered support instantly.</p>
          <img
            src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80"
            alt="Pet portrait"
            className="auth-image"
          />
        </div>

        <div className="auth-form-area">
          <p className="eyebrow">Create your account</p>
          <h2>Start your free PetPal journey</h2>

          <form className="form-card">
            <label className="form-group">
              <span>Full Name</span>
              <input type="text" placeholder="Enter your full name" />
            </label>

            <label className="form-group">
              <span>Email</span>
              <input type="email" placeholder="you@example.com" />
            </label>

            <label className="form-group">
              <span>Password</span>
              <input type="password" placeholder="Create a password" />
            </label>

            <label className="form-group">
              <span>Confirm Password</span>
              <input type="password" placeholder="Confirm your password" />
            </label>

            <label className="form-group">
              <span>Register as</span>
              <select>
                <option value="">Select role</option>
                <option value="owner">Pet Owner</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <Link to="/login" className="btn btn-primary btn-full">Sign Up</Link>
          </form>

          <p className="auth-link-row">
            Already have an account?
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;