import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const initialAppointments = [
  {
    id: 1,
    title: 'Vet Visit',
    date: 'Thursday • 10:30 AM',
    detail: 'Annual wellness check with Dr. Lana Morgan.',
  },
  {
    id: 2,
    title: 'Vaccination',
    date: 'Saturday • 9:00 AM',
    detail: 'Seasonal booster appointment and follow-up reminder.',
  },
  {
    id: 3,
    title: 'Grooming',
    date: 'Sunday • 1:00 PM',
    detail: 'Hair, nail, and paw care session.',
  },
  {
    id: 4,
    title: 'Deworming',
    date: 'Next Monday • 4:00 PM',
    detail: 'Routine treatment visit recommended every 3 months.',
  },
];

function Appointments() {
  const [petName, setPetName] = useState('Your Pet');
  const [appointments, setAppointments] = useState(initialAppointments);

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

  return (
    <div className="app-shell">
      <header className="page-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">PetPal</span>
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
        <section className="section-card hero-panel dashboard-hero">
          <div>
            <p className="eyebrow">Appointments</p>
            <h1>{petName} care calendar</h1>
            <p>Book, review, and manage the next health visit and care session in a calm, single-view schedule.</p>
          </div>
        </section>

        <section className="appointment-grid">
          {appointments.map((item) => (
            <article key={item.id} className="mini-card appointment-card">
              <span className="eyebrow">{item.title}</span>
              <h3>{item.date}</h3>
              <p>{item.detail}</p>
              <div className="shop-card-footer">
                <button className="btn btn-secondary">Manage</button>
                <button className="btn btn-secondary" onClick={() => removeAppointment(item.id)}>Delete</button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Appointments;
