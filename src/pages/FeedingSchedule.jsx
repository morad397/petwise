import { useParams, Link } from 'react-router-dom';
import TopBar from '../components/TopBar';

const sampleFeedings = [
  { id: 1, petId: 1, time: '08:00 AM', food: 'Dry Food - 50g', notes: 'Morning meal' },
  { id: 2, petId: 1, time: '06:00 PM', food: 'Wet Food - 1 can', notes: 'Evening meal' },
  { id: 3, petId: 2, time: '07:00 AM', food: 'Dry Food - 200g', notes: 'Morning meal' },
  { id: 4, petId: 2, time: '12:00 PM', food: 'Treats - 3 pieces', notes: 'Midday snack' },
  { id: 5, petId: 2, time: '07:00 PM', food: 'Dry Food - 200g', notes: 'Evening meal' },
];

function FeedingSchedule() {
  const { id } = useParams();
  const feedings = sampleFeedings.filter((f) => f.petId === Number(id));

  return (
    <div className="app-shell">
      <TopBar />

      <main className="page-inner">
        <section className="section-card">
          <p className="eyebrow">Feeding routine</p>
          <h1>Feeding Schedule</h1>

          <div className="timeline-list">
            {feedings.length === 0 ? (
              <p className="empty-state">No feeding schedule found for this pet.</p>
            ) : (
              feedings.map((feeding) => (
                <article className="event-card" key={feeding.id}>
                  <div className="event-time">{feeding.time}</div>
                  <div>
                    <h3>{feeding.food}</h3>
                    <p>{feeding.notes}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default FeedingSchedule;