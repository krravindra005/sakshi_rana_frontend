export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiValidationError {
  success: boolean;
  message: string;
  errors: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const metaEnv = (import.meta as any).env || {};
const BASE_URL = (metaEnv.VITE_API_URL || metaEnv.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v2') as string;

export class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Authentication token placeholder
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      try {
        return await response.json() as T;
      } catch {
        return {} as T;
      }
    }

    const status = response.status;
    let message = 'An error occurred';
    let errors: Record<string, string[]> | undefined;

    try {
      const errorData = await response.json();
      message = errorData.message || message;
      errors = errorData.errors;
    } catch {
      // Ignored if response is not JSON
    }

    // Specific Laravel status code handling
    switch (status) {
      case 401:
        // Unauthorized
        console.warn('API 401 Unauthorized: Redirecting/Clearing session...');
        localStorage.removeItem('auth_token');
        window.dispatchEvent(new Event('auth_state_changed'));
        break;
      case 403:
        // Forbidden
        console.error('API 403 Forbidden: Insufficient permissions.');
        break;
      case 404:
        // Not Found
        console.error('API 404 Not Found.');
        break;
      case 422:
        // Laravel Validation Errors
        console.error('API 422 Validation Error:', errors);
        break;
      case 429:
        // Rate Limiting
        console.error('API 429 Too Many Requests: Please slow down.');
        break;
      case 500:
        // Internal Server Error
        console.error('API 500 Internal Server Error.');
        break;
      default:
        console.error(`API Error ${status}: ${message}`);
    }

    throw new ApiError(message, status, errors);
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      ...options,
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();

