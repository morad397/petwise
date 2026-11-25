// communityService.js
// Community feature: posts, comments and likes come from the API (MongoDB);
// stories, groups, follows and hidden posts are still stored in this browser.

import { apiRequest } from './api';

const DB_KEYS = {
  STORIES: 'petwise-community-stories',
  GROUPS: 'petwise-community-groups',
  FOLLOWS: 'petwise-community-follows',
  REPORTS: 'petwise-community-reports',
  HIDDEN: 'petwise-community-hidden'
};

const readDB = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const writeDB = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Posts, comments, likes, saved posts, reports (API) ---
// Posts: { id, authorId, authorName, content, mediaUrl, mediaType, petName, hashtags,
//          likeCount, likedByMe, bookmarkedByMe, commentCount, createdAt }
export const getPosts = ({ hashtag, saved } = {}) => {
  const params = new URLSearchParams();
  if (hashtag) params.set('hashtag', hashtag);
  if (saved) params.set('saved', 'true');
  const query = params.toString();
  return apiRequest(`/posts${query ? `?${query}` : ''}`);
};

export const createPost = (data) => apiRequest('/posts', { method: 'POST', body: data });
export const updatePost = (postId, content) => apiRequest(`/posts/${postId}`, { method: 'PUT', body: { content } });
export const deletePost = (postId) => apiRequest(`/posts/${postId}`, { method: 'DELETE' });

// returns { liked, likeCount }
export const toggleLike = (postId) => apiRequest(`/posts/${postId}/like`, { method: 'POST' });
// returns { bookmarked }
export const toggleBookmark = (postId) => apiRequest(`/posts/${postId}/bookmark`, { method: 'POST' });
export const reportPost = (postId, reason) =>
  apiRequest(`/posts/${postId}/report`, { method: 'POST', body: { reason } });

export const getCommentsByPostId = (postId) => apiRequest(`/posts/${postId}/comments`);
export const createComment = (postId, content) =>
  apiRequest(`/posts/${postId}/comments`, { method: 'POST', body: { content } });
export const deleteComment = (commentId) => apiRequest(`/comments/${commentId}`, { method: 'DELETE' });

// Stories, groups, follows and hidden posts below are still kept in this browser (not in the class diagrams).

// --- Stories ---
export const getStories = () => {
  const stories = readDB(DB_KEYS.STORIES);
  const now = new Date();
  // Filter out expired stories (e.g. 24h)
  const validStories = stories.filter(s => {
    if (!s.expiresAt) return true;
    return new Date(s.expiresAt) > now;
  });
  return validStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const createStory = (storyData) => {
  const stories = readDB(DB_KEYS.STORIES);
  const newStory = {
    ...storyData,
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    viewedBy: []
  };
  stories.push(newStory);
  writeDB(DB_KEYS.STORIES, stories);
  return newStory;
};

export const markStoryViewed = (storyId, userId) => {
  const stories = readDB(DB_KEYS.STORIES);
  const story = stories.find(s => s.id === storyId);
  if (story) {
    story.viewedBy = story.viewedBy || [];
    if (!story.viewedBy.includes(userId)) {
      story.viewedBy.push(userId);
      writeDB(DB_KEYS.STORIES, stories);
    }
  }
};

// --- Groups ---
export const getGroups = () => {
  return readDB(DB_KEYS.GROUPS);
};

export const joinGroup = (groupId, userId) => {
  const groups = readDB(DB_KEYS.GROUPS);
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.memberIds = group.memberIds || [];
    if (!group.memberIds.includes(userId)) {
      group.memberIds.push(userId);
      writeDB(DB_KEYS.GROUPS, groups);
    }
  }
};

export const leaveGroup = (groupId, userId) => {
  const groups = readDB(DB_KEYS.GROUPS);
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.memberIds = (group.memberIds || []).filter(id => id !== userId);
    writeDB(DB_KEYS.GROUPS, groups);
  }
};

// --- Follows ---
export const getFollows = () => {
  return readDB(DB_KEYS.FOLLOWS);
};

export const getSuggestedFriends = (userId) => {
  const users = JSON.parse(localStorage.getItem('petwise-users')) || [];
  const follows = getFollows();
  
  // Get list of IDs the user is currently following
  const followingIds = follows
    .filter(f => f.followerId === userId)
    .map(f => f.followingId);

  // Suggest other Pet Owners who are not the current user and not already followed
  return users.filter(u => 
    u.id !== userId && 
    u.role === 'PET_OWNER' && 
    !followingIds.includes(u.id)
  );
};

export const followUser = (followerId, followingId) => {
  if (followerId === followingId) return;
  const follows = readDB(DB_KEYS.FOLLOWS);
  const existing = follows.find(f => f.followerId === followerId && f.followingId === followingId);
  if (!existing) {
    follows.push({ followerId, followingId, createdAt: new Date().toISOString() });
    writeDB(DB_KEYS.FOLLOWS, follows);
  }
};

export const unfollowUser = (followerId, followingId) => {
  const follows = readDB(DB_KEYS.FOLLOWS);
  writeDB(DB_KEYS.FOLLOWS, follows.filter(f => !(f.followerId === followerId && f.followingId === followingId)));
};

// --- Hiding & Reporting ---
export const hidePost = (postId, userId) => {
  const hidden = readDB(DB_KEYS.HIDDEN);
  if (!hidden.some(h => h.postId === postId && h.userId === userId)) {
    hidden.push({ postId, userId, createdAt: new Date().toISOString() });
    writeDB(DB_KEYS.HIDDEN, hidden);
  }
};

export const getHiddenPosts = (userId) => {
  return readDB(DB_KEYS.HIDDEN).filter(h => h.userId === userId).map(h => h.postId);
};
