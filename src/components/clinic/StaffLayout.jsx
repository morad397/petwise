import { Outlet, Navigate } from 'react-router-dom';
import TopBar from '../TopBar';

export default function StaffLayout() {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="page-inner dashboard-layout">
        <header className="admin-topbar" style={{ marginBottom: '24px' }}>
          <div>
            <span className="status-pill status-active" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>Frontend Demo — Backend connection planned</span>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
