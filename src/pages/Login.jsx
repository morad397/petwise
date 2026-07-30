import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: '',
    fullName: '',
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    setForm((current) => ({
      ...current,
      email: savedUser.email || '',
      fullName: savedUser.fullName || '',
      role: savedUser.role || '',
    }));
  }, []);

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

    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');

    const nextUser = {
      ...savedUser,
      email: form.email,
      role: form.role,
      fullName: form.fullName || savedUser.fullName || 'Pet Owner',
    };

    localStorage.setItem('petwise-user', JSON.stringify(nextUser));
    
    if (form.role === 'admin' || form.role === 'ADMIN') {
      navigate('/admin');
    } else if (form.role === 'CLINIC_STAFF') {
      navigate('/clinic/appointments');
    } else {
      navigate('/dashboard');
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
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" style={errors.password ? {borderColor: '#ff5a79'} : {}} />
              {errors.password && <span style={{color: '#ff5a79', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>{errors.password}</span>}
            </label>

            <label className="form-group">
              <span>Login as</span>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="">Select role</option>
                <option value="owner">Pet Owner</option>
                <option value="CLINIC_STAFF">Clinic Staff</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <button type="submit" className="btn btn-primary btn-full">Log In</button>
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