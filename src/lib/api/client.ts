export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  request_id?: string;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  request_id?: string;
}

export interface ApiValidationError {
  success: boolean;
  message: string;
  errors: Record<string, string[]>;
  request_id?: string;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  request_id?: string;

  constructor(message: string, status: number, errors?: Record<string, string[]>, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.request_id = requestId;
  }
}

const metaEnv = (import.meta as any).env || {};
const BASE_URL = (metaEnv.VITE_API_URL || metaEnv.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v2') as string;
const SANCTUM_URL = (metaEnv.VITE_SANCTUM_URL || 'http://localhost:8000') as string;

export interface ApiRequestOptions extends RequestInit {
  skipCache?: boolean;
  forceRefresh?: boolean;
  ttlMs?: number;
}

export class ApiClient {
  private inFlightRequests: Map<string, Promise<any>> = new Map();
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  private getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
      if (match && match[1]) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(match[1]);
      }
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Fetch Sanctum CSRF cookie prior to stateful authentication actions
   */
  async csrfCookie(): Promise<void> {
    try {
      await fetch(`${SANCTUM_URL}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Sanctum CSRF cookie initialization notice:', e);
    }
  }

  /**
   * Invalidate cached GET queries matching a mutated resource
   */
  private invalidateCacheForMutation(path: string): void {
    const cleanPath = path.split('?')[0];
    const segments = cleanPath.split('/').filter(Boolean);
    const primaryResource = segments[0] === 'admin' ? segments[1] : segments[0];

    if (!primaryResource) {
      this.cache.clear();
      return;
    }

    for (const key of Array.from(this.cache.keys())) {
      if (key.includes(primaryResource)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear API response cache manually or by prefix
   */
  clearCache(pathPrefix?: string): void {
    if (!pathPrefix) {
      this.cache.clear();
      this.inFlightRequests.clear();
    } else {
      for (const key of Array.from(this.cache.keys())) {
        if (key.startsWith(pathPrefix) || key.includes(pathPrefix)) {
          this.cache.delete(key);
        }
      }
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const requestId = response.headers.get('X-Request-ID') || undefined;

    if (response.ok) {
      try {
        const json = await response.json();
        if (json && typeof json === 'object' && !json.request_id && requestId) {
          json.request_id = requestId;
        }
        return json as T;
      } catch {
        return {} as T;
      }
    }

    const status = response.status;
    let message = 'An unexpected API error occurred.';
    let errors: Record<string, string[]> | undefined;

    try {
      const errorData = await response.json();
      message = errorData.message || message;
      errors = errorData.errors;
    } catch {
      // Ignored if non-JSON response
    }

    if (status === 401 && typeof window !== 'undefined') {
      this.clearCache();
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new CustomEvent('auth_unauthorized'));
    }

    throw new ApiError(message, status, errors, requestId);
  }

  async get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    const cacheKey = path;
    const now = Date.now();

    // 1. Check cache if not forcing refresh and not skipping cache
    if (!options?.skipCache && !options?.forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiry > now) {
        return cached.data as T;
      }
    }

    // 2. Return in-flight request to deduplicate concurrent requests for the exact same endpoint
    if (!options?.skipCache && !options?.forceRefresh && this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey)!;
    }

    // 3. Initiate fetch and coalesce pending callers
    const fetchPromise = (async () => {
      try {
        const response = await fetch(`${BASE_URL}${path}`, {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
          ...options,
        });
        const data = await this.handleResponse<T>(response);

        // Cache successful response (default 60 seconds TTL)
        const ttl = options?.ttlMs ?? 60_000;
        if (ttl > 0 && !options?.skipCache) {
          this.cache.set(cacheKey, { data, expiry: Date.now() + ttl });
        }
        return data;
      } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw new ApiError('Unable to connect to backend service. Please check API server.', 0);
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  async post<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    try {
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: this.getHeaders(isFormData),
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
        credentials: 'include',
        ...options,
      });
      const data = await this.handleResponse<T>(response);
      this.invalidateCacheForMutation(path);
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Unable to connect to backend service. Please check API server.', 0);
    }
  }

  async put<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    try {
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'PUT',
        headers: this.getHeaders(isFormData),
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
        credentials: 'include',
        ...options,
      });
      const data = await this.handleResponse<T>(response);
      this.invalidateCacheForMutation(path);
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Unable to connect to backend service. Please check API server.', 0);
    }
  }

  async patch<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    try {
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'PATCH',
        headers: this.getHeaders(isFormData),
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
        credentials: 'include',
        ...options,
      });
      const data = await this.handleResponse<T>(response);
      this.invalidateCacheForMutation(path);
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Unable to connect to backend service. Please check API server.', 0);
    }
  }

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
        ...options,
      });
      const data = await this.handleResponse<T>(response);
      this.invalidateCacheForMutation(path);
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Unable to connect to backend service. Please check API server.', 0);
    }
  }
}

export const apiClient = new ApiClient();
