import React from 'react';

export default function UserAvatar({ user, size = 40 }) {
  if (!user) return null;

  const initial = (user.name || user.fullName || '?').charAt(0).toUpperCase();

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#cbd5e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#334155',
        fontWeight: 'bold',
        fontSize: `${size * 0.4}px`,
        overflow: 'hidden',
        flexShrink: 0
      }}
    >
      {user.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.name || user.fullName} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initial
      )}
    </div>
  );
}
