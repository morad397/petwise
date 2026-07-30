import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import heroImage from '../assets/hero.png';

import TopBar from '../components/TopBar';

const DEFAULT_CHECKLIST = [
  { id: 'walk', label: 'Morning walk (30 min)', done: true },
  { id: 'breakfast', label: 'Breakfast — 250g salmon food', done: true },
  { id: 'flea', label: 'Flea prevention tablet', done: false },
  { id: 'chew', label: 'Dental chew stick', done: false },
  { id: 'play', label: 'Evening playtime (20 min)', done: false },
];

const RECENT_ACTIVITY = [
  { id: 1, icon: '💉', label: 'Flea treatment completed', time: '2 days ago' },
  { id: 2, icon: '🩺', label: 'Vet checkup — Dr. Sarah Chen', time: '1 week ago' },
  { id: 3, icon: '⚖️', label: 'Weight recorded: 28 kg', time: '1 week ago' },
  { id: 4, icon: '📦', label: 'Food order delivered', time: '2 weeks ago' },
];

const UPCOMING = [
  { id: 1, title: 'Annual Vaccination', date: '2026-07-02 · 10:00 AM', with: 'Dr. Sarah Chen', status: 'confirmed' },
  { id: 2, title: 'Dental Cleaning', date: '2026-07-08 · 2:30 PM', with: 'Dr. James Park', status: 'pending' },
];

const DUE_REMINDERS = [
  { id: 1, icon: '💉', label: 'Rabies Booster', daysLeft: '21d' },
  { id: 2, icon: '🐛', label: 'Flea & Tick Prevention', daysLeft: '7d' },
  { id: 3, icon: '🍖', label: 'Salmon Dry Food Restock', daysLeft: '6d' },
];

const AI_PICKS = [
  { id: 1, image: heroImage, label: 'Premium Salmon Dry Food', price: '38.99' },
  { id: 2, image: heroImage, label: 'Orthopedic Memory Foam Bed', price: '89.99' },
];

import PetImage from '../components/PetImage';

