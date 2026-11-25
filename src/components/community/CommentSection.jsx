import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { getCommentsByPostId, createComment, deleteComment } from '../../services/communityService';
import UserAvatar from '../UserAvatar';

export default function CommentSection({ postId, currentUser, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSending, setIsSending] = useState(false);

  const showComments = (fetched) => {
    setComments(fetched);
    if (onCommentCountChange) onCommentCountChange(fetched.length);
  };

  const loadComments = () =>
    getCommentsByPostId(postId)
      .then(showComments)
      .catch((err) => console.error('Failed to load comments', err));

  useEffect(() => {
    let cancelled = false;
    getCommentsByPostId(postId)
      .then((fetched) => {
        if (cancelled) return;
        setComments(fetched);
        if (onCommentCountChange) onCommentCountChange(fetched.length);
      })
      .catch((err) => console.error('Failed to load comments', err));
    return () => {
      cancelled = true;
    };
  }, [postId, onCommentCountChange]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSending(true);
    try {
      await createComment(postId, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="comment-section">
      {comments.map((comment) => {
        const canDelete = currentUser.id === comment.authorId || currentUser.role === 'ADMIN';
        return (
          <div key={comment.id} className="comment-item">
            <UserAvatar user={{ fullName: comment.authorName }} size={32} />
            <div className="comment-content">
              <div className="comment-header">
                <strong>{comment.authorName}</strong>
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

      <form onSubmit={handlePostComment} className="comment-input-area">
        <UserAvatar user={currentUser} size={32} />
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '99px' }} disabled={!newComment.trim() || isSending}>
          Post
        </button>
      </form>
    </div>
  );
}
