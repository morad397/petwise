import TopBar from '../components/TopBar';
import { useLocation } from 'react-router-dom';
import { Users, PawPrint, Calendar, ShoppingBag, TrendingUp, MoreVertical } from 'lucide-react';

function AdminDashboard() {
  const location = useLocation();
  const path = location.pathname;

  const stats = [
    { label: 'Total Users', value: '12,450', trend: '+14%', icon: Users },
    { label: 'Registered Pets', value: '18,290', trend: '+22%', icon: PawPrint },
    { label: 'Appointments Today', value: '145', trend: '+5%', icon: Calendar },
    { label: 'Shop Orders', value: '89', trend: '-2%', icon: ShoppingBag },
  ];

  const recentUsers = [
    { name: 'Hanan Taha', email: 'Suga.jemin@gmail.com', role: 'Owner', date: 'Today, 10:24 AM', status: 'Active' },
    { name: 'John Doe', email: 'john@example.com', role: 'Owner', date: 'Today, 09:12 AM', status: 'Active' },
    { name: 'Sarah Smith', email: 'sarah.s@domain.com', role: 'Owner', date: 'Yesterday', status: 'Active' },
    { name: 'Mike Ross', email: 'mross@law.com', role: 'Admin', date: 'Yesterday', status: 'Offline' },
    { name: 'Emily Clark', email: 'emily.c@pets.org', role: 'Owner', date: 'Oct 24, 2026', status: 'Active' },
  ];

  if (path === '/admin/users') {
    return (
      <div className="app-shell">
        <TopBar />
        <main className="page-inner dashboard-layout">
          <section className="section-card hero-panel dashboard-hero">
            <div>
              <p className="eyebrow">User Management</p>
              <h2>Manage Users</h2>
              <p>This module is currently under construction. Check back soon!</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (path === '/admin/inventory') {
    return (
      <div className="app-shell">
        <TopBar />
        <main className="page-inner dashboard-layout">
          <section className="section-card hero-panel dashboard-hero">
            <div>
              <p className="eyebrow">Inventory Management</p>
              <h2>Shop Inventory</h2>
              <p>This module is currently under construction. Check back soon!</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (path === '/admin/system') {
    return (
      <div className="app-shell">
        <TopBar />
        <main className="page-inner dashboard-layout">
          <section className="section-card hero-panel dashboard-hero">
            <div>
              <p className="eyebrow">System Settings</p>
              <h2>System Configuration</h2>
              <p>This module is currently under construction. Check back soon!</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopBar />

      <main className="page-inner dashboard-layout">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Admin Overview</p>
            <h1>System Dashboard</h1>
          </div>
          <button className="btn btn-primary">Download Report</button>
        </header>

        <section className="stats-grid">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            const isPositive = stat.trend.startsWith('+');
            return (
              <div key={i} className="stat-card">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper">
                    <Icon size={24} />
                  </div>
                  <span className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
                    <TrendingUp size={16} /> {stat.trend}
                  </span>
                </div>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            );
          })}
        </section>

        <section className="admin-content-grid">
          <div className="section-card admin-table-card">
            <div className="card-header">
              <h3>Recent Users</h3>
              <button className="icon-btn"><MoreVertical size={18}/></button>
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
                  {recentUsers.map((user, i) => (
                    <tr key={i}>
                      <td>
                        <div className="table-user">
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td><span className="role-badge">{user.role}</span></td>
                      <td>{user.date}</td>
                      <td>
                        <span className={`status-dot ${user.status.toLowerCase()}`}></span>
                        {user.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section-card admin-side-card">
            <h3>Quick Actions</h3>
            <div className="action-list">
              <button className="action-list-item">
                <Users size={18} />
                <span>Manage Users</span>
              </button>
              <button className="action-list-item">
                <ShoppingBag size={18} />
                <span>Update Inventory</span>
              </button>
              <button className="action-list-item">
                <Calendar size={18} />
                <span>Review Appointments</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
