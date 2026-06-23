import { useParams, Link } from 'react-router-dom';

const sampleRecommendations = [
  { id: 1, petId: 1, category: 'Nutrition', text: 'Consider switching to a high-protein diet for indoor cats.' },
  { id: 2, petId: 1, category: 'Activity', text: 'British Shorthairs need daily play sessions to prevent obesity.' },
  { id: 3, petId: 1, category: 'Health', text: 'Next vaccination (FVRCP) is due in November 2026.' },
  { id: 4, petId: 2, category: 'Nutrition', text: 'Golden Retrievers benefit from omega-3 supplements for coat health.' },
  { id: 5, petId: 2, category: 'Activity', text: 'Recommended: 1-2 hours of exercise daily to maintain healthy weight.' },
  { id: 6, petId: 2, category: 'Health', text: 'Monitor ear scratching habit — consider a vet checkup if it continues.' },
];

function Recommendations() {
  const { id } = useParams();
  const recommendations = sampleRecommendations.filter((r) => r.petId === Number(id));

  return (
    <div>
      <Link to={`/pets/${id}`}>← Back to Pet Profile</Link>
      <h1>Recommendations</h1>
      <p>AI-powered suggestions based on your pet's profile and data:</p>

      {recommendations.length === 0 ? (
        <p>No recommendations available yet.</p>
      ) : (
        recommendations.map((rec) => (
          <div key={rec.id}>
            <h3>{rec.category}</h3>
            <p>{rec.text}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Recommendations;