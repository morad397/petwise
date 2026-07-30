import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, Edit2, Trash2, EyeOff, Flag } from 'lucide-react';
import { toggleLike, toggleBookmark, deletePost, hidePost, reportPost } from '../../services/communityService';
import UserAvatar from '../UserAvatar';
import CommentSection from './CommentSection';

export default function PostCard({ post, currentUser, users, onPostDeleted, onPostHidden }) {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  
  // Local state for immediate UI feedback
  const [isLiked, setIsLiked] = useState(post.likedBy?.includes(currentUser.id));
  const [likeCount, setLikeCount] = useState(post.likedBy?.length || 0);
  
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarkedBy?.includes(currentUser.id));

  const author = users.find(u => u.id === post.authorId);
  const isOwner = currentUser.id === post.authorId;
  const isAdmin = currentUser.role === 'ADMIN';

  const handleLike = () => {
    const updated = toggleLike(post.id, currentUser.id);
    if (updated) {
      setIsLiked(updated.likedBy.includes(currentUser.id));
      setLikeCount(updated.likedBy.length);
    }
  };

  const handleBookmark = () => {
    const updated = toggleBookmark(post.id, currentUser.id);
    if (updated) {
      setIsBookmarked(updated.bookmarkedBy.includes(currentUser.id));
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'PetWise Community Post',
          text: post.content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePost(post.id);
      if (onPostDeleted) onPostDeleted(post.id);
    }
  };

  const handleHide = () => {
    hidePost(post.id, currentUser.id);
    if (onPostHidden) onPostHidden(post.id);
  };

  const handleReport = () => {
    const reason = window.prompt("Why are you reporting this post?");
    if (reason) {
      reportPost(post.id, currentUser.id, reason);
      alert("Post reported. Thank you.");
      handleHide(); // Auto-hide after reporting
    }
  };

  // Helper to format hashtags as bold/colored
  const renderContent = (content) => {
    if (!content) return null;
    const parts = content.split(/(#[\w]+)/g);
    return parts.map((part, i) => 
      part.startsWith('#') ? <span key={i} style={{ color: '#ff5a79', fontWeight: 500 }}>{part}</span> : part
    );
  };

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="post-author">
          <UserAvatar user={author} size={48} />
          <div className="post-author-info">
            <strong>{author?.name || author?.fullName || 'Unknown User'}</strong>
            <span>{new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal size={20} color="#64748b" />
          </button>
          
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: '100%', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px', zIndex: 10, minWidth: '150px' }}>
              {(isOwner || isAdmin) ? (
                <>
                  <button className="post-action" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => alert("Edit not fully implemented in frontend demo")}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="post-action" style={{ width: '100%', justifyContent: 'flex-start', color: '#d43a57' }} onClick={handleDelete}>
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              ) : (
                <>
                  <button className="post-action" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={handleHide}>
                    <EyeOff size={16} /> Hide
                  </button>
                  <button className="post-action" style={{ width: '100%', justifyContent: 'flex-start', color: '#f59e0b' }} onClick={handleReport}>
                    <Flag size={16} /> Report
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {post.content && (
        <div className="post-content">
          <p>{renderContent(post.content)}</p>
        </div>
      )}

      {post.mediaUrl && (
        post.mediaType === 'video' ? (
          <video src={post.mediaUrl} controls className="post-media" />
        ) : (
          <img src={post.mediaUrl} alt="Post media" className="post-media" />
        )
      )}

      <footer className="post-footer">
        <div className="post-footer-actions">
          <button className={`post-action ${isLiked ? 'active' : ''}`} onClick={handleLike}>
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> {likeCount > 0 && likeCount}
          </button>
          <button className={`post-action ${showComments ? 'active' : ''}`} onClick={() => setShowComments(!showComments)}>
            <MessageSquare size={18} /> {commentCount > 0 && commentCount}
          </button>
          <button className="post-action" onClick={handleShare}>
            <Share2 size={18} />
          </button>
        </div>
        <button className={`post-action ${isBookmarked ? 'active' : ''}`} onClick={handleBookmark}>
          <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </footer>

      {showComments && (
        <CommentSection 
          postId={post.id} 
          currentUser={currentUser} 
          users={users} 
          onCommentCountChange={setCommentCount}
        />
      )}
    </article>
  );
}
