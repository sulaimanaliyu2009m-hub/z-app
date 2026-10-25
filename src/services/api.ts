const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

function getHeaders() {
  const token = localStorage.getItem('z_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  async register(data: any) {
    const res = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json;
  },

  async login(data: any) {
    const res = await fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
  },

  async getFeed() {
    try {
      const res = await fetch(`${BASE_URL}/posts/feed`, { headers: getHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    } catch { return []; }
  },

  async createPost(data: any) {
    const res = await fetch(`${BASE_URL}/posts`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create post');
    return json;
  },

  async toggleLike(postId: string) {
    try {
      const res = await fetch(`${BASE_URL}/posts/${postId}/like`, { method: 'POST', headers: getHeaders() });
      return res.json();
    } catch { return { liked: false }; }
  },

  async addComment(postId: string, text: string, parentId?: string) {
    const res = await fetch(`${BASE_URL}/posts/${postId}/comment`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ text, parentId }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add comment');
    return json;
  },

  async toggleFollow(targetUserId: string) {
    try {
      const res = await fetch(`${BASE_URL}/users/${targetUserId}/follow`, { method: 'POST', headers: getHeaders() });
      return res.json();
    } catch { return { following: false }; }
  },

  async getVideoUploadUrl(contentType: string, fileSize: number) {
    const res = await fetch(`${BASE_URL}/videos/upload-url`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ contentType, fileSize }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Could not get upload URL');
    return json;
  },

  uploadToS3(uploadUrl: string, file: File, onProgress: (percent: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('S3 upload failed')));
      xhr.onerror = () => reject(new Error('Network error during S3 upload'));
      xhr.send(file);
    });
  },

  async processVideo(videoId: string) {
    const res = await fetch(`${BASE_URL}/videos/process`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ videoId }) });
    return res.json();
  },

  async pollVideoStatus(videoId: string) {
    const res = await fetch(`${BASE_URL}/videos/${videoId}/status`, { headers: getHeaders() });
    return res.json();
  },

  async getStories() {
    try {
      const res = await fetch(`${BASE_URL}/stories`, { headers: getHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    } catch { return []; }
  },

  async createStory(data: any) {
    const res = await fetch(`${BASE_URL}/stories`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    return res.json();
  },

  async getConversations() {
    const res = await fetch(`${BASE_URL}/conversations`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async createConversation(recipientIds: string[], isGroup = false, title?: string) {
    const res = await fetch(`${BASE_URL}/conversations`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ recipientIds, isGroup, title }) });
    return res.json();
  },

  async getMessages(conversationId: string) {
    const res = await fetch(`${BASE_URL}/conversations/${conversationId}/messages`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async getNotifications() {
    const res = await fetch(`${BASE_URL}/notifications`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async markNotificationsRead() {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },

  async searchUsers(query: string) {
    const res = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async getGroups() {
    try {
      const res = await fetch(`${BASE_URL}/groups`, { headers: getHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    } catch { return []; }
  },

  async createGroup(data: any) {
    const res = await fetch(`${BASE_URL}/groups`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create group');
    return json;
  },

  async toggleJoinGroup(groupId: string) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/join`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },

  async getGroupPosts(groupId: string) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/posts`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async createGroupPost(groupId: string, data: any) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/posts`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to post in group');
    return json;
  },

  async getGroupMembers(groupId: string) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/members`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async getGroupEvents(groupId: string) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/events`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async createGroupEvent(groupId: string, data: any) {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/events`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create event');
    return json;
  },

  async rsvpEvent(eventId: string, status: any) {
    const res = await fetch(`${BASE_URL}/events/${eventId}/rsvp`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ status }) });
    return res.json();
  },

  async searchDiscover(q: string) {
    const res = await fetch(`${BASE_URL}/discover/search?q=${encodeURIComponent(q)}`, { headers: getHeaders() });
    if (!res.ok) return { people: [], posts: [], hashtags: [] };
    return res.json();
  },

  async getTrending() {
    try {
      const res = await fetch(`${BASE_URL}/discover/trending`, { headers: getHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    } catch { return []; }
  },

  async getSuggestedUsers() {
    try {
      const res = await fetch(`${BASE_URL}/discover/suggested-users`, { headers: getHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    } catch { return []; }
  },

  async getPostsByHashtag(tag: string) {
    const res = await fetch(`${BASE_URL}/discover/tags/${encodeURIComponent(tag)}`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async getLivePosts() {
    try {
      const res = await fetch(`${BASE_URL}/live/posts`, { headers: getHeaders() });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    } catch { return []; }
  },

  async createLivePost(content: string, quoteOfId?: string) {
    const res = await fetch(`${BASE_URL}/live/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, quoteOfId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to publish post');
    return json;
  },

  async toggleRepost(postId: string) {
    const res = await fetch(`${BASE_URL}/live/repost/${postId}`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },

  // --- Gemini AI Services ---
  async generateCaptions(prompt: string, mediaType = 'post') {
    const res = await fetch(`${BASE_URL}/ai/generate-caption`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt, mediaType })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'AI generation failed');
    return json;
  },

  async summarizePost(content: string, comments?: string[]) {
    const res = await fetch(`${BASE_URL}/ai/summarize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, comments })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'AI summary failed');
    return json;
  },

  async chatWithAi(messages: { sender: string; text: string }[]) {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ messages })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'AI chat failed');
    return json;
  }
};

// Recommendation & Watch Time
api.getForYouRankedFeed = async function() {
  const res = await fetch('http://localhost:5000/api/recommend/for-you', { headers: getHeaders() });
  if (!res.ok) return [];
  return res.json();
};

api.trackWatchTime = async function(postId: string, watchSeconds: number, completionRate: number) {
  try {
    await fetch('http://localhost:5000/api/videos/watch', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ postId, watchSeconds, completionRate })
    });
  } catch {}
};
