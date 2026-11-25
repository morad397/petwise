import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { placeOrder, productImage, formatPrice } from '../services/shopService';
import { getCurrentUser } from '../services/authService';

function Checkout() {
  const navigate = useNavigate();
  const { cart, refreshCart, changeQuantity, removeFromCart, resetCart } = useCart();
  const [address, setAddress] = useState(() => ({
    fullName: getCurrentUser().fullName || '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Israel',
    phone: '',
  }));
  const [paymentMethod, setPaymentMethod] = useState('TEST_PAYMENT');
  const [error, setError] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    refreshCart(); // latest prices and stock
  }, [refreshCart]);

  const run = async (action) => {
    try {
      setError('');
      await action();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsPlacing(true);
    setError('');
    try {
      const order = await placeOrder(
        {
          fullName: address.fullName.trim(),
          street: address.street.trim(),
          city: address.city.trim(),
          postalCode: address.postalCode.trim() || null,
          country: address.country.trim() || 'Israel',
          phone: address.phone.trim() || null,
        },
        paymentMethod
      );
      resetCart();
      navigate('/orders', { state: { placedOrderId: order.id } });
    } catch (e) {
      setError(e.message); // e.g. not enough stock
      refreshCart();
    } finally {
      setIsPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <section className="section-card empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Your cart is empty</h2>
        <p style={{ color: '#64748b' }}>Add some products from the shop first.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/shop" className="btn btn-primary">Go to Shop</Link>
          <Link to="/orders" className="btn btn-secondary">My Orders</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section-card hero-panel dashboard-hero">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Review your order</h1>
          <p>Prices and stock are checked again when you place the order.</p>
        </div>
      </section>

      {error && <p style={{ color: '#d93025', fontWeight: 'bold', padding: '12px', background: '#fce8e6', borderRadius: '8px' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>
        <section className="section-card">
          <h2>Items</h2>
          {cart.items.map((item) => (
            <div key={item.productId} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eef1f6' }}>
              <img src={productImage(item.imageUrl)} alt={item.name} style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{item.name}</strong>
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{formatPrice(item.unitPrice)} each</div>
                {item.quantity > item.inStock && (
                  <div style={{ color: '#d93025', fontSize: '0.85rem' }}>Only {item.inStock} left in stock</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => run(() => changeQuantity(item.productId, item.quantity - 1))}>−</button>
                <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button className="btn btn-ghost" style={{ padding: '4px 10px' }} disabled={item.quantity >= item.inStock}
                  onClick={() => run(() => changeQuantity(item.productId, item.quantity + 1))}>+</button>
              </div>
              <strong style={{ minWidth: '70px', textAlign: 'right' }}>{formatPrice(item.subtotal)}</strong>
              <button className="btn btn-ghost" style={{ color: '#d43a57', padding: '4px 8px' }} onClick={() => run(() => removeFromCart(item.productId))}>✕</button>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '1.2rem' }}>
            <span>Total ({cart.itemCount} items)</span>
            <strong>{formatPrice(cart.total)}</strong>
          </div>
        </section>

        <section className="section-card">
          <h2>Shipping &amp; payment</h2>
          <form className="form-card" onSubmit={handleSubmit}>
            <label className="form-group">
              <span>Full name *</span>
              <input name="fullName" value={address.fullName} onChange={handleChange} required />
            </label>
            <label className="form-group">
              <span>Street and number *</span>
              <input name="street" value={address.street} onChange={handleChange} required />
            </label>
            <label className="form-group">
              <span>City *</span>
              <input name="city" value={address.city} onChange={handleChange} required />
            </label>
            <label className="form-group">
              <span>Postal code</span>
              <input name="postalCode" value={address.postalCode} onChange={handleChange} />
            </label>
            <label className="form-group">
              <span>Phone</span>
              <input name="phone" value={address.phone} onChange={handleChange} />
            </label>

            <fieldset style={{ border: '1px solid #eef1f6', borderRadius: '12px', padding: '12px 16px' }}>
              <legend style={{ fontWeight: 600, padding: '0 6px' }}>Payment</legend>
              <label className="checkbox-row">
                <input type="radio" name="payment" value="TEST_PAYMENT" checked={paymentMethod === 'TEST_PAYMENT'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Test payment (demo: no real charge, no card needed)
              </label>
              <label className="checkbox-row">
                <input type="radio" name="payment" value="CASH_ON_DELIVERY" checked={paymentMethod === 'CASH_ON_DELIVERY'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Cash on delivery
              </label>
            </fieldset>

            <button type="submit" className="btn btn-primary btn-full" disabled={isPlacing}>
              {isPlacing ? 'Placing order…' : `Place order • ${formatPrice(cart.total)}`}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

export default Checkout;
