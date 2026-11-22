import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { fetchMe, getToken, logout, homePathForRole } from '../services/authService';

export default function ProtectedRoute({ allowedRoles }) {
  const token = getToken();
  // 'loading' | 'ok' | 'unauthenticated'
  const [state, setState] = useState(token ? 'loading' : 'unauthenticated');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    // Don't trust the role saved in the browser: ask the server who this token belongs to.
    // If an admin changed the role or suspended the account, the server's answer wins.
    fetchMe()
      .then((freshUser) => {
        if (cancelled) return;
        setUser(freshUser);
        setState('ok');
      })
      .catch(() => {
        if (cancelled) return;
        logout();
        setState('unauthenticated');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (state === 'loading') {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading…</div>
    );
  }

  // --- Authorization ---
  const isAllowed = allowedRoles.map((r) => r.toUpperCase()).includes(user.role);
  if (!isAllowed) {
    // Send the user to the area that matches their real role
    return <Navigate to={homePathForRole(user)} replace />;
  }

  return <Outlet />;
}
