import { Navigate, Outlet } from 'react-router-dom';
import TopBar from '../TopBar';

export default function AdminLayout() {
  const user = JSON.parse(localStorage.getItem('petwise-user') || '{}');
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-shell">
      <TopBar />
      <main className="page-inner dashboard-layout">
        <Outlet />
      </main>
    </div>
  );
}
