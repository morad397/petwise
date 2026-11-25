import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, PawPrint, Calendar, ShoppingBag, DollarSign, PackageX, Flag, UserPlus } from 'lucide-react';
import { getAdminStats } from '../services/adminService';
import { formatPrice } from '../services/shopService';

const ROLE_LABELS = { PET_OWNER: 'Owner', CLINIC_STAFF: 'Staff', ADMIN: 'Admin' };

const formatJoined = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) return `Today, ${time}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  const cards = stats
    ? [
        { label: 'Total Users', value: stats.usersTotal, note: `${stats.usersByRole.PET_OWNER} owners • ${stats.usersByRole.CLINIC_STAFF} staff`, icon: Users },
        { label: 'New Users (7 days)', value: stats.newUsers7Days, note: 'signed up this week', icon: UserPlus },
        { label: 'Registered Pets', value: stats.petsTotal, note: 'in the system', icon: PawPrint },
        { label: 'Appointments Today', value: stats.appointmentsToday, note: `${stats.appointmentsPending} waiting for a clinic`, icon: Calendar },
        { label: 'Shop Orders', value: stats.ordersTotal, note: `${stats.ordersProcessing} to ship`, icon: ShoppingBag, to: '/admin/orders' },
        { label: 'Revenue (paid)', value: formatPrice(stats.revenuePaid), note: 'test payments + delivered', icon: DollarSign },
        { label: 'Stock Alerts', value: stats.lowStockProducts + stats.outOfStockProducts, note: `${stats.outOfStockProducts} out of stock`, icon: PackageX, to: '/admin/inventory' },
        { label: 'Reported Posts', value: stats.openReports, note: 'waiting for review', icon: Flag, to: '/admin/reports' },
      ]
    : [];

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Admin Overview</p>
          <h1>System Dashboard</h1>
        </div>
      </header>

      {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}
      {!stats && !error && <p>Loading…</p>}

      <section className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="stat-card"
              onClick={card.to ? () => navigate(card.to) : undefined}
              style={card.to ? { cursor: 'pointer' } : undefined}
            >
              <div className="stat-card-header">
                <div className="stat-icon-wrapper">
                  <Icon size={24} />
                </div>
              </div>
              <h3>{card.value}</h3>
              <p>{card.label}</p>
              <small style={{ color: '#64748b' }}>{card.note}</small>
            </div>
          );
        })}
      </section>

      {stats && (
        <section className="admin-content-grid">
          <div className="section-card admin-table-card">
            <div className="card-header">
              <h3>Recent Users</h3>
              <button className="btn btn-ghost" onClick={() => navigate('/admin/users')}>View all</button>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Date Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="table-user">
                          <strong>{user.fullName}</strong>
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td><span className="role-badge">{ROLE_LABELS[user.role] || user.role}</span></td>
                      <td>{formatJoined(user.createdAt)}</td>
                      <td>
                        <span className={`status-dot ${user.status === 'ACTIVE' ? 'active' : 'offline'}`}></span>
                        {user.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-header" style={{ marginTop: '24px' }}>
              <h3>Recent Orders</h3>
              <button className="btn btn-ghost" onClick={() => navigate('/admin/orders')}>View all</button>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p style={{ color: '#64748b' }}>No orders yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}<br /><small style={{ color: '#64748b' }}>{formatJoined(order.orderDate)}</small></td>
                        <td>{order.customerName}</td>
                        <td>{formatPrice(order.totalAmount)}</td>
                        <td><span className={`status-pill status-${order.status === 'PROCESSING' ? 'pending' : order.status === 'SHIPPED' ? 'in_progress' : order.status === 'DELIVERED' ? 'completed' : 'cancelled'}`}>{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="section-card admin-side-card">
            <h3>Quick Actions</h3>
            <div className="action-list">
              <button className="action-list-item" onClick={() => navigate('/admin/users')}>
                <Users size={18} />
                <span>Manage Users</span>
              </button>
              <button className="action-list-item" onClick={() => navigate('/admin/inventory')}>
                <ShoppingBag size={18} />
                <span>Update Inventory</span>
              </button>
              <button className="action-list-item" onClick={() => navigate('/admin/orders')}>
                <Calendar size={18} />
                <span>Ship Orders</span>
              </button>
              <button className="action-list-item" onClick={() => navigate('/admin/reports')}>
                <Flag size={18} />
                <span>Review Reports</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default AdminDashboard;
