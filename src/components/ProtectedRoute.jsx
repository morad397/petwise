import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  // Read current user from localStorage
  const user = JSON.parse(localStorage.getItem('petwise-user') || '{}');
  
  // Normalization of roles for checking
  let userRole = user.role ? user.role.toUpperCase() : 'PET_OWNER';
  if (userRole === 'OWNER') {
    userRole = 'PET_OWNER'; // Normalize from login form
  }

  if (!user.email) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  // Check if role is allowed
  const isAllowed = allowedRoles.map(r => r.toUpperCase()).includes(userRole);

  if (!isAllowed) {
    // If not allowed, redirect to a safe page based on role
    if (userRole === 'ADMIN') return <Navigate to="/admin" replace />;
    if (userRole === 'CLINIC_STAFF') return <Navigate to="/clinic/appointments" replace />;
    // If they are a pet owner and not allowed here, but they tried to access admin/clinic, send them to dashboard
    // Avoid redirecting to dashboard if we are already trying to access dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Allow through to children
  return <Outlet />;
}
