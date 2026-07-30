import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

export default function TrendingTopics({ posts, onHashtagClick, activeFilter }) {
  
  // Calculate top hashtags from current posts
  const topHashtags = useMemo(() => {
    const counts = {};
    posts.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach(tag => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // sort by count descending
      .slice(0, 5) // take top 5
      .map(entry => entry[0]);
  }, [posts]);

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <h3 style={{ fontSize: '1.1rem', color: '#0f2138', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={20} color="#ff5a79" /> Trending Topics
      </h3>

      {topHashtags.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No trending topics yet.</p>
      ) : (
        <div>
          {topHashtags.map(tag => (
            <button
              key={tag}
              className={`trending-pill ${activeFilter === tag ? 'active' : ''}`}
              onClick={() => onHashtagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
