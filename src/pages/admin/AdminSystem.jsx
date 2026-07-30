import { useState, useEffect } from 'react';
import { Server, Database, Brain, Bell, CreditCard, Activity, Save, TriangleAlert, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import { resetDevelopmentData } from '../../services/dataService';

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
  
  const [emergencySettings, setEmergencySettings] = useState({
    emergencyPhone: '',
    emergencyContactName: '',
    availabilityText: '',
    emergencyDisclaimer: ''
  });
  
  const [logFilter, setLogFilter] = useState('All');

  // Development Reset State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState('');

  const handleResetData = () => {
    if (resetConfirmation !== 'RESET PETWISE') return;
    try {
      const currentAdmin = JSON.parse(localStorage.getItem('petwise-user') || '{}');
      if (currentAdmin.role !== 'ADMIN' && currentAdmin.role !== 'admin') {
        alert('Unauthorized!');
        return;
      }
      resetDevelopmentData(currentAdmin.id);
      setShowResetModal(false);
      setResetConfirmation('');
      alert('Development data was reset successfully.');
      window.location.reload();
    } catch (err) {
      alert('Failed to reset data: ' + err.message);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('petwise-admin-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    
    try {
      const { getEmergencySettings } = require('../../services/emergencyService');
      setEmergencySettings(getEmergencySettings());
    } catch(e) {}
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('petwise-admin-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };
  
  const handleSaveEmergencySettings = (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to update the global emergency contact information?")) {
      try {
        const { updateEmergencySettings } = require('../../services/emergencyService');
        updateEmergencySettings(emergencySettings);
        alert('Emergency settings saved successfully!');
      } catch(e) {
        alert('Failed to save emergency settings.');
      }
    }
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
          
          {/* SECTION B2: EMERGENCY SETTINGS */}
          <section className="section-card" style={{ border: '2px solid #fee2e2' }}>
            <div className="card-header" style={{ borderBottom: '1px solid #fee2e2', paddingBottom: '12px' }}>
              <h3 style={{ color: '#b91c1c' }}>Emergency Settings</h3>
            </div>
            <form onSubmit={handleSaveEmergencySettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="input-group">
                <label>Emergency Contact Name</label>
                <input type="text" className="input-field" placeholder="e.g. National Pet Poison Helpline" value={emergencySettings.emergencyContactName} onChange={e => setEmergencySettings({...emergencySettings, emergencyContactName: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Emergency Phone</label>
                <input type="tel" className="input-field" placeholder="e.g. +1 555-0000" value={emergencySettings.emergencyPhone} onChange={e => setEmergencySettings({...emergencySettings, emergencyPhone: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Availability Text</label>
                <input type="text" className="input-field" placeholder="e.g. Available 24/7" value={emergencySettings.availabilityText} onChange={e => setEmergencySettings({...emergencySettings, availabilityText: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Emergency Disclaimer</label>
                <textarea className="input-field" style={{ minHeight: '80px', resize: 'vertical' }} value={emergencySettings.emergencyDisclaimer} onChange={e => setEmergencySettings({...emergencySettings, emergencyDisclaimer: e.target.value})} />
              </div>

              <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', background: '#ef4444', color: 'white', fontWeight: 600 }}>
                <Save size={18} /> Save Emergency Config
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

        {/* SECTION E: DEVELOPMENT TOOLS */}
        {(!import.meta.env.PROD) && (
          <section className="section-card" style={{ border: '1px solid #fecaca', background: '#fff' }}>
            <div className="card-header" style={{ borderBottom: '1px solid #fee2e2', paddingBottom: '16px', marginBottom: '16px' }}>
              <h3 style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TriangleAlert size={20} />
                Development Tools
              </h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              
              {/* Reset Tool */}
              <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <h4 style={{ color: '#991b1b', marginBottom: '8px', fontSize: '1.1rem' }}>Danger Zone</h4>
                <p style={{ color: '#7f1d1d', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Reset all development data (Users, Pets, Appointments, etc.) and start fresh. Your Admin account will be preserved.
                </p>
                <button 
                  onClick={() => setShowResetModal(true)} 
                  className="btn" 
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 16px', fontWeight: 600, width: '100%' }}
                >
                  Reset Development Data
                </button>
              </div>

              {/* Integration Test Checklist */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ color: '#0f2138', marginBottom: '12px', fontSize: '1.1rem' }}>PetWise Integration Test</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                  <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><input type="checkbox" /> Create a clinic.</label>
                  <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><input type="checkbox" /> Create a Staff account and assign it to the clinic.</label>
                  <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><input type="checkbox" /> Register a Pet Owner and add a pet.</label>
                  <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><input type="checkbox" /> Create an appointment for that clinic.</label>
                  <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><input type="checkbox" /> Log in as Staff, verify appointment visibility.</label>
                  <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><input type="checkbox" /> Confirm appointment, verify Owner sees status change.</label>
                </div>
              </div>

            </div>
          </section>
        )}

      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#b91c1c', fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TriangleAlert size={24} />
              Reset all development data?
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
              This will permanently remove all test users, pets, appointments, clinics, reminders, orders, medical records and activity data stored in this browser. This action cannot be undone.
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Type <strong>RESET PETWISE</strong> to confirm:
              </label>
              <input 
                type="text" 
                value={resetConfirmation}
                onChange={(e) => setResetConfirmation(e.target.value)}
                placeholder="RESET PETWISE"
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => { setShowResetModal(false); setResetConfirmation(''); }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleResetData}
                disabled={resetConfirmation !== 'RESET PETWISE'}
                className="btn"
                style={{ 
                  background: resetConfirmation === 'RESET PETWISE' ? '#ef4444' : '#fca5a5', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  fontWeight: 500,
                  cursor: resetConfirmation === 'RESET PETWISE' ? 'pointer' : 'not-allowed'
                }}
              >
                Reset Development Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
