import { useState, useEffect } from 'react';
import PetImage from '../../components/PetImage';

function StaffAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  
  const staffMember = JSON.parse(localStorage.getItem('petwise-user') || '{}');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    const allAppointments = JSON.parse(localStorage.getItem('petwise-appointments') || '[]');
    const clinicAppointments = staffMember.clinicId 
      ? allAppointments.filter(app => String(app.clinicId) === String(staffMember.clinicId))
      : allAppointments; // fallback for demo
    setAppointments(clinicAppointments);
  };

  const updateStatus = (id, newStatus) => {
    const allAppointments = JSON.parse(localStorage.getItem('petwise-appointments') || '[]');
    const updated = allAppointments.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    );
    localStorage.setItem('petwise-appointments', JSON.stringify(updated));
    loadAppointments();
  };

  const handleAction = (app, action) => {
    if (action === 'CONFIRM') updateStatus(app.id, 'CONFIRMED');
    if (action === 'REJECT') {
      const reason = prompt("Enter rejection reason:");
      if (reason) updateStatus(app.id, 'REJECTED');
    }
    if (action === 'SUGGEST_TIME') {
      const newTime = prompt("Enter suggested time (e.g. 2026-07-02 14:00):");
      if (newTime) updateStatus(app.id, 'RESCHEDULE_REQUESTED');
    }
    if (action === 'IN_PROGRESS') updateStatus(app.id, 'IN_PROGRESS');
    if (action === 'COMPLETE') {
      const notes = prompt("Enter visit notes:");
      if (notes !== null) updateStatus(app.id, 'COMPLETED');
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter !== 'ALL' && app.status !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      const matchName = app.petName?.toLowerCase().includes(searchLower);
      const matchOwner = app.ownerName?.toLowerCase().includes(searchLower);
      const matchReason = app.reason?.toLowerCase().includes(searchLower);
      return matchName || matchOwner || matchReason;
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Appointments</h1>
          <p style={{ color: '#64748b' }}>Manage incoming requests and today's visits.</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search pet, owner, or reason..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', flex: 1, minWidth: '200px' }}
          />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESCHEDULE_REQUESTED">Reschedule Requested</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <section className="admin-card">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p>No appointments found matching your criteria.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Pet & Owner</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(app => (
                <tr key={app.id}>
                  <td>{app.date} <br/> <small style={{ color: '#64748b' }}>{app.time || '10:00 AM'}</small></td>
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
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {app.status === 'PENDING' && (
                        <>
                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleAction(app, 'CONFIRM')}>Confirm</button>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleAction(app, 'SUGGEST_TIME')}>Reschedule</button>
                          <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleAction(app, 'REJECT')}>Reject</button>
                        </>
                      )}
                      {app.status === 'CONFIRMED' && (
                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleAction(app, 'IN_PROGRESS')}>Start Visit</button>
                      )}
                      {app.status === 'IN_PROGRESS' && (
                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#10b981', color: 'white' }} onClick={() => handleAction(app, 'COMPLETE')}>Complete</button>
                      )}
                    </div>
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

export default StaffAppointments;
