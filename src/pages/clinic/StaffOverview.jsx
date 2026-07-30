import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, CheckSquare, Users } from 'lucide-react';
import PetImage from '../../components/PetImage';
import { getPetById } from '../../services/dataService';

function StaffOverview() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const staffMember = JSON.parse(localStorage.getItem('petwise-user') || '{}');

  useEffect(() => {
    const allAppointments = JSON.parse(localStorage.getItem('petwise-appointments') || '[]');
    const clinicAppointments = staffMember.clinicId 
      ? allAppointments.filter(app => String(app.clinicId) === String(staffMember.clinicId))
      : [];
      
    setAppointments(clinicAppointments);
  }, [staffMember.clinicId]);

  const todaysAppointments = appointments.length;
  const pending = appointments.filter(a => a.status === 'PENDING').length;
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
  const completed = appointments.filter(a => a.status === 'COMPLETED').length;
  const uniquePatients = new Set(appointments.map(a => a.petId).filter(Boolean)).size;

  const getPetDetails = (app) => {
    if (app.petId) {
      const pet = getPetById(app.petId);
      if (pet) {
        return { name: pet.name, species: pet.species, imageUrl: pet.imageUrl, ownerName: pet.ownerName || app.ownerName || 'Unknown Owner' };
      }
    }
    return { name: app.petName || 'Unknown Pet', species: app.petSpecies, imageUrl: app.petImage, ownerName: app.ownerName || 'Unknown Owner' };
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px', color: '#0f2138' }}>Clinic Staff Dashboard</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Manage appointments, patients and today’s clinic activity.</p>
        </div>
        <span className="status-pill status-active" style={{ fontSize: '0.7rem', padding: '2px 8px', alignSelf: 'flex-start', marginTop: '8px' }}>Frontend Demo — Backend connection planned</span>
      </div>

      {!staffMember.clinicId && (
        <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', borderRadius: '12px', marginBottom: '32px' }}>
          <strong>Attention:</strong> No clinic is assigned to this account. An Admin must assign a clinic before clinic appointments can be accessed.
        </div>
      )}

      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '32px' }}>
        <div className="section-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: '#3b82f6' }}><Calendar size={24} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2138' }}>{todaysAppointments}</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Today's Appointments</div>
        </div>
        
        <div className="section-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: '#f59e0b' }}><Clock size={24} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2138' }}>{pending}</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Pending Requests</div>
        </div>

        <div className="section-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: '#10b981' }}><CheckCircle size={24} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2138' }}>{confirmed}</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Confirmed Appointments</div>
        </div>

        <div className="section-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: '#8b5cf6' }}><CheckSquare size={24} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2138' }}>{completed}</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Completed Visits</div>
        </div>

        <div className="section-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: '#ff5a79' }}><Users size={24} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2138' }}>{uniquePatients}</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Total Patients</div>
        </div>
      </div>

      <section className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#0f2138', margin: 0 }}>Today's Schedule</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/staff/appointments')}>View All</button>
        </div>
        
        {appointments.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p>No appointments scheduled for today.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Pet</th>
                  <th>Owner</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map(app => {
                  const petDetails = getPetDetails(app);
                  return (
                    <tr key={app.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{app.date}<br/><small style={{ color: '#64748b' }}>{app.time || '10:00 AM'}</small></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <PetImage pet={{ species: petDetails.species, imageUrl: petDetails.imageUrl }} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                          <div style={{ fontWeight: 500, color: '#0f2138' }}>{petDetails.name}</div>
                        </div>
                      </td>
                      <td style={{ color: '#64748b' }}>{petDetails.ownerName}</td>
                      <td>{app.reason || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No reason provided</span>}</td>
                      <td>
                        <span className={`status-pill status-${(app.status || '').toLowerCase()}`}>
                          {app.status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default StaffOverview;
