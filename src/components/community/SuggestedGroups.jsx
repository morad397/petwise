import React, { useState, useEffect } from 'react';
import { Users, Plus, Check } from 'lucide-react';
import { getGroups, joinGroup, leaveGroup } from '../../services/communityService';

export default function SuggestedGroups({ currentUser }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    setGroups(getGroups());
  }, []);

  const handleToggleJoin = (groupId, isMember) => {
    if (isMember) {
      leaveGroup(groupId, currentUser.id);
    } else {
      joinGroup(groupId, currentUser.id);
    }
    // Refresh
    setGroups(getGroups());
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <h3 style={{ fontSize: '1.1rem', color: '#0f2138', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={20} color="#3b82f6" /> Groups
      </h3>

      {groups.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No groups available yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {groups.map(group => {
            const isMember = group.memberIds?.includes(currentUser.id);
            return (
              <div key={group.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {group.imageUrl ? (
                    <img src={group.imageUrl} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Users size={20} color="#94a3b8" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f2138', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{group.memberIds?.length || 0} members</span>
                </div>
                <button 
                  onClick={() => handleToggleJoin(group.id, isMember)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '99px',
                    border: `1px solid ${isMember ? '#e2e8f0' : 'transparent'}`,
                    background: isMember ? 'white' : '#f1f5f9',
                    color: isMember ? '#64748b' : '#0f2138',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isMember ? <><Check size={14} /> Joined</> : <><Plus size={14} /> Join</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
