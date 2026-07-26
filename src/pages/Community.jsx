import { Link } from 'react-router-dom';

const posts = [
  {
    title: 'How do you keep a dog calm during thunderstorms?',
    author: 'Maya R.',
    detail: 'Shared tips on breathing routines, comfort blankets, and safe indoor play.',
  },
  {
    title: 'Best litter box habits for a new cat parent',
    author: 'Liam T.',
    detail: 'A practical checklist for setup, cleaning, and daily routines.',
  },
  {
    title: 'What foods should I avoid for a senior pet?',
    author: 'Noor S.',
    detail: 'Pro advice from experienced owners on nutrition and pet care transitions.',
  },
];

function Community() {
  return (
    <div className="app-shell">
      <header className="page-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">Petwise</span>
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
            <p className="eyebrow">Community</p>
            <h1>Pet care conversations</h1>
            <p>Connect with other pet owners, ask for advice, and share your best everyday pet-care wins.</p>
          </div>
        </section>

        <section className="community-grid">
          {posts.map((post) => (
            <article key={post.title} className="mini-card appointment-card">
              <span className="eyebrow">Community post</span>
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
