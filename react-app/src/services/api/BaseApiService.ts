/**
 * Base API Service
 * Handles all HTTP requests with error handling, retries, and authentication
 */

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class BaseApiService {
  private config: ApiConfig;
  private authToken: string | null = null;

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || response.statusText,
        data
      );
    }

    return {
      data,
      status: response.status,
      message: data.message,
    };
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseURL);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseURL);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseURL);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.config.baseURL);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Create singleton instance
const apiConfig: ApiConfig = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
};

export const apiService = new BaseApiService(apiConfig);
