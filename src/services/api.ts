const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Silent server wake-up: trigger cold instances immediately on app start
export function wakeServerSilently(): void {
  if (!BASE_URL) return;
  fetch(`${BASE_URL}/health`, { method: 'GET', keepalive: true }).catch(() => {
    // Fail silently in the background
  });
}

wakeServerSilently();

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipRetry?: boolean;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 60000, skipRetry = false, ...fetchOptions } = options;
  const token = localStorage.getItem('z_token');

  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const performFetch = async (): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(`${BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let response: Response;

  try {
    response = await performFetch();
  } catch (error: any) {
    if (!skipRetry && (error.name === 'AbortError' || error.message?.includes('Failed to fetch'))) {
      try {
        await new Promise((res) => setTimeout(res, 2000));
        response = await performFetch();
      } catch (retryError: any) {
        throw new Error(mapFriendlyError(retryError));
      }
    } else {
      throw new Error(mapFriendlyError(error));
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || mapHttpStatusError(response.status));
  }

  return data as T;
}

function mapFriendlyError(err: any): string {
  if (err.name === 'AbortError') {
    return 'The server took too long to respond. It may still be starting up; please try again.';
  }
  return 'Unable to reach the server. Please check your internet connection.';
}

function mapHttpStatusError(status: number): string {
  if (status === 401) return 'Incorrect credentials. Please verify your email and password.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested resource was not found.';
  if (status >= 500) return 'The server is temporarily unavailable. Please try again in a few moments.';
  return 'An unexpected error occurred. Please try again.';
}
