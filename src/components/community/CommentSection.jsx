import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { getCommentsByPostId, createComment, deleteComment } from '../../services/communityService';
import UserAvatar from '../UserAvatar';

export default function CommentSection({ postId, currentUser, users, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const loadComments = () => {
    const fetched = getCommentsByPostId(postId);
    setComments(fetched);
    if (onCommentCountChange) onCommentCountChange(fetched.length);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    createComment({
      postId,
      authorId: currentUser.id,
      content: newComment.trim()
    });
    setNewComment('');
    loadComments();
  };

  const handleDelete = (commentId) => {
    if (window.confirm("Delete this comment?")) {
      deleteComment(commentId);
      loadComments();
    }
  };

  return (
    <div className="comment-section">
      {/* Existing Comments */}
      {comments.map(comment => {
        const author = users.find(u => u.id === comment.authorId);
        const canDelete = currentUser.id === comment.authorId || currentUser.role === 'ADMIN';
        
        return (
          <div key={comment.id} className="comment-item">
            <UserAvatar user={author} size={32} />
            <div className="comment-content">
              <div className="comment-header">
                <strong>{author?.name || author?.fullName || 'Unknown'}</strong>
                {canDelete && (
                  <button onClick={() => handleDelete(comment.id)} style={{ border: 'none', background: 'transparent', color: '#cbd5e1', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155' }}>{comment.content}</p>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      })}

      {/* Input */}
      <form onSubmit={handlePostComment} className="comment-input-area">
        <UserAvatar user={currentUser} size={32} />
        <input 
          type="text" 
          placeholder="Write a comment..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '99px' }} disabled={!newComment.trim()}>
          Post
        </button>
      </form>
    </div>
  );
}
