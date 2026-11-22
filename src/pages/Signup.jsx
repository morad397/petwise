import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, homePathForRole } from '../services/authService';
import { getClinics } from '../services/dataService';

function Signup() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    clinicId: '',
    department: ''
  });

  useEffect(() => {
    getClinics()
      .then((list) => setClinics(list.filter((c) => c.status === 'ACTIVE')))
      .catch(() => setClinics([]));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (form.password !== form.confirmPassword) {
      newErrors.general = 'Passwords do not match.';
    }
    
    if (!form.role) {
      newErrors.general = 'Please select a role.';
    }

    if (form.role === 'CLINIC_STAFF' && clinics.length > 0 && !form.clinicId) {
      newErrors.general = 'Please select a clinic for your staff account.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (form.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const isStaff = form.role === 'CLINIC_STAFF';
      const user = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        clinicId: isStaff ? form.clinicId : null,
        department: isStaff ? form.department : null,
      });
      navigate(homePathForRole(user), { replace: true });
    } catch (error) {
      if (error.status === 409) {
        setErrors({ email: error.message });
      } else {
        setErrors({ general: error.message });
      }
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
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" />
            </label>

            <label className="form-group">
              <span>Select Role</span>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="">Choose your role</option>
                <option value="PET_OWNER">Pet Owner</option>
                <option value="CLINIC_STAFF">Clinic Staff</option>
              </select>
              <small style={{ color: '#64748b' }}>Admin accounts are created by an existing administrator.</small>
            </label>

            {form.role === 'CLINIC_STAFF' && (
              <div style={{ marginTop: '8px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#334155' }}>Clinic Staff Information</h4>
                
                {clinics.length > 0 ? (
                  <label className="form-group">
                    <span>Clinic</span>
                    <select name="clinicId" value={form.clinicId} onChange={handleChange} required>
                      <option value="">Select a Clinic</option>
                      {clinics.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div style={{ padding: '12px', background: '#fffbeb', color: '#b45309', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '12px' }}>
                    <strong>Note:</strong> No clinics are currently registered in the system. You will be registered as an unassigned staff member.
                  </div>
                )}

                <label className="form-group" style={{ marginBottom: 0 }}>
                  <span>Department</span>
                  <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="e.g. Surgery, Reception" />
                </label>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '8px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Continue'}
            </button>
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