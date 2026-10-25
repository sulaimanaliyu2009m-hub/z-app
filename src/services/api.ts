const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_ROOT = RAW_API_URL.replace(/\/$/, '');
const BASE_URL = `${API_ROOT}/api`;

function getHeaders() {
  const token = localStorage.getItem('z_token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 1, timeoutMs = 60000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const mergedSignal = options.signal || controller.signal;

  try {
    const res = await fetch(url, { ...options, signal: mergedSignal });
    clearTimeout(timeoutId);
    return res;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('The server is taking longer than expected to respond. Please try again.');
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1200));
      return fetchWithRetry(url, options, retries - 1, timeoutMs);
    }
    if (!navigator.onLine) throw new Error('No internet connection. Please check your network.');
    throw new Error('Unable to connect to the server. It may be starting up, please try again.');
  }
}

export const api = {
  pingServer() { fetch(`${API_ROOT}/health`).catch(() => {}); },
  async register(data: any, signal?: AbortSignal) {
    const res = await fetchWithRetry(`${BASE_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data), signal });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed.');
    return json;
  },
  async login(data: any, signal?: AbortSignal) {
    const res = await fetchWithRetry(`${BASE_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data), signal });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed.');
    return json;
  },
  async getUserProfile(usernameOrId: string) {
    const res = await fetchWithRetry(`${BASE_URL}/users/profile/${encodeURIComponent(usernameOrId)}`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load profile.');
    return json;
  },
  async updateProfile(data: any) {
    const res = await fetchWithRetry(`${BASE_URL}/users/profile`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update profile.');
    return json;
  },
  async getFollowers(userId: string) {
    try { const res = await fetchWithRetry(`${BASE_URL}/users/${userId}/followers`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async getFollowing(userId: string) {
    try { const res = await fetchWithRetry(`${BASE_URL}/users/${userId}/following`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async getFeed() {
    try { const res = await fetchWithRetry(`${BASE_URL}/posts/feed`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async createPost(data: any) {
    const res = await fetchWithRetry(`${BASE_URL}/posts`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create post.');
    return json;
  },
  async toggleLike(postId: string) {
    try { const res = await fetchWithRetry(`${BASE_URL}/posts/${postId}/like`, { method: 'POST', headers: getHeaders() }); return res.json(); } catch { return { liked: false }; }
  },
  async addComment(postId: string, text: string, parentId?: string) {
    const res = await fetchWithRetry(`${BASE_URL}/posts/${postId}/comment`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ text, parentId }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to post comment.');
    return json;
  },
  async toggleFollow(targetUserId: string) {
    try { const res = await fetchWithRetry(`${BASE_URL}/users/${targetUserId}/follow`, { method: 'POST', headers: getHeaders() }); return res.json(); } catch { return { following: false }; }
  },
  async getVideoLimits() {
    try { const res = await fetchWithRetry(`${BASE_URL}/videos/limits`, { headers: getHeaders() }); if (res.ok) return res.json(); } catch {}
    return { maxVideoSeconds: 300, maxVideoMb: 100, storageReady: true };
  },
  async getVideoUploadUrl(contentType: string, fileSize: number) {
    const res = await fetchWithRetry(`${BASE_URL}/videos/upload-url`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ contentType, fileSize }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Could not obtain upload authorization.');
    return json;
  },
  uploadToS3(uploadUrl: string, file: File, onProgress: (percent: number) => void, retry = true): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else if (retry) this.uploadToS3(uploadUrl, file, onProgress, false).then(resolve).catch(reject);
        else reject(new Error(`Storage service rejected upload (${xhr.status}).`));
      };
      xhr.onerror = () => retry ? this.uploadToS3(uploadUrl, file, onProgress, false).then(resolve).catch(reject) : reject(new Error('Network error.'));
      xhr.send(file);
    });
  },
  async processVideo(videoId: string) {
    const res = await fetchWithRetry(`${BASE_URL}/videos/process`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ videoId }) });
    return res.json();
  },
  async pollVideoStatus(videoId: string) {
    const res = await fetchWithRetry(`${BASE_URL}/videos/${videoId}/status`, { headers: getHeaders() });
    return res.json();
  },
  async generateCaptions(prompt: string, mediaType = 'post') {
    const res = await fetchWithRetry(`${BASE_URL}/ai/generate-caption`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ prompt, mediaType }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'The AI assistant is unavailable right now.');
    return json;
  },
  async summarizePost(content: string, comments?: string[]) {
    const res = await fetchWithRetry(`${BASE_URL}/ai/summarize`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ content, comments }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'The AI assistant is unavailable right now.');
    return json;
  },
  async chatWithAi(messages: any[]) {
    const res = await fetchWithRetry(`${BASE_URL}/ai/chat`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ messages }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'The AI assistant is unavailable right now.');
    return json;
  },
  async getStories() {
    try { const res = await fetchWithRetry(`${BASE_URL}/stories`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async createStory(data: any) {
    const res = await fetchWithRetry(`${BASE_URL}/stories`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    return res.json();
  },
  async getConversations() {
    try { const res = await fetchWithRetry(`${BASE_URL}/conversations`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async createConversation(recipientIds: string[], isGroup = false, title?: string) {
    const res = await fetchWithRetry(`${BASE_URL}/conversations`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ recipientIds, isGroup, title }) });
    return res.json();
  },
  async getMessages(conversationId: string) {
    try { const res = await fetchWithRetry(`${BASE_URL}/conversations/${conversationId}/messages`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async sendMessage(conversationId: string, text: string, imageUrl?: string) {
    const res = await fetchWithRetry(`${BASE_URL}/conversations/${conversationId}/messages`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ text, imageUrl }) });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },
  async getNotifications() {
    try { const res = await fetchWithRetry(`${BASE_URL}/notifications`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async markNotificationsRead() {
    const res = await fetchWithRetry(`${BASE_URL}/notifications/read-all`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },
  async searchUsers(query: string) {
    try { const res = await fetchWithRetry(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async getGroups() {
    try { const res = await fetchWithRetry(`${BASE_URL}/groups`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async createGroup(data: any) {
    const res = await fetchWithRetry(`${BASE_URL}/groups`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create group');
    return json;
  },
  async toggleJoinGroup(groupId: string) {
    const res = await fetchWithRetry(`${BASE_URL}/groups/${groupId}/join`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },
  async getGroupPosts(groupId: string) {
    try { const res = await fetchWithRetry(`${BASE_URL}/groups/${groupId}/posts`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async createGroupPost(groupId: string, data: any) {
    const res = await fetchWithRetry(`${BASE_URL}/groups/${groupId}/posts`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to post in group');
    return json;
  },
  async getGroupMembers(groupId: string) {
    try { const res = await fetchWithRetry(`${BASE_URL}/groups/${groupId}/members`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async getGroupEvents(groupId: string) {
    try { const res = await fetchWithRetry(`${BASE_URL}/groups/${groupId}/events`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async createGroupEvent(groupId: string, data: any) {
    const res = await fetchWithRetry(`${BASE_URL}/groups/${groupId}/events`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create event');
    return json;
  },
  async rsvpEvent(eventId: string, status: any) {
    const res = await fetchWithRetry(`${BASE_URL}/events/${eventId}/rsvp`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ status }) });
    return res.json();
  },
  async searchDiscover(q: string) {
    try { const res = await fetchWithRetry(`${BASE_URL}/discover/search?q=${encodeURIComponent(q)}`, { headers: getHeaders() }); return res.ok ? res.json() : { people: [], posts: [], hashtags: [] }; } catch { return { people: [], posts: [], hashtags: [] }; }
  },
  async getTrending() {
    try { const res = await fetchWithRetry(`${BASE_URL}/discover/trending`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async getSuggestedUsers() {
    try { const res = await fetchWithRetry(`${BASE_URL}/discover/suggested-users`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async getPostsByHashtag(tag: string) {
    try { const res = await fetchWithRetry(`${BASE_URL}/discover/tags/${encodeURIComponent(tag)}`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async getLivePosts() {
    try { const res = await fetchWithRetry(`${BASE_URL}/live/posts`, { headers: getHeaders() }); return res.ok ? res.json() : []; } catch { return []; }
  },
  async createLivePost(content: string, quoteOfId?: string) {
    const res = await fetchWithRetry(`${BASE_URL}/live/posts`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ content, quoteOfId }) });
    return res.json();
  },
  async toggleRepost(postId: string) {
    const res = await fetchWithRetry(`${BASE_URL}/live/repost/${postId}`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },
};


export async function apiRequest<T = any>(endpoint: string, options: any = {}): Promise<T> {
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
  const url = endpoint.startsWith("http") ? endpoint : `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const token = localStorage.getItem('z_token') || localStorage.getItem('token');
  
  const headers: Record<string, string> = { ...(options.headers || {}) };
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status} (${res.statusText})`);
    }
  }
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}
