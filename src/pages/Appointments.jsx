import { useEffect, useState } from 'react';
import AppointmentForm from '../components/appointments/AppointmentForm';
import StatusBadge from '../components/admin/StatusBadge';
import ConfirmationModal from '../components/admin/ConfirmationModal';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  acceptSuggestedTime,
} from '../services/dataService';
import { formatDate } from '../services/medicalService';

const OWNER_EDITABLE = ['PENDING', 'CONFIRMED', 'RESCHEDULE_REQUESTED'];

const STATUS_LABELS = {
  PENDING: 'Waiting for clinic',
  CONFIRMED: 'Confirmed',
  RESCHEDULE_REQUESTED: 'New time suggested',
  REJECTED: 'Rejected',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const badgeType = (status) =>
  status === 'CONFIRMED' || status === 'COMPLETED' || status === 'IN_PROGRESS'
    ? 'success'
    : status === 'PENDING'
      ? 'warning'
      : status === 'RESCHEDULE_REQUESTED'
        ? 'info'
        : 'danger';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const loadAppointments = () =>
    getAppointments()
      .then((list) => {
        setAppointments(list);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleOpenBook = () => {
    setEditingAppointment(null);
    setIsFormOpen(true);
  };

  const handleOpenManage = (apt) => {
    setEditingAppointment(apt);
    setIsFormOpen(true);
  };

  // Errors are thrown back to the form, which shows them
  const handleSaveForm = async (payload) => {
    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, payload);
      alert('Your changes were sent to the clinic for confirmation.');
    } else {
      await createAppointment(payload);
      alert('Appointment requested! The clinic will confirm it soon.');
    }
    setIsFormOpen(false);
    loadAppointments();
  };

  const handleAcceptSuggestion = async (apt) => {
    try {
      await acceptSuggestedTime(apt.id);
      loadAppointments();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCancelRequest = (apt) => {
    setAppointmentToCancel(apt);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (appointmentToCancel) {
      try {
        await cancelAppointment(appointmentToCancel.id);
        loadAppointments();
      } catch (e) {
        alert(e.message);
      }
    }
    setIsCancelModalOpen(false);
    setAppointmentToCancel(null);
  };

  const upcoming = appointments.filter((a) => OWNER_EDITABLE.includes(a.status) || a.status === 'IN_PROGRESS');
  const past = appointments.filter((a) => !upcoming.includes(a)).reverse();

  const renderCard = (item) => {
    const canManage = OWNER_EDITABLE.includes(item.status);
    return (
      <article key={item.id} className="mini-card appointment-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <span className="eyebrow" style={{ color: '#ff5a79', display: 'block' }}>{item.service}</span>
          <StatusBadge status={STATUS_LABELS[item.status] || item.status} type={badgeType(item.status)} />
        </div>

        <h3 style={{ fontSize: '1.2rem', marginTop: '12px' }}>
          {formatDate(item.appointmentDate)} • {item.appointmentTime}
        </h3>
        <p style={{ marginTop: '8px', color: '#4a4a4a' }}>
          <strong>Pet:</strong> {item.petName}<br />
          <strong>Clinic:</strong> {item.clinicName}
          {item.notes && (<><br /><strong>Your notes:</strong> {item.notes}</>)}
          {item.staffNote && (<><br /><strong>Clinic note:</strong> {item.staffNote}</>)}
        </p>

        {item.status === 'RESCHEDULE_REQUESTED' && (
          <div style={{ marginTop: '12px', padding: '12px', background: '#eff6ff', borderRadius: '12px', color: '#1e3a8a' }}>
            The clinic suggests <strong>{formatDate(item.suggestedDate)} at {item.suggestedTime}</strong>.
            <button className="btn btn-primary" style={{ display: 'block', marginTop: '8px', width: '100%' }} onClick={() => handleAcceptSuggestion(item)}>
              Accept new time
            </button>
          </div>
        )}

        <div className="shop-card-footer" style={{ marginTop: '16px', gap: '8px', display: 'flex' }}>
          {canManage ? (
            <>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleOpenManage(item)}>Change</button>
              <button className="btn btn-ghost" onClick={() => handleCancelRequest(item)} style={{ color: '#d43a57' }}>Cancel</button>
            </>
          ) : (
            <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic', margin: 0, padding: '8px 0' }}>
              This appointment is {(STATUS_LABELS[item.status] || item.status).toLowerCase()} and can no longer be changed.
            </p>
          )}
        </div>
      </article>
    );
  };

  if (isFormOpen) {
    return (
      <AppointmentForm
        initialData={editingAppointment}
        onSave={handleSaveForm}
        onCancel={() => setIsFormOpen(false)}
      />
    );
  }

  return (
    <>
      <section className="section-card hero-panel dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow">Appointments</p>
          <h1>Care Calendar</h1>
          <p>Book a visit, follow the clinic's answer, and manage upcoming appointments for all your pets.</p>
        </div>
        <button className="btn btn-primary btn-large" onClick={handleOpenBook}>
          + Book Appointment
        </button>
      </section>

      {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}

      <h2 style={{ margin: '8px 0 12px' }}>Upcoming</h2>
      <section className="appointment-grid">
        {upcoming.map(renderCard)}
        {!isLoading && upcoming.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', gridColumn: '1 / -1' }}>
            <p style={{ color: '#666' }}>No upcoming appointments.</p>
          </div>
        )}
        {isLoading && <p>Loading appointments…</p>}
      </section>

      {past.length > 0 && (
        <>
          <h2 style={{ margin: '24px 0 12px' }}>History</h2>
          <section className="appointment-grid">{past.map(renderCard)}</section>
        </>
      )}

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel it"
        isDanger={true}
        onConfirm={confirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </>
  );
}

export default Appointments;
