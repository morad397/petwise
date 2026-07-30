import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import shopShampoo from '../assets/shop-shampoo.png';
import shopToy from '../assets/shop-toy.png';
import shopFood from '../assets/shop-food.png';
import shopClothes from '../assets/shop-clothes.png';
import shopBed from '../assets/shop-bed.png';
import TopBar from '../components/TopBar';

import { useCart } from '../contexts/CartContext';

const DEFAULT_INVENTORY = [
  { id: '1', name: 'Premium Pet Shampoo', price: 18, category: 'Grooming', detail: 'Gentle, soothing wash for a shiny, healthy coat.', image: shopShampoo, stock: 15 },
  { id: '2', name: 'Interactive Rubber Ball', price: 12, category: 'Toys', detail: 'Durable, bouncy toy perfect for fetch and playtime.', image: shopToy, stock: 45 },
  { id: '3', name: 'Healthy Dry Pet Food', price: 45, category: 'Food', detail: 'Nutrient-rich, balanced meal for optimal health.', image: shopFood, stock: 5 },
  { id: '4', name: 'Cozy Knitted Sweater', price: 24, category: 'Accessories', detail: 'Keep your pet warm and stylish in cold weather.', image: shopClothes, stock: 12 },
  { id: '5', name: 'Luxurious Plush Pet Bed', price: 65, category: 'Beds', detail: 'Ultra-soft, comfortable bed for perfect sleep.', image: shopBed, stock: 0 },
  { id: '6', name: 'Cat Litter Tray', price: 22, category: 'Accessories', detail: 'Easy-clean enclosure for daily care.', image: 'https://images.unsplash.com/photo-1615461066841-211d7a4166b5?auto=format&fit=crop&w=900&q=80', stock: 8 },
  { id: '7', name: 'Dog Leash & Collar', price: 21, category: 'Accessories', detail: 'Comfortable everyday walking set.', image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=900&q=80', stock: 24 },
  { id: '8', name: 'Dog Bath Set', price: 19, category: 'Grooming', detail: 'Cleaning essentials for grooming and hygiene.', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=80', stock: 0 }
];

function Shop() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('petwise-inventory') || '[]');
    if (saved.length === 0) {
      localStorage.setItem('petwise-inventory', JSON.stringify(DEFAULT_INVENTORY));
      setProducts(DEFAULT_INVENTORY);
    } else {
      setProducts(saved);
    }
  }, []);

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
            <article key={product.id} className="shop-card">
              <img src={product.image} alt={product.name} className="shop-card-image" />
              <div className="shop-card-body">
                <span className="eyebrow">{product.category || product.type}</span>
                <h3>{product.name}</h3>
                <p>{product.detail}</p>
                <div className="shop-card-footer">
                  <strong>${Number(product.price).toFixed(2)}</strong>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => addToCart({...product, price: `$${Number(product.price).toFixed(2)}`})}
                    disabled={product.stock === 0}
                    style={{ opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to cart'}
                  </button>
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
