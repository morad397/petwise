import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Video, Smile, X } from 'lucide-react';
import { createPost } from '../../services/communityService';
import UserAvatar from '../UserAvatar';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function CreatePost({ currentUser, onPostCreated, userPets }) {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB for this demo.");
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) return;

    setIsSaving(true);
    try {
      let mediaUrl = '';
      let mediaType = '';

      if (mediaFile) {
        mediaUrl = await fileToDataUrl(mediaFile);
        mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
      }

      const newPost = createPost({
        authorId: currentUser.id,
        content: content.trim(),
        mediaUrl,
        mediaType,
        petId: selectedPetId || undefined,
        hashtags: [] // hashtags are auto-extracted in service
      });

      setContent('');
      removeMedia();
      setSelectedPetId('');
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      alert("Failed to create post.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="create-post-card">
      <div className="create-post-input">
        <UserAvatar user={currentUser} size={40} />
        <textarea 
          placeholder="Share something about your pet..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSaving}
        />
      </div>

      {mediaPreview && (
        <div style={{ position: 'relative', marginTop: '12px' }}>
          <button 
            type="button"
            onClick={removeMedia}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
          {mediaFile?.type.startsWith('video') ? (
            <video src={mediaPreview} controls style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px' }} />
          ) : (
            <img src={mediaPreview} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px' }} />
          )}
        </div>
      )}

      {userPets && userPets.length > 0 && (
        <div style={{ margin: '8px 0' }}>
          <select 
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '99px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b', outline: 'none' }}
          >
            <option value="">General Post</option>
            {userPets.map(pet => (
              <option key={pet.id} value={pet.id}>About {pet.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="create-post-actions">
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          <button 
            type="button" 
            className="create-post-action-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={18} color="#10b981" /> Photo
          </button>
          <button 
            type="button" 
            className="create-post-action-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Video size={18} color="#3b82f6" /> Video
          </button>
          <button type="button" className="create-post-action-btn">
            <Smile size={18} color="#f59e0b" /> Feeling
          </button>
        </div>

        <button 
          type="button" 
          className="btn btn-primary" 
          style={{ padding: '8px 16px' }}
          disabled={(!content.trim() && !mediaFile) || isSaving}
          onClick={handleSubmit}
        >
          {isSaving ? 'Posting...' : 'Publish'}
        </button>
      </div>
    </div>
  );
}
