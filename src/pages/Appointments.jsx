import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import AppointmentForm from '../components/appointments/AppointmentForm';
import StatusBadge from '../components/admin/StatusBadge';
import ConfirmationModal from '../components/admin/ConfirmationModal';
import { getAppointmentsByUserId, createAppointment, updateAppointment, deleteAppointment, getPetsByOwnerId, initializeDB } from '../services/dataService';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [petName, setPetName] = useState('Your Pet');
  
  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  useEffect(() => {
    // Ensure mock DB is initialized
    initializeDB();

    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    setCurrentUser(savedUser);

    if (savedUser.id) {
      loadAppointments(savedUser.id);
      
      const userPets = getPetsByOwnerId(savedUser.id);
      if (userPets.length > 0) {
        setPetName(userPets[0].name);
      }
    }
  }, []);

  const loadAppointments = (userId) => {
    const apts = getAppointmentsByUserId(userId);
    // Sort by creation date or appointment date
    setAppointments(apts);
  };

  const handleOpenBook = () => {
    setEditingAppointment(null);
    setIsFormOpen(true);
  };

  const handleOpenManage = (apt) => {
    setEditingAppointment(apt);
    setIsFormOpen(true);
  };

  const handleSaveForm = (formData) => {
    if (editingAppointment) {
      updateAppointment(editingAppointment.id, { 
        ...formData, 
        status: 'PENDING' // Edits require re-confirmation
      });
      alert("Your changes were submitted to the clinic for confirmation.");
    } else {
      createAppointment({
        ...formData,
        userId: currentUser.id
      });
      alert("Appointment requested successfully!");
    }
    loadAppointments(currentUser.id);
    setIsFormOpen(false);
  };

  const handleCancelRequest = (apt) => {
    setAppointmentToCancel(apt);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (appointmentToCancel) {
      updateAppointment(appointmentToCancel.id, { status: 'CANCELLED' });
      loadAppointments(currentUser.id);
    }
    setIsCancelModalOpen(false);
    setAppointmentToCancel(null);
  };

  return (
    <div className="app-shell">
      <TopBar />

      <main className="page-inner dashboard-layout">
        {!isFormOpen ? (
          <>
            <section className="section-card hero-panel dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p className="eyebrow">Appointments</p>
                <h1>{petName}'s Care Calendar</h1>
                <p>Book, review, and manage the next health visit and care session in a calm, single-view schedule.</p>
              </div>
              <button className="btn btn-primary btn-large" onClick={handleOpenBook}>
                + Book Appointment
              </button>
            </section>

            <section className="appointment-grid">
              {appointments.map((item) => {
                const canManage = item.status === 'PENDING' || item.status === 'CONFIRMED' || item.status === 'RESCHEDULE_REQUESTED';
                
                return (
                  <article key={item.id} className="mini-card appointment-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="eyebrow" style={{ color: '#ff5a79', display: 'block' }}>{item.title}</span>
                      <StatusBadge status={item.status} type={
                        item.status === 'CONFIRMED' || item.status === 'COMPLETED' ? 'success' :
                        item.status === 'PENDING' ? 'warning' :
                        item.status === 'RESCHEDULE_REQUESTED' ? 'info' : 'danger'
                      } />
                    </div>
                    
                    <h3 style={{ fontSize: '1.2rem', marginTop: '12px' }}>{item.appointmentDate} • {item.appointmentTime}</h3>
                    <p style={{ marginTop: '8px', color: '#4a4a4a' }}>
                      <strong>Pet:</strong> {item.petName}<br/>
                      {item.detail}
                    </p>
                    
                    <div className="shop-card-footer" style={{ marginTop: '16px', gap: '8px', display: 'flex' }}>
                      {canManage ? (
                        <>
                          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleOpenManage(item)}>Manage</button>
                          <button className="btn btn-ghost" onClick={() => handleCancelRequest(item)} style={{ color: '#d43a57' }}>Cancel</button>
                        </>
                      ) : (
                        <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic', margin: 0, padding: '8px 0' }}>
                          This appointment cannot be edited because it is {item.status.toLowerCase()}.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
              {appointments.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', gridColumn: '1 / -1' }}>
                  <p style={{ color: '#666' }}>No upcoming appointments.</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <AppointmentForm 
            initialData={editingAppointment} 
            currentUser={currentUser}
            onSave={handleSaveForm}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
      </main>

      <ConfirmationModal 
        isOpen={isCancelModalOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel it"
        isDanger={true}
        onConfirm={confirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}

export default Appointments;
