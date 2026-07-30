// communityService.js
// Handles localStorage mock database operations for the Community feature

const DB_KEYS = {
  POSTS: 'petwise-community-posts',
  COMMENTS: 'petwise-community-comments',
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

// --- Posts ---
export const getPosts = () => {
  return readDB(DB_KEYS.POSTS).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getPostById = (postId) => {
  return readDB(DB_KEYS.POSTS).find(p => p.id === postId);
};

export const createPost = (postData) => {
  const posts = readDB(DB_KEYS.POSTS);
  
  // Extract hashtags from content if not provided
  let hashtags = postData.hashtags || [];
  if (postData.content) {
    const extracted = postData.content.match(/#[\w]+/g);
    if (extracted) {
      hashtags = [...new Set([...hashtags, ...extracted])];
    }
  }

  const newPost = {
    ...postData,
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    hashtags,
    createdAt: new Date().toISOString(),
    likedBy: [],
    bookmarkedBy: []
  };
  posts.push(newPost);
  writeDB(DB_KEYS.POSTS, posts);
  return newPost;
};

export const updatePost = (postId, changes) => {
  const posts = readDB(DB_KEYS.POSTS);
  const index = posts.findIndex(p => p.id === postId);
  if (index !== -1) {
    let hashtags = changes.hashtags || posts[index].hashtags;
    if (changes.content) {
      const extracted = changes.content.match(/#[\w]+/g);
      if (extracted) {
        hashtags = [...new Set([...(changes.hashtags || []), ...extracted])];
      }
    }

    posts[index] = { 
      ...posts[index], 
      ...changes, 
      hashtags,
      updatedAt: new Date().toISOString() 
    };
    writeDB(DB_KEYS.POSTS, posts);
    return posts[index];
  }
  return null;
};

export const deletePost = (postId) => {
  const posts = readDB(DB_KEYS.POSTS);
  writeDB(DB_KEYS.POSTS, posts.filter(p => p.id !== postId));
  
  // Clean up comments
  const comments = readDB(DB_KEYS.COMMENTS);
  writeDB(DB_KEYS.COMMENTS, comments.filter(c => c.postId !== postId));
};

export const toggleLike = (postId, userId) => {
  const posts = readDB(DB_KEYS.POSTS);
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.likedBy = post.likedBy || [];
    if (post.likedBy.includes(userId)) {
      post.likedBy = post.likedBy.filter(id => id !== userId);
    } else {
      post.likedBy.push(userId);
    }
    writeDB(DB_KEYS.POSTS, posts);
    return post;
  }
  return null;
};

export const toggleBookmark = (postId, userId) => {
  const posts = readDB(DB_KEYS.POSTS);
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.bookmarkedBy = post.bookmarkedBy || [];
    if (post.bookmarkedBy.includes(userId)) {
      post.bookmarkedBy = post.bookmarkedBy.filter(id => id !== userId);
    } else {
      post.bookmarkedBy.push(userId);
    }
    writeDB(DB_KEYS.POSTS, posts);
    return post;
  }
  return null;
};

// --- Comments ---
export const getCommentsByPostId = (postId) => {
  return readDB(DB_KEYS.COMMENTS)
    .filter(c => c.postId === postId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export const createComment = (commentData) => {
  const comments = readDB(DB_KEYS.COMMENTS);
  const newComment = {
    ...commentData,
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  comments.push(newComment);
  writeDB(DB_KEYS.COMMENTS, comments);
  return newComment;
};

export const deleteComment = (commentId) => {
  const comments = readDB(DB_KEYS.COMMENTS);
  writeDB(DB_KEYS.COMMENTS, comments.filter(c => c.id !== commentId));
};

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

export const reportPost = (postId, userId, reason = '') => {
  const reports = readDB(DB_KEYS.REPORTS);
  if (!reports.some(r => r.postId === postId && r.userId === userId)) {
    reports.push({ postId, userId, reason, createdAt: new Date().toISOString() });
    writeDB(DB_KEYS.REPORTS, reports);
  }
};
