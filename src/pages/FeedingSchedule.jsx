import { useParams, Link } from 'react-router-dom';

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
    <div>
      <Link to={`/pets/${id}`}>← Back to Pet Profile</Link>
      <h1>Feeding Schedule</h1>

      {feedings.length === 0 ? (
        <p>No feeding schedule found for this pet.</p>
      ) : (
        feedings.map((feeding) => (
          <div key={feeding.id}>
            <h3>{feeding.time}</h3>
            <p>Food: {feeding.food}</p>
            <p>Notes: {feeding.notes}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default FeedingSchedule;