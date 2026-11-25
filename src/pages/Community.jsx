import { useState, useEffect } from 'react';
import { getPosts } from '../services/communityService';
import { getMyPets } from '../services/dataService';
import { getCurrentUser } from '../services/authService';

// Subcomponents
import CommunityStories from '../components/community/CommunityStories';
import CreatePost from '../components/community/CreatePost';
import CommunityFeed from '../components/community/CommunityFeed';
import TrendingTopics from '../components/community/TrendingTopics';
import SuggestedGroups from '../components/community/SuggestedGroups';
import SuggestedFriends from '../components/community/SuggestedFriends';

export default function Community() {
  const [currentUser] = useState(getCurrentUser);
  // stories still use the old browser-only user list
  const [users] = useState(() => JSON.parse(localStorage.getItem('petwise-users') || '[]'));
  const [userPets, setUserPets] = useState([]);

  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const refreshPosts = () =>
    getPosts({ saved: showSaved })
      .then((list) => {
        setPosts(list);
        setError('');
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    getMyPets()
      .then(setUserPets)
      .catch(() => setUserPets([]));
  }, []);

  useEffect(() => {
    refreshPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSaved]);

  const replacePost = (updated) => setPosts((list) => list.map((p) => (p.id === updated.id ? updated : p)));

  if (!currentUser?.id) {
    return (
      <>
          <p>Please log in to view the community.</p>
        </>
  );
}

  return (
    <>
      <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', color: '#0f2138', margin: 0 }}>PetWise Community</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={`btn ${showSaved ? 'btn-ghost' : 'btn-secondary'}`} onClick={() => setShowSaved(false)}>All posts</button>
              <button className={`btn ${showSaved ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setShowSaved(true)}>Saved</button>
            </div>
          </div>
          {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}
          
          <div className="community-layout">
            
            {/* LEFT COLUMN */}
            <div className="community-main">
              <CommunityStories currentUser={currentUser} users={users} />
              
              <CreatePost 
                currentUser={currentUser} 
                userPets={userPets} 
                onPostCreated={refreshPosts} 
              />
              
              <CommunityFeed
                posts={posts}
                currentUser={currentUser}
                onPostDeleted={refreshPosts}
                onPostUpdated={replacePost}
                activeFilter={activeFilter}
                clearFilter={() => setActiveFilter('')}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="community-sidebar">
              <TrendingTopics 
                posts={posts} 
                activeFilter={activeFilter} 
                onHashtagClick={setActiveFilter} 
              />
              <SuggestedGroups currentUser={currentUser} />
              <SuggestedFriends currentUser={currentUser} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
