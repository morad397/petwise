import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  // Read current session
  let sessionUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
  
  if (!sessionUser.id && !sessionUser.email) {
    return <Navigate to="/login" replace />;
  }

  // --- Session Refresh Logic ---
  // Do not trust the session role blindly. Cross-reference canonical users DB.
  const usersStr = localStorage.getItem('petwise-users');
  const allUsers = usersStr ? JSON.parse(usersStr) : [];
  
  // Try to find the canonical user by ID (or email as fallback for legacy)
  const canonicalUser = allUsers.find(u => u.id === sessionUser.id) || 
                        allUsers.find(u => u.email === sessionUser.email);
                        
  if (!canonicalUser) {
    // User was deleted by admin
    localStorage.removeItem('petwise-user');
    return <Navigate to="/login" replace />;
  }
  
  // If role was changed by Admin, the session must be invalidated or updated.
  // The requirement says: "If the role was changed by Admin, use the updated role."
  // Wait, it also says "Invalidate the old session. Require the user to log in again."
  // I will enforce re-login if the role changed since they last logged in.
  // But wait, if they log in, the session gets the new role. If they are ALREADY logged in and Admin changes it,
  // their session role will differ from canonical role.
  if (sessionUser.role !== canonicalUser.role) {
    localStorage.removeItem('petwise-user');
    return <Navigate to="/login" replace />;
  }

  // Update session object with fresh data (e.g. name changes, clinicId assignments)
  sessionUser = canonicalUser;
  localStorage.setItem('petwise-user', JSON.stringify(sessionUser));

  // --- Authorization ---
  const userRole = sessionUser.role ? sessionUser.role.toUpperCase() : 'PET_OWNER';
  const isAllowed = allowedRoles.map(r => r.toUpperCase()).includes(userRole);

  if (!isAllowed) {
    // Redirect based on actual role if they try to access restricted area
    if (userRole === 'ADMIN') return <Navigate to="/admin" replace />;
    if (userRole === 'CLINIC_STAFF') return <Navigate to="/staff" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Allow through to children
  return <Outlet />;
}
