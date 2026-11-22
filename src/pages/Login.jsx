import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, homePathForRole } from '../services/authService';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    if (savedUser.email) {
      setForm((current) => ({
        ...current,
        email: savedUser.email,
      }));
    }
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    let newErrors = {};
    if (!form.email && !form.password) {
      newErrors.general = 'Please fill out all fields.';
      newErrors.email = 'Email is required';
      newErrors.password = 'Password is required';
    } else if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!form.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setIsSubmitting(true);
    try {
      // The server checks the password and returns the user with their role.
      const user = await login(form.email.trim().toLowerCase(), form.password);
      navigate(homePathForRole(user), { replace: true });
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell auth-shell">
      <div className="auth-card">
        <div className="auth-visual">
          <div className="brand-lockup brand-lockup-large">
            <span className="brand-icon">🐾</span>
            <span className="brand-name">Petwise</span>
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
          <h2>Sign in to Petwise</h2>
          {errors.general && <p style={{color: '#ff5a79', fontWeight: 'bold'}}>{errors.general}</p>}

          <form className="form-card" onSubmit={handleSubmit}>
            <label className="form-group">
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" style={errors.email ? {borderColor: '#ff5a79'} : {}} />
              {errors.email && <span style={{color: '#ff5a79', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>{errors.email}</span>}
            </label>

            <label className="form-group">
              <span>Password</span>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" style={errors.password ? {borderColor: '#ff5a79'} : {}} />
              {errors.password && <span style={{color: '#ff5a79', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>{errors.password}</span>}
            </label>

            <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in…' : 'Log In'}
            </button>
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