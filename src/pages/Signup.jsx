import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    localStorage.setItem('petwise-user', JSON.stringify({
      fullName: form.fullName,
      email: form.email,
      role: form.role,
    }));
    navigate('/add-pet');
  }

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
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
            alt="Standing dog portrait"
            className="auth-image"
          />
        </div>

        <div className="auth-form-area">
          <p className="eyebrow">Create your account</p>
          <h2>Start your free PetPal journey</h2>

          <form className="form-card" onSubmit={handleSubmit}>
            <label className="form-group">
              <span>Full Name</span>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" />
            </label>

            <label className="form-group">
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </label>

            <label className="form-group">
              <span>Password</span>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Create a password" />
            </label>

            <label className="form-group">
              <span>Confirm Password</span>
              <input type="password" placeholder="Confirm your password" />
            </label>

            <label className="form-group">
              <span>Register as</span>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="">Select role</option>
                <option value="owner">Pet Owner</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <button type="submit" className="btn btn-primary btn-full">Continue</button>
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