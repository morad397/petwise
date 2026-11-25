import { useState } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, Edit2, Trash2, EyeOff, Flag } from 'lucide-react';
import { toggleLike, toggleBookmark, deletePost, updatePost, hidePost, reportPost } from '../../services/communityService';
import UserAvatar from '../UserAvatar';
import CommentSection from './CommentSection';

export default function PostCard({ post, currentUser, onPostDeleted, onPostHidden, onPostUpdated }) {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showMenu, setShowMenu] = useState(false);

  const [isLiked, setIsLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarkedByMe);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);

  const author = { fullName: post.authorName };
  const isOwner = currentUser.id === post.authorId;
  const isAdmin = currentUser.role === 'ADMIN';

  const run = async (action) => {
    try {
      await action();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLike = () =>
    run(async () => {
      const result = await toggleLike(post.id);
      setIsLiked(result.liked);
      setLikeCount(result.likeCount);
    });

  const handleBookmark = () =>
    run(async () => {
      const result = await toggleBookmark(post.id);
      setIsBookmarked(result.bookmarked);
    });

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'PetWise Community Post', text: post.content, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(post.content || window.location.href);
        alert('Post text copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    run(async () => {
      await deletePost(post.id);
      if (onPostDeleted) onPostDeleted(post.id);
    });
  };

  const handleSaveEdit = () =>
    run(async () => {
      const updated = await updatePost(post.id, editText);
      setIsEditing(false);
      if (onPostUpdated) onPostUpdated(updated);
    });

  const handleHide = () => {
    setShowMenu(false);
    hidePost(post.id, currentUser.id); // hiding is a personal preference, kept in this browser
    if (onPostHidden) onPostHidden(post.id);
  };

  const handleReport = () => {
    setShowMenu(false);
    const reason = window.prompt('Why are you reporting this post?');
    if (!reason) return;
    run(async () => {
      await reportPost(post.id, reason);
      alert('Post reported. Thank you.');
      handleHide(); // Auto-hide after reporting
    });
  };

  // Helper to format hashtags as bold/colored
  const renderContent = (content) => {
    if (!content) return null;
    const parts = content.split(/(#[\w]+)/g);
    return parts.map((part, i) =>
      part.startsWith('#') ? <span key={i} style={{ color: '#ff5a79', fontWeight: 500 }}>{part}</span> : part
    );
  };

  const created = new Date(post.createdAt);
  const wasEdited = post.updatedAt && new Date(post.updatedAt) - created > 1000;

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="post-author">
          <UserAvatar user={author} size={48} />
          <div className="post-author-info">
            <strong>
              {post.authorName}
              {post.authorRole === 'CLINIC_STAFF' && <span style={{ marginLeft: 6, fontSize: '0.75rem', color: '#1d4ed8' }}>Clinic staff</span>}
              {post.petName && <span style={{ fontWeight: 400, color: '#64748b' }}> with {post.petName}</span>}
            </strong>
            <span>
              {created.toLocaleDateString()} at {created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {wasEdited ? ' • edited' : ''}
            </span>
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
              {isOwner && (
                <button className="post-action" style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => { setShowMenu(false); setEditText(post.content); setIsEditing(true); }}>
                  <Edit2 size={16} /> Edit
                </button>
              )}
              {(isOwner || isAdmin) && (
                <button className="post-action" style={{ width: '100%', justifyContent: 'flex-start', color: '#d43a57' }} onClick={handleDelete}>
                  <Trash2 size={16} /> Delete
                </button>
              )}
              {!isOwner && (
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

      {isEditing ? (
        <div className="post-content">
          <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
            style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn btn-primary" style={{ padding: '6px 14px' }} onClick={handleSaveEdit}>Save</button>
            <button className="btn btn-ghost" style={{ padding: '6px 14px' }} onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        post.content && (
          <div className="post-content">
            <p>{renderContent(post.content)}</p>
          </div>
        )
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
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} /> {likeCount > 0 && likeCount}
          </button>
          <button className={`post-action ${showComments ? 'active' : ''}`} onClick={() => setShowComments(!showComments)}>
            <MessageSquare size={18} /> {commentCount > 0 && commentCount}
          </button>
          <button className="post-action" onClick={handleShare}>
            <Share2 size={18} />
          </button>
        </div>
        <button className={`post-action ${isBookmarked ? 'active' : ''}`} onClick={handleBookmark} title={isBookmarked ? 'Saved' : 'Save'}>
          <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </footer>

      {showComments && (
        <CommentSection postId={post.id} currentUser={currentUser} onCommentCountChange={setCommentCount} />
      )}
    </article>
  );
}
