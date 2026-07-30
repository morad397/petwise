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

  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();

    let newErrors = {};
    if (!form.email && !form.password) {
      newErrors.general = 'something wrong try again';
      newErrors.email = 'email not right';
      newErrors.password = 'password is not right';
    } else if (!form.email) {
      newErrors.email = 'email not right';
    } else if (!form.password) {
      newErrors.password = 'password is not right';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    localStorage.setItem('petwise-user', JSON.stringify({
      id: Date.now().toString(),
      fullName: form.fullName,
      email: form.email,
      role: form.role,
    }));
    
    if (form.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/add-pet');
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
          <h2>Start your free Petwise journey</h2>
          {errors.general && <p style={{color: '#ff5a79', fontWeight: 'bold'}}>{errors.general}</p>}

          <form className="form-card" onSubmit={handleSubmit}>
            <label className="form-group">
              <span>Full Name</span>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" />
            </label>

            <label className="form-group">
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" style={errors.email ? {borderColor: '#ff5a79'} : {}} />
              {errors.email && <span style={{color: '#ff5a79', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>{errors.email}</span>}
            </label>

            <label className="form-group">
              <span>Password</span>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Create a password" style={errors.password ? {borderColor: '#ff5a79'} : {}} />
              {errors.password && <span style={{color: '#ff5a79', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>{errors.password}</span>}
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