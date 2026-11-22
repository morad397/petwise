import { Outlet, Navigate } from 'react-router-dom';
import TopBar from '../TopBar';

export default function StaffLayout() {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="page-inner dashboard-layout">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
