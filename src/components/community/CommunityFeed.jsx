import React from 'react';
import PostCard from './PostCard';
import { getHiddenPosts } from '../../services/communityService';

export default function CommunityFeed({ posts, currentUser, users, onPostDeleted, activeFilter, clearFilter }) {
  const hiddenPosts = getHiddenPosts(currentUser.id);

  // Filter posts
  const visiblePosts = posts.filter(post => {
    if (hiddenPosts.includes(post.id)) return false;
    if (activeFilter) {
      return post.hashtags && post.hashtags.includes(activeFilter);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {activeFilter && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
          <span>Showing posts for <strong style={{ color: '#ff5a79' }}>{activeFilter}</strong></span>
          <button onClick={clearFilter} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 500 }}>
            Clear Filter
          </button>
        </div>
      )}

      {visiblePosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h3 style={{ color: '#0f2138', marginBottom: '8px' }}>No community posts yet.</h3>
          <p style={{ color: '#64748b' }}>Be the first to share something about your pet!</p>
        </div>
      ) : (
        visiblePosts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUser={currentUser} 
            users={users} 
            onPostDeleted={onPostDeleted}
            onPostHidden={onPostDeleted} // We can reuse the refresh trigger
          />
        ))
      )}
    </div>
  );
}
