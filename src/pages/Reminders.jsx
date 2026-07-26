import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';

const reminders = [
  { title: 'Feeding reminder', detail: 'Dinner in 30 minutes', time: 'Today • 6:30 PM' },
  { title: 'Medication', detail: 'Vitamin booster after lunch', time: 'Tomorrow • 12:00 PM' },
  { title: 'Walk reminder', detail: 'Morning walk and hydration check', time: 'Friday • 8:00 AM' },
];

function Reminders() {
  return (
    <div className="app-shell">
      <TopBar />

      <main className="page-inner dashboard-layout">
        <section className="section-card hero-panel dashboard-hero">
          <div>
            <p className="eyebrow">Reminders</p>
            <h1>Care schedule</h1>
            <p>Never miss a feeding, health check, walk, or medication step again with a quick daily view.</p>
          </div>
        </section>

        <section className="appointment-grid">
          {reminders.map((item) => (
            <article key={item.title} className="mini-card appointment-card">
              <span className="eyebrow">{item.time}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <button className="btn btn-secondary">Mark done</button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Reminders;
