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
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#0f2138' }}>Staff Profile</h1>
        <p style={{ color: '#64748b' }}>Manage your personal details and view your clinic assignment.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Read-Only Info */}
        <section className="section-card" style={{ alignSelf: 'start', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ff5a79', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>
              {staffMember.fullName ? staffMember.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#0f2138' }}>{staffMember.fullName || 'Staff Member'}</h2>
            <span className="status-pill status-active" style={{ marginTop: '8px' }}>{staffMember.role || 'CLINIC_STAFF'}</span>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f2138', marginBottom: '16px' }}>Clinic Assignment</h3>
            {staffMember.clinicId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Clinic Name</div>
                  <div style={{ fontWeight: 500, color: '#0f2138' }}>{staffMember.clinicName || 'Petwise Clinic'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Department</div>
                  <div style={{ fontWeight: 500, color: '#0f2138' }}>General Medicine</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Account Status</div>
                  <div style={{ fontWeight: 500, color: '#10b981' }}>Active</div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '16px', borderRadius: '8px', color: '#92400e' }}>
                <strong>No clinic assigned!</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Please contact the system administrator to assign your account to a clinic.</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Editable Form */}
        <section className="section-card" style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f2138', marginBottom: '24px' }}>Personal Information</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '6px' }}>Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={form.fullName} 
                  onChange={handleChange} 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '6px' }}>Phone Number</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '6px' }}>Email Address <span style={{ color: '#64748b', fontWeight: 'normal' }}>(Read-Only)</span></label>
              <input 
                type="email" 
                value={form.email} 
                disabled
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setForm({ fullName: staffMember.fullName || '', email: staffMember.email || '', phone: staffMember.phone || '' })}>
                Discard Changes
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}

export default StaffProfile;
