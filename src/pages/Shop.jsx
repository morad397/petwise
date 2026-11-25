import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { getProducts, productImage, formatPrice } from '../services/shopService';

function Shop() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['All', ...new Set(products.map((p) => p.category))];
  const shown = category === 'All' ? products : products.filter((p) => p.category === category);

  const handleAdd = async (product) => {
    setAddingId(product.id);
    try {
      await addToCart(product);
    } catch (e) {
      alert(e.message); // e.g. "Only 2 left in stock"
    } finally {
      setAddingId(null);
    }
  };

  return (
    <>
      <section className="section-card hero-panel dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow">Pet Shop</p>
          <h1>Care essentials</h1>
          <p>Everything your pet needs for a healthier, happier routine, curated in one calm storefront.</p>
        </div>
        <Link to="/orders" className="btn btn-secondary">My Orders</Link>
      </section>

      {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '8px 0 16px' }}>
        {categories.map((c) => (
          <button key={c} className={`btn ${category === c ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {isLoading && <p>Loading products…</p>}

      <section className="shop-grid">
        {shown.map((product) => {
          const soldOut = product.stockQuantity === 0;
          return (
            <article key={product.id} className="shop-card">
              <img src={productImage(product.imageUrl)} alt={product.name} className="shop-card-image" />
              <div className="shop-card-body">
                <span className="eyebrow">{product.category}</span>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                {!soldOut && product.stockQuantity <= 5 && (
                  <p style={{ color: '#b45309', fontWeight: 600, margin: '4px 0 0' }}>Only {product.stockQuantity} left</p>
                )}
                <div className="shop-card-footer">
                  <strong>{formatPrice(product.price)}</strong>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleAdd(product)}
                    disabled={soldOut || addingId === product.id}
                    style={{ opacity: soldOut ? 0.5 : 1, cursor: soldOut ? 'not-allowed' : 'pointer' }}
                  >
                    {soldOut ? 'Out of Stock' : addingId === product.id ? 'Adding…' : 'Add to cart'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

export default Shop;
