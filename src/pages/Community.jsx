import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';

const posts = [
  {
    title: 'Petwise has completely changed how I care for Luna!',
    author: 'Sarah Jenkins',
    detail: 'I used to forget vet appointments and lose track of vaccinations. Having everything in one beautiful dashboard gives me so much peace of mind.',
  },
  {
    title: 'The AI Vet feature is a lifesaver',
    author: 'Mark Davis',
    detail: 'When my cat started acting strange at 2 AM, the AI Vet gave me immediate advice on what to check for and whether it was an emergency. Absolutely brilliant!',
  },
  {
    title: 'Best pet management app out there',
    author: 'Emily R.',
    detail: 'The dark mode is stunning, the shop has amazing curated items, and the whole app is just so easy to use. I recommend Petwise to every pet owner I know.',
  },
  {
    title: 'Finally, an app that looks good and works perfectly',
    author: 'James T.',
    detail: 'Most pet apps look like they were built in 2010. Petwise feels premium, runs incredibly fast, and actually helps me keep my dogs healthier.',
  }
];

function Community() {
  return (
    <div className="app-shell">
      <TopBar />

      <main className="page-inner dashboard-layout">
        <section className="section-card hero-panel dashboard-hero">
          <div>
            <p className="eyebrow">Community</p>
            <h1>What people are saying</h1>
            <p>Read testimonials and feedback from pet owners who use Petwise every day to care for their furry family members.</p>
          </div>
        </section>

        <section className="community-grid">
          {posts.map((post) => (
            <article key={post.title} className="mini-card appointment-card">
              <span className="eyebrow">App Review</span>
              <h3>{post.title}</h3>
              <p>{post.detail}</p>
              <strong>{post.author}</strong>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Community;
