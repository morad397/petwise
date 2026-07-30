import { Outlet } from 'react-router-dom';
import TopBar from '../TopBar';

export default function ClinicLayout() {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="page-inner dashboard-layout">
        <Outlet />
      </main>
    </div>
  );
}
