const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  session?: {
    access_token: string;
    refresh_token?: string;
  };
  message?: string;
}

export interface ErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

class ApiService {
  private baseUrl = API_BASE_URL;

  private async handleResponse<T>(response: Response): Promise<T> {
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Error: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data as T;
  }

  async signup(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  async getLandingInfo() {
    const response = await fetch(`${this.baseUrl}/landing`);

    if (!response.ok) {
      throw new Error('Failed to fetch landing page info');
    }

    return response.json();
  }

  async getHealthStatus() {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error('Server is not responding');
    }

    return response.json();
  }
}

export const apiService = new ApiService();
