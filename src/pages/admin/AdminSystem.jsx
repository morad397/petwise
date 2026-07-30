import { useState, useEffect } from 'react';
import { Server, Database, Brain, Bell, CreditCard, Activity, Save } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';

const MOCK_ACTIVITY_LOG = [
  { id: 1, date: 'Today, 10:45 AM', user: 'Hanan Taha', action: 'User Role Updated', target: 'John Doe (Pet Owner -> Staff)', result: 'Success' },
  { id: 2, date: 'Today, 09:12 AM', user: 'System', action: 'Automated Backup', target: 'Main Database', result: 'Success' },
  { id: 3, date: 'Yesterday, 14:30 PM', user: 'Mike Ross', action: 'Product Stock Changed', target: 'Premium Pet Shampoo (+15)', result: 'Success' },
  { id: 4, date: 'Yesterday, 11:20 AM', user: 'Hanan Taha', action: 'System Setting Updated', target: 'Maintenance Mode (Enabled)', result: 'Success' },
  { id: 5, date: 'Oct 28, 2026', user: 'System', action: 'Payment Gateway Sync', target: 'Stripe API', result: 'Failed' },
];

export default function AdminSystem() {
  const [settings, setSettings] = useState({
    appName: 'PetWise',
    supportEmail: 'support@petwise.com',
    language: 'English',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    appointmentReminders: true
  });
  
  const [logFilter, setLogFilter] = useState('All');

  useEffect(() => {
    const saved = localStorage.getItem('petwise-admin-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('petwise-admin-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const services = [
    { name: 'Frontend', icon: Activity, status: 'Operational' },
    { name: 'Backend API', icon: Server, status: 'Not Connected' },
    { name: 'Database', icon: Database, status: 'Not Connected' },
    { name: 'AI Vet Service', icon: Brain, status: 'Planned' },
    { name: 'Notification Service', icon: Bell, status: 'Planned' },
    { name: 'Payment Service', icon: CreditCard, status: 'Not Connected' },
  ];

  const permissions = [
    { feature: 'View Dashboard', owner: true, staff: true, admin: true },
    { feature: 'Manage Own Pets', owner: true, staff: true, admin: true },
    { feature: 'Shop Purchases', owner: true, staff: true, admin: true },
    { feature: 'Book Appointments', owner: true, staff: true, admin: true },
    { feature: 'View All Appointments', owner: false, staff: true, admin: true },
    { feature: 'Manage Inventory', owner: false, staff: true, admin: true },
    { feature: 'Manage Users', owner: false, staff: false, admin: true },
    { feature: 'System Settings', owner: false, staff: false, admin: true },
  ];

  const filteredLogs = logFilter === 'All' ? MOCK_ACTIVITY_LOG : MOCK_ACTIVITY_LOG.filter(log => log.result === logFilter);

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">System Management</p>
          <h1>Monitor system services and settings.</h1>
        </div>
      </header>

      <div className="admin-content-grid" style={{ gridTemplateColumns: '1fr' }}>
        
        {/* SECTION A: SYSTEM STATUS */}
        <section className="section-card">
          <div className="card-header">
            <h3>System Status</h3>
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: '16px' }}>
            {services.map(svc => (
              <div key={svc.name} className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svc.icon size={20} color="#666" />
                  <strong style={{ fontSize: '14px' }}>{svc.name}</strong>
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <StatusBadge status={svc.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="admin-content-grid" style={{ marginTop: '0', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
          {/* SECTION B: APPLICATION SETTINGS */}
          <section className="section-card">
            <div className="card-header">
              <h3>Application Settings</h3>
            </div>
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="input-group">
                <label>Application Name</label>
                <input type="text" className="input-field" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Support Email</label>
                <input type="email" className="input-field" value={settings.supportEmail} onChange={e => setSettings({...settings, supportEmail: e.target.value})} />
              </div>
              
              <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})} />
                  Maintenance Mode
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={settings.registrationEnabled} onChange={e => setSettings({...settings, registrationEnabled: e.target.checked})} />
                  User Registration Enabled
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={settings.emailNotifications} onChange={e => setSettings({...settings, emailNotifications: e.target.checked})} />
                  Email Notifications
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={settings.appointmentReminders} onChange={e => setSettings({...settings, appointmentReminders: e.target.checked})} />
                  Appointment Reminders
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                <Save size={18} /> Save Settings
              </button>
            </form>
          </section>

          {/* SECTION C: ROLE & PERMISSION MANAGEMENT */}
          <section className="section-card">
            <div className="card-header">
              <h3>Role & Permissions Matrix</h3>
            </div>
            <div className="table-responsive" style={{ marginTop: '16px' }}>
              <table className="admin-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th style={{ textAlign: 'center' }}>Pet Owner</th>
                    <th style={{ textAlign: 'center' }}>Staff</th>
                    <th style={{ textAlign: 'center' }}>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((perm, i) => (
                    <tr key={i}>
                      <td>{perm.feature}</td>
                      <td style={{ textAlign: 'center', color: perm.owner ? '#137333' : '#c5221f' }}>{perm.owner ? '✓' : '✗'}</td>
                      <td style={{ textAlign: 'center', color: perm.staff ? '#137333' : '#c5221f' }}>{perm.staff ? '✓' : '✗'}</td>
                      <td style={{ textAlign: 'center', color: perm.admin ? '#137333' : '#c5221f' }}>{perm.admin ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* SECTION D: ACTIVITY LOG */}
        <section className="section-card">
          <div className="card-header">
            <h3>Activity Log</h3>
            <select value={logFilter} onChange={(e) => setLogFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}>
              <option value="All">All Results</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div className="table-responsive" style={{ marginTop: '16px' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td><small>{log.date}</small></td>
                    <td><strong>{log.user}</strong></td>
                    <td>{log.action}</td>
                    <td>{log.target}</td>
                    <td>
                      <StatusBadge status={log.result} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </>
  );
}
