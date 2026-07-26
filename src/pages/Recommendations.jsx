import { useParams, Link } from 'react-router-dom';
import TopBar from '../components/TopBar';

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
    <div className="app-shell">
      <TopBar />

      <main className="page-inner">
        <section className="section-card">
          <p className="eyebrow">AI-powered care guidance</p>
          <h1>Recommendations</h1>
          <p className="section-copy">Suggestions based on your pet profile and recent activity.</p>

          <div className="card-grid">
            {recommendations.length === 0 ? (
              <p className="empty-state">No recommendations available yet.</p>
            ) : (
              recommendations.map((rec) => (
                <article className="mini-card" key={rec.id}>
                  <h3>{rec.category}</h3>
                  <p>{rec.text}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Recommendations;