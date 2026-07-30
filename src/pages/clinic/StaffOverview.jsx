import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PetImage from '../../components/PetImage';

function StaffOverview() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const staffMember = JSON.parse(localStorage.getItem('petwise-user') || '{}');

  useEffect(() => {
    const allAppointments = JSON.parse(localStorage.getItem('petwise-appointments') || '[]');
    // For demonstration, if staff doesn't have a clinicId, let's just show all or none.
    // In a real app, staff.clinicId is assigned. Let's filter by it if it exists.
    const clinicAppointments = staffMember.clinicId 
      ? allAppointments.filter(app => String(app.clinicId) === String(staffMember.clinicId))
      : allAppointments; // Fallback for demo
      
    setAppointments(clinicAppointments);
  }, [staffMember.clinicId]);

  const pending = appointments.filter(a => a.status === 'PENDING').length;
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
  const completed = appointments.filter(a => a.status === 'COMPLETED').length;
  const uniquePatients = new Set(appointments.map(a => a.petId)).size;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Clinic Staff Dashboard</h1>
        <p style={{ color: '#64748b' }}>Manage appointments, patients and today’s clinic activity.</p>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '32px' }}>
        <div className="admin-stat-card">
          <div className="stat-label">Pending Requests</div>
          <div className="stat-value">{pending}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Confirmed Appointments</div>
          <div className="stat-value">{confirmed}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Completed Visits</div>
          <div className="stat-value">{completed}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Total Patients</div>
          <div className="stat-value">{uniquePatients}</div>
        </div>
      </div>

      <section className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Today's Schedule</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/staff/appointments')}>View All</button>
        </div>
        
        {appointments.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p>No appointments scheduled for today.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Pet</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 5).map(app => (
                <tr key={app.id}>
                  <td>{app.date} • {app.time || '10:00 AM'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <PetImage pet={{ species: app.petSpecies, imageUrl: app.petImage }} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{app.petName || 'Unknown Pet'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.ownerName || 'Unknown Owner'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{app.reason}</td>
                  <td>
                    <span className={`status-pill status-${(app.status || '').toLowerCase()}`}>
                      {app.status || 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default StaffOverview;
