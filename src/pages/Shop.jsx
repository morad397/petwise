import { Link } from 'react-router-dom';

const products = [
  {
    name: 'Premium Cat Food',
    price: '$18',
    type: 'Cat',
    detail: 'Protein-rich, grain-free cat food.',
    image: 'https://images.unsplash.com/photo-1605001011156-c2bf2f1f2db5?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Cat Toys Bundle',
    price: '$14',
    type: 'Cat',
    detail: 'Soft toys for play and scratching.',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Cat Litter Tray',
    price: '$22',
    type: 'Cat',
    detail: 'Easy-clean enclosure for daily care.',
    image: 'https://images.unsplash.com/photo-1615461066841-211d7a4166b5?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Cat Shampoo',
    price: '$16',
    type: 'Cat',
    detail: 'Gentle grooming wash for sensitive skin.',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Dog Food Pack',
    price: '$24',
    type: 'Dog',
    detail: 'Balanced meal pack for daily nutrition.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Dog Leash & Collar',
    price: '$21',
    type: 'Dog',
    detail: 'Comfortable everyday walking set.',
    image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Dog Bath Set',
    price: '$19',
    type: 'Dog',
    detail: 'Cleaning essentials for grooming and hygiene.',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Dog Cage Travel Kit',
    price: '$35',
    type: 'Dog',
    detail: 'Portable carrier and comfort accessories.',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
  },
];

function Shop() {
  return (
    <div className="app-shell">
      <header className="page-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">🐾</span>
          <span className="brand-name">PetPal</span>
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
            <p className="eyebrow">Pet Shop</p>
            <h1>Care essentials</h1>
            <p>Everything your pet needs for a healthier, happier routine, curated in one calm storefront.</p>
          </div>
        </section>

        <section className="shop-grid">
          {products.map((product) => (
            <article key={product.name} className="shop-card">
              <img src={product.image} alt={product.name} className="shop-card-image" />
              <div className="shop-card-body">
                <span className="eyebrow">{product.type}</span>
                <h3>{product.name}</h3>
                <p>{product.detail}</p>
                <div className="shop-card-footer">
                  <strong>{product.price}</strong>
                  <button className="btn btn-secondary">Add to cart</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Shop;
