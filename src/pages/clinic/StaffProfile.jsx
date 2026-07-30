import { useState, useEffect } from 'react';

function StaffProfile() {
  const staffMember = JSON.parse(localStorage.getItem('petwise-user') || '{}');
  const [form, setForm] = useState({
    fullName: staffMember.fullName || '',
    email: staffMember.email || '',
    phone: staffMember.phone || ''
  });

  const handleChange = (e) => {
    setForm(cur => ({ ...cur, [e.target.name]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = { ...staffMember, ...form };
    localStorage.setItem('petwise-user', JSON.stringify(updated));
    alert("Profile updated successfully!");
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Staff Profile</h1>
        <p style={{ color: '#64748b' }}>Manage your personal details.</p>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <section className="admin-card">
          <div className="admin-card-header">
            <h2>Personal Information</h2>
          </div>
          <form className="form-card" onSubmit={handleSave} style={{ padding: 0, boxShadow: 'none' }}>
            <label className="form-group">
              <span>Full Name</span>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required />
            </label>
            <label className="form-group">
              <span>Email Address</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label className="form-group">
              <span>Phone Number</span>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <h2>Clinic Assignment (Read-Only)</h2>
          </div>
          <div className="form-card" style={{ padding: 0, boxShadow: 'none' }}>
            <label className="form-group">
              <span>Role</span>
              <input type="text" value={staffMember.role || 'CLINIC_STAFF'} disabled style={{ background: '#f8fafc', color: '#64748b' }} />
            </label>
            <label className="form-group">
              <span>Clinic ID</span>
              <input type="text" value={staffMember.clinicId || 'Unassigned'} disabled style={{ background: '#f8fafc', color: '#64748b' }} />
            </label>
            <label className="form-group">
              <span>Department</span>
              <input type="text" value="General Medicine" disabled style={{ background: '#f8fafc', color: '#64748b' }} />
            </label>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '16px' }}>* Only a system administrator can change your role or clinic assignment.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default StaffProfile;
