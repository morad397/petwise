import { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import { getAppointmentsByClinicId, updateAppointment } from '../../services/dataService';

export default function ClinicAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulating the clinic ID for the logged in staff
  // In a real app, this comes from the authenticated currentStaff object
  const STAFF_CLINIC_ID = 'clinic-1'; 

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    // Only load appointments for this specific clinic
    setAppointments(getAppointmentsByClinicId(STAFF_CLINIC_ID));
  };

  const handleUpdateStatus = (id, newStatus) => {
    updateAppointment(id, { status: newStatus });
    loadAppointments();
  };

  let displayed = appointments.filter(apt => {
    const matchesSearch = apt.title.toLowerCase().includes(searchQuery.toLowerCase()) || (apt.petName && apt.petName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Clinic Dashboard</p>
          <h1>Manage Appointments</h1>
        </div>
      </header>

      <section className="section-card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', flex: 1, minWidth: '250px' }}>
            <Search size={18} color="#666" style={{ marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search by pet or service..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <CalendarIcon size={18} color="#666" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="RESCHEDULE_REQUESTED">Reschedule Requested</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Pet / Owner</th>
                <th>Service / Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((apt) => (
                <tr key={apt.id}>
                  <td>
                    <strong>{apt.appointmentDate}</strong><br/>
                    <small style={{ color: '#666' }}>{apt.appointmentTime}</small>
                  </td>
                  <td>
                    <strong>{apt.petName || 'Unknown Pet'}</strong><br/>
                    <small style={{ color: '#666' }}>{apt.ownerName || 'Client'}</small>
                  </td>
                  <td>
                    {apt.title}<br/>
                    <small style={{ color: '#666' }}>{apt.detail}</small>
                  </td>
                  <td>
                    <StatusBadge status={apt.status} type={
                      apt.status === 'CONFIRMED' || apt.status === 'COMPLETED' ? 'success' :
                      apt.status === 'PENDING' ? 'warning' :
                      apt.status === 'RESCHEDULE_REQUESTED' ? 'info' : 'danger'
                    } />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {apt.status === 'PENDING' && (
                        <>
                          <button className="icon-btn" title="Confirm" onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')} style={{ color: '#137333' }}>
                            <CheckCircle size={18} />
                          </button>
                          <button className="icon-btn" title="Reject" onClick={() => handleUpdateStatus(apt.id, 'REJECTED')} style={{ color: '#d93025' }}>
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {apt.status === 'CONFIRMED' && (
                        <button className="icon-btn" title="Mark as Completed" onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')} style={{ color: '#1a73e8' }}>
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                         <button className="icon-btn" title="Request Reschedule" onClick={() => handleUpdateStatus(apt.id, 'RESCHEDULE_REQUESTED')} style={{ color: '#b06000' }}>
                           <Clock size={18} />
                         </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

const selectStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  background: '#fff',
  outline: 'none',
  cursor: 'pointer'
};
