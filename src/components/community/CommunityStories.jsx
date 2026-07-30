import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { getStories, createStory, markStoryViewed } from '../../services/communityService';
import UserAvatar from '../UserAvatar';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function CommunityStories({ currentUser, users }) {
  const [stories, setStories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storyFile, setStoryFile] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);

  useEffect(() => {
    setStories(getStories());
  }, []);

  const handleAddStory = async (e) => {
    e.preventDefault();
    if (!storyFile) return;
    
    try {
      const mediaUrl = await fileToDataUrl(storyFile);
      createStory({
        userId: currentUser.id,
        mediaUrl,
        mediaType: storyFile.type.startsWith('video') ? 'video' : 'image'
      });
      setStories(getStories());
      setIsModalOpen(false);
      setStoryFile(null);
    } catch (err) {
      alert("Failed to upload story.");
    }
  };

  const handleViewStory = (index) => {
    const story = stories[index];
    setActiveStoryIndex(index);
    if (!story.viewedBy.includes(currentUser.id)) {
      markStoryViewed(story.id, currentUser.id);
      setStories(getStories());
    }
  };

  return (
    <div className="stories-container">
      {/* Add Story Button */}
      <div className="story-item" onClick={() => setIsModalOpen(true)}>
        <div className="story-avatar-wrapper" style={{ background: 'transparent' }}>
          <div className="add-icon">
            <Plus size={24} />
          </div>
        </div>
        <span>Your Story</span>
      </div>

      {/* Stories List */}
      {stories.map((story, index) => {
        const isViewed = story.viewedBy.includes(currentUser.id);
        const author = users.find(u => u.id === story.userId);
        if (!author) return null;

        return (
          <div 
            key={story.id} 
            className={`story-item ${isViewed ? 'viewed' : ''}`}
            onClick={() => handleViewStory(index)}
          >
            <div className="story-avatar-wrapper">
              <UserAvatar user={author} size={58} />
            </div>
            <span>{author.name || author.fullName}</span>
          </div>
        );
      })}

      {/* Add Story Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%' }}>
            <h2>Create Story</h2>
            <form onSubmit={handleAddStory} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <input 
                type="file" 
                accept="image/*,video/*"
                onChange={(e) => setStoryFile(e.target.files[0])}
                required
              />
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Note: In this frontend-only demo, large files may exceed local storage limits.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Post Story</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Story Modal */}
      {activeStoryIndex !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <button 
            style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
            onClick={() => setActiveStoryIndex(null)}
          >
            <X size={32} />
          </button>
          
          <div style={{ maxWidth: '400px', width: '100%' }}>
            {stories[activeStoryIndex].mediaType === 'video' ? (
              <video src={stories[activeStoryIndex].mediaUrl} autoPlay controls style={{ width: '100%', borderRadius: '16px' }} />
            ) : (
              <img src={stories[activeStoryIndex].mediaUrl} alt="Story" style={{ width: '100%', borderRadius: '16px' }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
