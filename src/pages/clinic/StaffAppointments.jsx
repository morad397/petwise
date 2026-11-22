import { Fragment, useState, useEffect } from 'react';
import PetImage from '../../components/PetImage';
import { getAppointments, setAppointmentStatus, getAvailableSlots } from '../../services/dataService';
import { formatDate, todayIso } from '../../services/medicalService';

const small = { padding: '6px 12px', fontSize: '0.8rem' };

function StaffAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // reschedule form for one appointment
  const [rescheduleFor, setRescheduleFor] = useState(null);
  const [suggestion, setSuggestion] = useState({ date: '', time: '', note: '' });
  const [suggestionSlots, setSuggestionSlots] = useState({ status: '', slots: [] });

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

  // free times for the suggested date (the appointment's own time counts as free)
  useEffect(() => {
    if (!rescheduleFor || !suggestion.date) return;
    let cancelled = false;
    getAvailableSlots(rescheduleFor.clinicId, suggestion.date, rescheduleFor.id)
      .then((result) => !cancelled && setSuggestionSlots(result))
      .catch(() => !cancelled && setSuggestionSlots({ status: 'ERROR', slots: [] }));
    return () => {
      cancelled = true;
    };
  }, [rescheduleFor, suggestion.date]);

  const changeStatus = async (app, status, extra) => {
    try {
      await setAppointmentStatus(app.id, status, extra);
      await loadAppointments();
      return true;
    } catch (e) {
      alert(e.message);
      return false;
    }
  };

  const handleAction = (app, action) => {
    if (action === 'CONFIRM') changeStatus(app, 'CONFIRMED');
    if (action === 'REJECT') {
      const reason = prompt('Reason for rejecting (the owner will see it):');
      if (reason !== null) changeStatus(app, 'REJECTED', { note: reason || null });
    }
    if (action === 'SUGGEST_TIME') {
      setRescheduleFor(app);
      setSuggestion({ date: app.appointmentDate, time: '', note: '' });
      setSuggestionSlots({ status: '', slots: [] });
    }
    if (action === 'IN_PROGRESS') changeStatus(app, 'IN_PROGRESS');
    if (action === 'COMPLETE') {
      const notes = prompt('Visit notes (saved to the pet\'s vet visit history):');
      if (notes !== null) changeStatus(app, 'COMPLETED', { note: notes || null });
    }
  };

  const sendSuggestion = async (event) => {
    event.preventDefault();
    const ok = await changeStatus(rescheduleFor, 'RESCHEDULE_REQUESTED', {
      suggestedDate: suggestion.date,
      suggestedTime: suggestion.time,
      note: suggestion.note || null,
    });
    if (ok) setRescheduleFor(null);
  };

  const filteredAppointments = appointments.filter((app) => {
    if (filter !== 'ALL' && app.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return [app.petName, app.ownerName, app.service, app.notes].some((v) => v && v.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#0f2138' }}>Appointments</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Manage incoming requests and today's visits.</p>
        </div>
      </div>

      {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}

      <div className="section-card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search pet, owner, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', flex: 1, minWidth: '200px', background: '#f8fafc', color: '#0f2138' }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', color: '#0f2138', cursor: 'pointer' }}
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

      <section className="section-card" style={{ padding: '0' }}>
        {isLoading ? (
          <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}><p>Loading…</p></div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p>No appointments found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date / Time</th>
                  <th>Pet</th>
                  <th>Owner</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => (
                  <Fragment key={app.id}>
                    <tr>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(app.appointmentDate)} <br /> <small style={{ color: '#64748b' }}>{app.appointmentTime}</small>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <PetImage pet={{ name: app.petName, species: app.petSpecies }} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                          <div style={{ fontWeight: 500, color: '#0f2138' }}>{app.petName}</div>
                        </div>
                      </td>
                      <td style={{ color: '#64748b' }}>{app.ownerName}</td>
                      <td>
                        {app.service}
                        {app.notes && <small style={{ display: 'block', color: '#64748b' }}>{app.notes}</small>}
                        {app.status === 'RESCHEDULE_REQUESTED' && (
                          <small style={{ display: 'block', color: '#8b5cf6' }}>Suggested: {formatDate(app.suggestedDate)} {app.suggestedTime}</small>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill status-${(app.status || '').toLowerCase()}`}>{app.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {app.status === 'PENDING' && (
                            <>
                              <button className="btn btn-primary" style={{ ...small, background: '#10b981' }} onClick={() => handleAction(app, 'CONFIRM')}>Confirm</button>
                              <button className="btn btn-secondary" style={{ ...small, borderColor: '#8b5cf6', color: '#8b5cf6' }} onClick={() => handleAction(app, 'SUGGEST_TIME')}>Reschedule</button>
                              <button className="btn btn-secondary" style={{ ...small, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleAction(app, 'REJECT')}>Reject</button>
                            </>
                          )}
                          {app.status === 'CONFIRMED' && (
                            <>
                              <button className="btn btn-primary" style={{ ...small, background: '#3b82f6' }} onClick={() => handleAction(app, 'IN_PROGRESS')}>Start Visit</button>
                              <button className="btn btn-secondary" style={{ ...small, borderColor: '#8b5cf6', color: '#8b5cf6' }} onClick={() => handleAction(app, 'SUGGEST_TIME')}>Reschedule</button>
                            </>
                          )}
                          {app.status === 'IN_PROGRESS' && (
                            <button className="btn btn-primary" style={{ ...small, background: '#14b8a6', color: 'white' }} onClick={() => handleAction(app, 'COMPLETE')}>Complete</button>
                          )}
                          {app.status === 'RESCHEDULE_REQUESTED' && (
                            <small style={{ color: '#64748b' }}>Waiting for owner</small>
                          )}
                        </div>
                      </td>
                    </tr>
                    {rescheduleFor?.id === app.id && (
                      <tr>
                        <td colSpan="6" style={{ background: '#f8fafc' }}>
                          <form onSubmit={sendSuggestion} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <label className="form-group" style={{ margin: 0 }}>
                              <span>New date</span>
                              <input type="date" required min={todayIso()} value={suggestion.date}
                                onChange={(e) => setSuggestion({ ...suggestion, date: e.target.value, time: '' })} />
                            </label>
                            <label className="form-group" style={{ margin: 0 }}>
                              <span>New time</span>
                              <select required value={suggestion.time} onChange={(e) => setSuggestion({ ...suggestion, time: e.target.value })}>
                                <option value="">
                                  {suggestionSlots.status === 'CLINIC_CLOSED' ? 'Clinic closed' : suggestionSlots.status === 'FULLY_BOOKED' ? 'Fully booked' : '-- Choose --'}
                                </option>
                                {suggestionSlots.slots.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </label>
                            <label className="form-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
                              <span>Note to owner</span>
                              <input value={suggestion.note} onChange={(e) => setSuggestion({ ...suggestion, note: e.target.value })} placeholder="Optional" />
                            </label>
                            <button type="submit" className="btn btn-primary" style={small}>Send suggestion</button>
                            <button type="button" className="btn btn-ghost" style={small} onClick={() => setRescheduleFor(null)}>Cancel</button>
                          </form>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default StaffAppointments;
