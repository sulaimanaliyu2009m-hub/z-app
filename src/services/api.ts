const ROOT_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export function wakeServerSilently(): void {
  if (!ROOT_URL) return;
  fetch(`${ROOT_URL}/health`, { method: 'GET', keepalive: true }).catch(() => {});
}
wakeServerSilently();

async function resilientFetch(url: string, options: RequestInit = {}, retries = 1): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err: any) {
    clearTimeout(timer);
    if (retries > 0 && (err.name === 'AbortError' || err.message?.includes('Failed to fetch'))) {
      await new Promise((r) => setTimeout(r, 1500));
      return resilientFetch(url, options, retries - 1);
    }
    if (err.name === 'AbortError') {
      throw new Error('The server took too long to respond. It may still be starting up; please try again.');
    }
    throw new Error('Unable to reach the server. Please check your internet connection.');
  }
}

const BASE_URL = `${ROOT_URL}/api`;

function getHeaders() {
  const token = localStorage.getItem('z_token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  async register(data: any) {
    const res = await resilientFetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json;
  },

  async login(data: any) {
    const res = await resilientFetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
  },

  async getFeed() {
    const res = await resilientFetch(`${BASE_URL}/posts/feed`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async toggleLike(postId: string) {
    const res = await resilientFetch(`${BASE_URL}/posts/${postId}/like`, { method: 'POST', headers: getHeaders() });
    return res.json();
  },

  async createPost(data: any) {
    const res = await resilientFetch(`${BASE_URL}/posts`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create post');
    return json;
  }
};

export async function apiRequest<T = any>(endpoint: string, options: any = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${ROOT_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = localStorage.getItem('z_token') || localStorage.getItem('token');
  const headers: Record<string, string> = { ...(options.headers || {}) };
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await resilientFetch(url, { ...options, headers });
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
