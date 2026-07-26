import { Link } from 'react-router-dom';
import shopShampoo from '../assets/shop-shampoo.png';

import shopToy from '../assets/shop-toy.png';
import shopFood from '../assets/shop-food.png';
import shopClothes from '../assets/shop-clothes.png';
import shopBed from '../assets/shop-bed.png';
import TopBar from '../components/TopBar';

const products = [
  {
    name: 'Premium Pet Shampoo',
    price: '$18',
    type: 'Dog & Cat',
    detail: 'Gentle, soothing wash for a shiny, healthy coat.',
    image: shopShampoo,
  },
  {
    name: 'Interactive Rubber Ball',
    price: '$12',
    type: 'Dog',
    detail: 'Durable, bouncy toy perfect for fetch and playtime.',
    image: shopToy,
  },
  {
    name: 'Healthy Dry Pet Food',
    price: '$45',
    type: 'Dog & Cat',
    detail: 'Nutrient-rich, balanced meal for optimal health.',
    image: shopFood,
  },
  {
    name: 'Cozy Knitted Sweater',
    price: '$24',
    type: 'Small Pets',
    detail: 'Keep your pet warm and stylish in cold weather.',
    image: shopClothes,
  },
  {
    name: 'Luxurious Plush Pet Bed',
    price: '$65',
    type: 'Dog & Cat',
    detail: 'Ultra-soft, comfortable bed for perfect sleep.',
    image: shopBed,
  },
  {
    name: 'Cat Litter Tray',
    price: '$22',
    type: 'Cat',
    detail: 'Easy-clean enclosure for daily care.',
    image: 'https://images.unsplash.com/photo-1615461066841-211d7a4166b5?auto=format&fit=crop&w=900&q=80',
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
  }
];

function Shop() {
  return (
    <div className="app-shell">
      <TopBar />

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