function Dashboard() {
  const [pets, setPets] = useState([]);
  const [userName, setUserName] = useState('Pet Owner');
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [activePetIndex, setActivePetIndex] = useState(0);

  useEffect(() => {
    // Ensure DB is initialized and migrated
    import('../services/dataService').then(({ initializeDB, getPetsByOwnerId }) => {
      initializeDB();

      const fetchPetsAndUser = () => {
        const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
        
        // Use the strict ownership rule
        const userPets = savedUser.id ? getPetsByOwnerId(savedUser.id) : [];

        setPets(userPets);
        setUserName(savedUser.fullName || 'Pet Owner');

        let index = Number(localStorage.getItem('petwise-active-pet-index') || 0);
        if (index >= userPets.length) index = 0;
        setActivePetIndex(index);
      };

      const handlePetChange = () => {
        let index = Number(localStorage.getItem('petwise-active-pet-index') || 0);
        setActivePetIndex(index);
      };

      fetchPetsAndUser();
      window.addEventListener('pet-changed', handlePetChange);

      return () => window.removeEventListener('pet-changed', handlePetChange);
    });
  }, []);

  const activePet = pets[activePetIndex] || pets[0] || { name: 'Your Pet', species: 'Pet', breed: '', age: '' };
  const recentActivity = RECENT_ACTIVITY;
  const upcoming = UPCOMING;
  const dueReminders = DUE_REMINDERS;
  const aiPicks = AI_PICKS;

  const toggleChecklistItem = (id) => {
    setChecklist((current) =>
      current.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="app-shell">
      <TopBar />

      <main className="page-inner dashboard-layout">
        <section className="section-card hero-panel dashboard-hero">
          <div>
            <p className="eyebrow">Your pet family</p>
            <h1>Welcome back, {userName}</h1>
            <p>Track appointments, reminders, health notes, and emergency support from one polished home dashboard.</p>
          </div>
          <div className="hero-actions">
            <Link to="/add-pet" className="btn btn-primary">+ Add New Pet</Link>
            <Link to="/appointments" className="btn btn-secondary">View Calendar</Link>
          </div>
        </section>

        {pets.length === 0 ? (
          <section className="section-card empty-dashboard-state">
            <h2>No pets added yet</h2>
            <p>Add your first dog or cat to start building your care dashboard.</p>
            <Link to="/add-pet" className="btn btn-primary">Add Your First Pet</Link>
          </section>
        ) : (
          <>
            <div className="dash-greeting-row">
              <div>
                <h1 className="dash-greeting">Good morning, {userName.split(' ')[0]}! ☀️</h1>
                <p className="dash-subgreeting">
                  {activePet.name} is doing great today. Here&apos;s your daily summary.
                </p>
              </div>
              <div className="dash-weather-pill">🌤️ 24°C · Sunny · Great walk weather!</div>
            </div>

            <div className="dash-grid">
              <div className="dash-col-main">
                <section className="section-card dash-pet-card">
                  <PetImage pet={activePet} className="dash-pet-avatar" />
                  <div className="dash-pet-info">
                    <div className="dash-pet-name-row">
                      <h3>{activePet.name}</h3>
                      <span className="status-pill">{activePet.species}</span>
                    </div>
                    <p className="dash-pet-sub">{activePet.breed} · {activePet.age} · {activePet.weight || '4.2 kg'}</p>
                    <div className="dash-pet-stats">
                      <div>
                        <strong>{activePet.healthScore || 87}%</strong>
                        <span>Health Score</span>
                      </div>
                      <div>
                        <strong>{activePet.nextVet || 'Jul 2'}</strong>
                        <span>Next Vet</span>
                      </div>
                      <div>
                        <strong>{dueReminders.length} due</strong>
                        <span>Reminders</span>
                      </div>
                    </div>
                  </div>
                  <div className="dash-health-ring" style={{ '--pct': `${activePet.healthScore || 87}%` }}>
                    <span>{activePet.healthScore || 87}</span>
                    <small>Health</small>
                  </div>
                </section>

                <section className="section-card dash-checklist-card">
                  <div className="dash-card-header">
                    <h3>Daily Care Checklist</h3>
                    <span className="dash-muted">{checklist.filter((c) => c.done).length}/{checklist.length} done</span>
                  </div>
                  <div className="dash-progress-track">
                    <div
                      className="dash-progress-fill"
                      style={{ width: `${(checklist.filter((c) => c.done).length / checklist.length) * 100}%` }}
                    />
                  </div>
                  <ul className="dash-checklist">
                    {checklist.map((item) => (
                      <li key={item.id} className={item.done ? 'is-done' : ''}>
                        <button
                          type="button"
                          className="dash-checkbox"
                          onClick={() => toggleChecklistItem(item.id)}
                          aria-label={`Toggle ${item.label}`}
                        />
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="section-card dash-activity-card">
                  <h3>Recent Activity</h3>
                  <ul className="dash-activity-list">
                    {recentActivity.map((activity) => (
                      <li key={activity.id}>
                        <span className="dash-activity-icon">{activity.icon}</span>
                        <div>
                          <p>{activity.label}</p>
                          <small>{activity.time}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="dash-col-side">
                <section className="section-card dash-quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="dash-quick-grid">
                    <Link to="/appointments" className="dash-quick-btn dash-quick-pink">
                      <span>📅</span>
                      Book Vet
                    </Link>
                    <Link to="/ai-vet" className="dash-quick-btn dash-quick-purple">
                      <span>💬</span>
                      AI Vet
                    </Link>
                    <Link to="/reminders" className="dash-quick-btn dash-quick-green">
                      <span>🔔</span>
                      Reminders
                    </Link>
                    <Link to="/shop" className="dash-quick-btn dash-quick-blue">
                      <span>🛍️</span>
                      Shop
                    </Link>
                  </div>
                </section>

                <section className="section-card dash-upcoming-card">
                  <div className="dash-card-header">
                    <h3>Upcoming</h3>
                    <Link to="/appointments" className="dash-link">View all</Link>
                  </div>
                  <ul className="dash-upcoming-list">
                    {upcoming.map((item) => (
                      <li key={item.id}>
                        <div>
                          <p>{item.title}</p>
                          <small>{item.date} · {item.with}</small>
                        </div>
                        <span className={`dash-status-badge dash-status-${item.status}`}>
                          {item.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/appointments" className="dash-add-btn">+ Book Appointment</Link>
                </section>

                <section className="section-card dash-reminders-card">
                  <div className="dash-card-header">
                    <h3>Due Reminders</h3>
                    <Link to="/reminders" className="dash-link">View all</Link>
                  </div>
                  <ul className="dash-due-list">
                    {dueReminders.map((item) => (
                      <li key={item.id}>
                        <span className="dash-activity-icon">{item.icon}</span>
                        <div>
                          <p>{item.label}</p>
                        </div>
                        <span className="dash-days-left">{item.daysLeft}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="section-card dash-ai-picks-card">
                  <div className="dash-card-header">
                    <h3>AI Picks for {activePet.name}</h3>
                    <Link to="/shop" className="dash-link">Shop all</Link>
                  </div>
                  <ul className="dash-picks-list">
                    {aiPicks.map((item) => (
                      <li key={item.id}>
                        <img src={item.image} alt={item.label} />
                        <div>
                          <p>{item.label}</p>
                          <small>${item.price}</small>
                        </div>
                        <Link to="/shop" className="dash-cart-btn" aria-label={`Add ${item.label} to cart`}>🛒</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
