import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { getSuggestedFriends, followUser, unfollowUser } from '../../services/communityService';
import UserAvatar from '../UserAvatar';

export default function SuggestedFriends({ currentUser }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Only Pet Owners should typically follow other Pet Owners
    if (currentUser?.role === 'PET_OWNER') {
      setSuggestions(getSuggestedFriends(currentUser.id));
    }
  }, [currentUser]);

  const handleFollow = (userId) => {
    followUser(currentUser.id, userId);
    // Refresh list (they will disappear from suggestions since they are now followed)
    setSuggestions(getSuggestedFriends(currentUser.id));
  };

  if (currentUser?.role !== 'PET_OWNER') {
    return null; // Don't show friend suggestions to Admin/Staff
  }

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <h3 style={{ fontSize: '1.1rem', color: '#0f2138', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <UserPlus size={20} color="#10b981" /> Suggested Friends
      </h3>

      {suggestions.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No friend suggestions yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {suggestions.map(user => (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UserAvatar user={user} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f2138', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || user.fullName}</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Pet Owner</span>
              </div>
              <button 
                onClick={() => handleFollow(user.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '99px',
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#0f2138',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
