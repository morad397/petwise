import { useParams, Link } from 'react-router-dom';

const sampleWeightLog = [
  { id: 1, petId: 1, date: '2026-06-01', weight: '4.2 kg' },
  { id: 2, petId: 1, date: '2026-05-01', weight: '4.1 kg' },
  { id: 3, petId: 1, date: '2026-04-01', weight: '4.0 kg' },
  { id: 4, petId: 2, date: '2026-06-01', weight: '28 kg' },
  { id: 5, petId: 2, date: '2026-05-01', weight: '27.5 kg' },
  { id: 6, petId: 2, date: '2026-04-01', weight: '27 kg' },
];

const sampleHabits = [
  { id: 1, petId: 1, habit: 'Sleeps 14 hours a day', status: 'Normal' },
  { id: 2, petId: 1, habit: 'Drinks water 3-4 times daily', status: 'Normal' },
  { id: 3, petId: 2, habit: 'Walks twice a day', status: 'Normal' },
  { id: 4, petId: 2, habit: 'Scratches ears frequently', status: 'Monitor' },
];

function WeightHabits() {
  const { id } = useParams();
  const weightLog = sampleWeightLog.filter((w) => w.petId === Number(id));
  const habits = sampleHabits.filter((h) => h.petId === Number(id));

  return (
    <div>
      <Link to={`/pets/${id}`}>← Back to Pet Profile</Link>

      <h1>Weight Log</h1>
      {weightLog.length === 0 ? (
        <p>No weight records found.</p>
      ) : (
        weightLog.map((entry) => (
          <div key={entry.id}>
            <h3>{entry.date}</h3>
            <p>Weight: {entry.weight}</p>
            <hr />
          </div>
        ))
      )}

      <h1>Daily Habits</h1>
      {habits.length === 0 ? (
        <p>No habits recorded.</p>
      ) : (
        habits.map((habit) => (
          <div key={habit.id}>
            <h3>{habit.habit}</h3>
            <p>Status: {habit.status}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default WeightHabits;