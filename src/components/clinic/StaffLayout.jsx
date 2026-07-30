import { Outlet, NavLink, useNavigate } from 'react-router-dom';

function StaffLayout() {
  const navigate = useNavigate();
  const staffMember = JSON.parse(localStorage.getItem('petwise-user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('petwise-user');
    navigate('/login');
  };

  return (
    <div className="app-shell admin-shell">
      <nav className="admin-sidebar" style={{ borderRight: '1px solid #eef1f6', background: '#fff' }}>
        <div className="admin-sidebar-header">
          <div className="brand-lockup">
            <span className="brand-icon">🐾</span>
            <span className="brand-name">Petwise Staff</span>
          </div>
        </div>
        <div className="admin-nav-links">
          <NavLink to="/staff" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Overview
          </NavLink>
          <NavLink to="/staff/appointments" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Appointments
          </NavLink>
          <NavLink to="/staff/patients" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Patients
          </NavLink>
          <NavLink to="/staff/schedule" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Clinic Schedule
          </NavLink>
          <NavLink to="/staff/profile" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Profile
          </NavLink>
        </div>
        <div className="admin-sidebar-footer" style={{ borderTop: '1px solid #eef1f6', paddingTop: '20px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ff5a79', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {staffMember.fullName ? staffMember.fullName.charAt(0) : 'S'}
            </div>
            <div>
              <div style={{ fontWeight: '500' }}>{staffMember.fullName || 'Staff Member'}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{staffMember.clinicName || 'Clinic Staff'}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-full" onClick={handleLogout}>Log Out</button>
        </div>
      </nav>
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="status-pill status-active" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>Frontend Demo — Backend connection planned</span>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default StaffLayout;
