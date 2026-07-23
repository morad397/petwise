import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className="app-shell auth-shell">
      <div className="auth-card">
        <div className="auth-visual">
          <div className="brand-lockup brand-lockup-large">
            <span className="brand-icon">🐾</span>
            <span className="brand-name">PetPal</span>
          </div>
          <h1>Care for every wag, whisker, and paw.</h1>
          <p>Track your pet’s health, schedule appointments, and connect with your AI vet in one beautiful app.</p>
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
            alt="Happy pet"
            className="auth-image"
          />
        </div>

        <div className="auth-form-area">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to PetPal</h2>

          <form className="form-card">
            <label className="form-group">
              <span>Email</span>
              <input type="email" placeholder="you@example.com" />
            </label>

            <label className="form-group">
              <span>Password</span>
              <input type="password" placeholder="Enter your password" />
            </label>

            <label className="form-group">
              <span>Login as</span>
              <select>
                <option value="">Select role</option>
                <option value="owner">Pet Owner</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <Link to="/dashboard" className="btn btn-primary btn-full">Log In</Link>
          </form>

          <p className="auth-link-row">
            Don’t have an account?
            <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;