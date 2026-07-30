import React, { useState, useEffect } from 'react';
import { getPosts } from '../services/communityService';
import { getPetsByOwnerId } from '../services/dataService';

// Subcomponents
import CommunityStories from '../components/community/CommunityStories';
import CreatePost from '../components/community/CreatePost';
import CommunityFeed from '../components/community/CommunityFeed';
import TrendingTopics from '../components/community/TrendingTopics';
import SuggestedGroups from '../components/community/SuggestedGroups';
import SuggestedFriends from '../components/community/SuggestedFriends';

export default function Community() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [userPets, setUserPets] = useState([]);
  
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    // Load users and current user
    const savedUser = JSON.parse(localStorage.getItem('petwise-user') || '{}');
    const allUsers = JSON.parse(localStorage.getItem('petwise-users') || '[]');
    setCurrentUser(savedUser);
    setUsers(allUsers);

    // Load pets for this user
    if (savedUser.id) {
      setUserPets(getPetsByOwnerId(savedUser.id));
    }

    refreshPosts();
  }, []);

  const refreshPosts = () => {
    setPosts(getPosts());
  };

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
          <h1 style={{ fontSize: '1.8rem', color: '#0f2138', marginBottom: '24px' }}>PetWise Community</h1>
          
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
                users={users} 
                onPostDeleted={refreshPosts}
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
