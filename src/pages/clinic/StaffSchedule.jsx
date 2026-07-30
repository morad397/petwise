import { useState } from 'react';

function StaffSchedule() {
  const [slots, setSlots] = useState([
    { time: '09:00 AM', status: 'AVAILABLE' },
    { time: '10:00 AM', status: 'BOOKED', details: 'Vaccination - Semba' },
    { time: '11:00 AM', status: 'AVAILABLE' },
    { time: '12:00 PM', status: 'BLOCKED', details: 'Lunch Break' },
    { time: '01:00 PM', status: 'AVAILABLE' },
    { time: '02:00 PM', status: 'BOOKED', details: 'Checkup - Fox' },
  ]);

  const toggleSlot = (index) => {
    setSlots(current => {
      const newSlots = [...current];
      const slot = newSlots[index];
      
      if (slot.status === 'BOOKED') {
        alert(`Cannot block a booked slot. Viewing appointment: ${slot.details}`);
      } else if (slot.status === 'AVAILABLE') {
        newSlots[index] = { ...slot, status: 'BLOCKED', details: 'Manually Blocked' };
      } else if (slot.status === 'BLOCKED') {
        newSlots[index] = { ...slot, status: 'AVAILABLE', details: '' };
      }
      return newSlots;
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Clinic Schedule</h1>
        <p style={{ color: '#64748b' }}>Manage your daily working hours and time slots.</p>
      </div>

      <section className="admin-card">
        <div className="admin-card-header">
          <h2>Today's Time Slots</h2>
        </div>
        
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
            {slots.map((slot, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 500 }}>{slot.time}</td>
                <td>
                  <span className={`status-pill status-${slot.status.toLowerCase()}`}>
                    {slot.status}
                  </span>
                </td>
                <td>{slot.details || '—'}</td>
                <td>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => toggleSlot(idx)}
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                  >
                    {slot.status === 'AVAILABLE' ? 'Block Slot' : slot.status === 'BLOCKED' ? 'Reopen Slot' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default StaffSchedule;
