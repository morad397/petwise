import { useEffect, useState } from 'react';
import { getOrders, setOrderStatus, formatPrice } from '../../services/shopService';

const PILL = { PROCESSING: 'status-pending', SHIPPED: 'status-in_progress', DELIVERED: 'status-completed', CANCELLED: 'status-cancelled' };
const small = { padding: '6px 12px', fontSize: '0.8rem' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Admins get every order from the same endpoint
  const load = () =>
    getOrders()
      .then((list) => {
        setOrders(list);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    load();
  }, []);

  const change = async (order, status) => {
    if (status === 'CANCELLED' && !window.confirm(`Cancel order #${order.id}? Stock goes back and a paid order is refunded.`)) return;
    try {
      await setOrderStatus(order.id, status); // the customer gets a notification
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const shown = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);
  const count = (status) => orders.filter((o) => o.status === status).length;

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Shop</p>
          <h1>Orders</h1>
        </div>
      </header>

      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="stat-card"><h3>{orders.length}</h3><p>All Orders</p></div>
        <div className="stat-card"><h3>{count('PROCESSING')}</h3><p>To Ship</p></div>
        <div className="stat-card"><h3>{count('SHIPPED')}</h3><p>Shipped</p></div>
        <div className="stat-card"><h3>{count('DELIVERED')}</h3><p>Delivered</p></div>
      </section>

      {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}

      <section className="section-card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <h3>Orders</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <option value="ALL">All statuses</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <p>Loading…</p>
        ) : shown.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>No orders.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer / Address</th>
                  <th>Items</th>
                  <th>Total / Payment</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong><br />
                      <small style={{ color: '#64748b' }}>{new Date(order.orderDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</small>
                    </td>
                    <td>
                      {order.customerName}<br />
                      <small style={{ color: '#64748b' }}>{order.shippingAddress.street}, {order.shippingAddress.city}</small>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</td>
                    <td>
                      {formatPrice(order.totalAmount)}<br />
                      <small style={{ color: '#64748b' }}>{order.paymentMethod === 'TEST_PAYMENT' ? 'Test payment' : 'Cash on delivery'} • {order.paymentStatus}</small>
                    </td>
                    <td><span className={`status-pill ${PILL[order.status]}`}>{order.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {order.status === 'PROCESSING' && (
                          <>
                            <button className="btn btn-primary" style={small} onClick={() => change(order, 'SHIPPED')}>Mark Shipped</button>
                            <button className="btn btn-ghost" style={{ ...small, color: '#d43a57' }} onClick={() => change(order, 'CANCELLED')}>Cancel</button>
                          </>
                        )}
                        {order.status === 'SHIPPED' && (
                          <button className="btn btn-primary" style={small} onClick={() => change(order, 'DELIVERED')}>Mark Delivered</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
