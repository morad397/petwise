import { useEffect, useState } from 'react';
import { getStaffSchedule, blockTime, unblockTime } from '../../services/dataService';
import { formatDate, todayIso } from '../../services/medicalService';

const small = { padding: '6px 12px', fontSize: '0.8rem' };

// move a "YYYY-MM-DD" date by n days
const shiftDate = (iso, days) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d + days).toLocaleDateString('en-CA');
};

function StaffSchedule() {
  const [date, setDate] = useState(todayIso());
  const [day, setDay] = useState(null);
  const [error, setError] = useState('');
  const [busyTime, setBusyTime] = useState(null);

  const load = (forDate) =>
    getStaffSchedule(forDate)
      .then((result) => {
        setDay(result);
        setError('');
      })
      .catch((e) => {
        setDay(null);
        setError(e.message);
      });

  useEffect(() => {
    load(date);
  }, [date]);

  const run = async (time, action) => {
    setBusyTime(time);
    try {
      await action();
      await load(date);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyTime(null);
    }
  };

  const handleBlock = (slot) => {
    const reason = prompt('Why is this time blocked? (optional, e.g. Lunch break)');
    if (reason === null) return;
    run(slot.time, () => blockTime(date, slot.time, reason));
  };

  const slots = day?.slots || [];
  const counts = {
    free: slots.filter((s) => s.state === 'AVAILABLE').length,
    booked: slots.filter((s) => s.state === 'BOOKED').length,
    blocked: slots.filter((s) => s.state === 'BLOCKED').length,
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#0f2138' }}>Clinic Schedule</h1>
        <p style={{ color: '#64748b', margin: 0 }}>See each day's time slots and block times so owners cannot book them.</p>
      </div>

      <section className="section-card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" style={small} onClick={() => setDate(shiftDate(date, -1))}>← Previous day</button>
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '10px' }} />
          <button className="btn btn-ghost" style={small} onClick={() => setDate(shiftDate(date, 1))}>Next day →</button>
          {date !== todayIso() && (
            <button className="btn btn-secondary" style={small} onClick={() => setDate(todayIso())}>Today</button>
          )}
          {day?.isOpen && (
            <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.9rem' }}>
              {counts.free} free • {counts.booked} booked • {counts.blocked} blocked
            </span>
          )}
        </div>
      </section>

      {error && (
        <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', borderRadius: '12px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <section className="section-card" style={{ padding: 0 }}>
        <div style={{ padding: '24px 24px 16px 24px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f2138', margin: 0 }}>Time Slots for {formatDate(date)}</h2>
        </div>

        {day && !day.isOpen ? (
          <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p>The clinic is closed on this day.</p>
          </div>
        ) : !day ? (
          !error && <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}><p>Loading…</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.time}>
                    <td style={{ fontWeight: 500, color: '#0f2138' }}>{slot.time}</td>
                    <td>
                      <span className={`status-pill status-${slot.state.toLowerCase()}`}>{slot.state}</span>
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {slot.state === 'BOOKED' && (
                        <>
                          {slot.service} — {slot.petName} ({slot.ownerName})
                          <small style={{ display: 'block' }}>{slot.appointmentStatus}</small>
                        </>
                      )}
                      {slot.state === 'BLOCKED' && (slot.reason || 'Blocked')}
                      {slot.state === 'AVAILABLE' && '—'}
                    </td>
                    <td>
                      {slot.state === 'AVAILABLE' && (
                        <button className="btn btn-secondary" style={small} disabled={busyTime === slot.time} onClick={() => handleBlock(slot)}>
                          Block Slot
                        </button>
                      )}
                      {slot.state === 'BLOCKED' && (
                        <button className="btn btn-secondary" style={small} disabled={busyTime === slot.time}
                          onClick={() => run(slot.time, () => unblockTime(slot.blockId))}>
                          Reopen Slot
                        </button>
                      )}
                      {slot.state === 'BOOKED' && <small style={{ color: '#94a3b8' }}>See Appointments</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default StaffSchedule;
