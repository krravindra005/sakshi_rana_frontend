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

export class ApiClient {
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
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new CustomEvent('auth_unauthorized'));
    }

    throw new ApiError(message, status, errors, requestId);
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
        ...options,
      });
      return await this.handleResponse<T>(response);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Unable to connect to backend service. Please check API server.', 0);
    }
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
      return await this.handleResponse<T>(response);
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
      return await this.handleResponse<T>(response);
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
      return await this.handleResponse<T>(response);
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
      return await this.handleResponse<T>(response);
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Unable to connect to backend service. Please check API server.', 0);
    }
  }
}

export const apiClient = new ApiClient();
