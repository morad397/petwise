import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';

const aiTips = [
  'Symptoms triage for fever, vomiting, or sudden weakness',
  'Breed-specific nutrition guidance for cats and dogs',
  'Medication interaction reminders and daily care suggestions',
  'Emergency severity check with a quick response workflow',
];

function AiVet() {
  return (
    <>
        <section className="section-card hero-panel dashboard-hero">
          <div>
            <p className="eyebrow">AI Vet</p>
            <h1>Your pet’s always-available guide</h1>
            <p>Ask about symptoms, nutrition, care routines, and known emergency patterns in a fast guided experience.</p>
          </div>
        </section>

        <section className="community-grid">
          {aiTips.map((tip) => (
            <article key={tip} className="mini-card appointment-card">
              <span className="eyebrow">AI insight</span>
              <h3>{tip}</h3>
              <p>Smart pet health guidance powered by a veterinary-style care assistant.</p>
            </article>
          ))}
        </section>
      </>
  );
}

export default AiVet;
