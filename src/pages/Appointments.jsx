import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const initialAppointments = [
  {
    id: 1,
    title: 'Vet Visit',
    date: 'Thursday • 10:30 AM',
    detail: 'Annual wellness check with Dr. Lana Morgan.',
    status: 'Upcoming'
  },
  {
    id: 2,
    title: 'Vaccination',
    date: 'Saturday • 9:00 AM',
    detail: 'Seasonal booster appointment and follow-up reminder.',
    status: 'Upcoming'
  },
];

function Appointments() {
  const [petName, setPetName] = useState('Your Pet');
  const [appointments, setAppointments] = useState(initialAppointments);
  
  // Booking Wizard State
  const [isBooking, setIsBooking] = useState(false);
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    service: '',
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    const savedPets = JSON.parse(localStorage.getItem('petwise-pets') || '[]');
    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    const currentUserEmail = savedUser.email || '';
    const userPets = savedPets.filter((pet) => !pet.ownerEmail || pet.ownerEmail === currentUserEmail);
    const firstPet = userPets[0];

    if (firstPet?.name) {
      setPetName(firstPet.name);
    }
  }, []);

  const removeAppointment = (appointmentId) => {
    setAppointments((currentAppointments) =>
      currentAppointments.filter((appointment) => appointment.id !== appointmentId)
    );
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const finishBooking = () => {
    const newAppointment = {
      id: Date.now(),
      title: bookingData.service,
      date: `${bookingData.date} • ${bookingData.time}`,
      detail: bookingData.notes || 'No notes provided.',
      status: 'Upcoming'
    };
    setAppointments([...appointments, newAppointment]);
    setIsBooking(false);
    setStep(1);
    setBookingData({ service: '', date: '', time: '', notes: '' });
  };

  return (
    <div className="app-shell">
      <header className="page-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">Petwise</span>
        </div>
        <nav className="main-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/appointments">Appointments</Link>
          <Link to="/reminders">Reminders</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/community">Community</Link>
          <Link to="/ai-vet">AI Vet</Link>
          <Link to="/sos">SOS</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>

      <main className="page-inner dashboard-layout">
        {!isBooking ? (
          <>
            <section className="section-card hero-panel dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="eyebrow">Appointments</p>
                <h1>{petName}'s Care Calendar</h1>
                <p>Book, review, and manage the next health visit and care session in a calm, single-view schedule.</p>
              </div>
              <button className="btn btn-primary btn-large" onClick={() => setIsBooking(true)}>
                + Book Appointment
              </button>
            </section>

            <section className="appointment-grid">
              {appointments.map((item) => (
                <article key={item.id} className="mini-card appointment-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="eyebrow" style={{ color: '#ff5a79' }}>{item.title}</span>
                    <span className="status-pill">{item.status}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginTop: '8px' }}>{item.date}</h3>
                  <p style={{ marginTop: '8px' }}>{item.detail}</p>
                  <div className="shop-card-footer" style={{ marginTop: '16px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }}>Manage</button>
                    <button className="btn btn-ghost" onClick={() => removeAppointment(item.id)} style={{ color: '#d43a57' }}>Cancel</button>
                  </div>
                </article>
              ))}
              {appointments.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', gridColumn: '1 / -1' }}>
                  <p>No upcoming appointments.</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="section-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2>Book New Appointment</h2>
              <span className="eyebrow">Step {step} of 4</span>
            </div>

            {/* Step 1: Service */}
            {step === 1 && (
              <div>
                <h3 style={{ marginBottom: '20px' }}>Select Service</h3>
                <div className="dash-quick-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
                  {['Vet Consultation', 'Vaccination', 'Grooming', 'Dental Checkup'].map(service => (
                    <button 
                      key={service}
                      className={`dash-quick-btn ${bookingData.service === service ? 'dash-quick-pink' : ''}`}
                      style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '20px', border: bookingData.service === service ? '2px solid #ff5a79' : '2px solid #eef1f6', background: 'white' }}
                      onClick={() => setBookingData({...bookingData, service})}
                    >
                      <Stethoscope color={bookingData.service === service ? '#ff5a79' : '#8493a8'} />
                      <span style={{ fontSize: '1.1rem', marginLeft: '12px', color: '#0d1b2a' }}>{service}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div>
                <h3 style={{ marginBottom: '20px' }}>Select Date & Time</h3>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <span>Date</span>
                  <input 
                    type="date" 
                    value={bookingData.date} 
                    onChange={e => setBookingData({...bookingData, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <span>Time</span>
                  <input 
                    type="time" 
                    value={bookingData.time} 
                    onChange={e => setBookingData({...bookingData, time: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Notes */}
            {step === 3 && (
              <div>
                <h3 style={{ marginBottom: '20px' }}>Additional Notes</h3>
                <div className="form-group">
                  <span>Reason for visit or special instructions</span>
                  <textarea 
                    rows="4"
                    style={{ border: '1px solid rgba(18,38,63,0.12)', borderRadius: '12px', background: '#f8fbff', padding: '12px' }}
                    value={bookingData.notes}
                    onChange={e => setBookingData({...bookingData, notes: e.target.value})}
                    placeholder="E.g., Luna has been scratching her ears a lot recently..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle size={64} color="#ff5a79" style={{ margin: '0 auto 20px' }} />
                <h3>Confirm Appointment</h3>
                <div style={{ background: '#f8fbff', padding: '20px', borderRadius: '16px', marginTop: '20px', textAlign: 'left' }}>
                  <p><strong>Service:</strong> {bookingData.service}</p>
                  <p style={{ marginTop: '10px' }}><strong>Date:</strong> {bookingData.date}</p>
                  <p style={{ marginTop: '10px' }}><strong>Time:</strong> {bookingData.time}</p>
                  <p style={{ marginTop: '10px' }}><strong>Notes:</strong> {bookingData.notes || 'None'}</p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
              {step > 1 ? (
                <button className="btn btn-secondary" onClick={handlePrevStep}>
                  <ArrowLeft size={18} /> Back
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={() => setIsBooking(false)}>
                  Cancel
                </button>
              )}
              
              {step < 4 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleNextStep}
                  disabled={
                    (step === 1 && !bookingData.service) ||
                    (step === 2 && (!bookingData.date || !bookingData.time))
                  }
                >
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={finishBooking}>
                  Confirm Booking
                </button>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Appointments;
