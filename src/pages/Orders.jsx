import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getOrders, cancelOrder, productImage, formatPrice } from '../services/shopService';

const STATUS_LABELS = {
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};
const PILL_CLASS = {
  PROCESSING: 'status-pending',
  SHIPPED: 'status-in_progress',
  DELIVERED: 'status-completed',
  CANCELLED: 'status-cancelled',
};
const PAYMENT_LABELS = { PAID: 'Paid', PENDING: 'Pay on delivery', REFUNDED: 'Refunded' };

function Orders() {
  const location = useLocation();
  const placedOrderId = location.state?.placedOrderId;
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    getOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (order) => {
    if (!window.confirm(`Cancel order #${order.id}? The items go back to stock.`)) return;
    try {
      await cancelOrder(order.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <section className="section-card hero-panel dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow">Shop</p>
          <h1>My Orders</h1>
          <p>Track your orders. You can cancel an order until it is shipped.</p>
        </div>
        <Link to="/shop" className="btn btn-secondary">Back to Shop</Link>
      </section>

      {placedOrderId && (
        <p style={{ padding: '12px 16px', background: '#e7f8ef', color: '#15803d', borderRadius: '12px', fontWeight: 600 }}>
          ✓ Order #{placedOrderId} placed. Thank you!
        </p>
      )}
      {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}
      {isLoading && <p>Loading orders…</p>}

      {!isLoading && orders.length === 0 && (
        <section className="section-card empty-state" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p>You have no orders yet.</p>
          <Link to="/shop" className="btn btn-primary">Start shopping</Link>
        </section>
      )}

      {orders.map((order) => (
        <section key={order.id} className="section-card" style={placedOrderId === order.id ? { border: '2px solid #22c55e' } : undefined}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>Order #{order.id}</h2>
              <small style={{ color: '#64748b' }}>
                {new Date(order.orderDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                {' • '}{PAYMENT_LABELS[order.paymentStatus]}
                {order.paymentReference ? ` (${order.paymentReference})` : ''}
              </small>
            </div>
            <span className={`status-pill ${PILL_CLASS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
          </div>

          <div style={{ marginTop: '12px' }}>
            {order.items.map((item) => (
              <div key={item.productId} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0' }}>
                <img src={productImage(item.imageUrl)} alt={item.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                <span style={{ flex: 1 }}>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid #eef1f6', paddingTop: '12px', marginTop: '8px' }}>
            <small style={{ color: '#64748b' }}>
              Ship to {order.shippingAddress.fullName}, {order.shippingAddress.street}, {order.shippingAddress.city}
            </small>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <strong style={{ fontSize: '1.1rem' }}>{formatPrice(order.totalAmount)}</strong>
              {order.status === 'PROCESSING' && (
                <button className="btn btn-ghost" style={{ color: '#d43a57' }} onClick={() => handleCancel(order)}>Cancel order</button>
              )}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

export default Orders;
