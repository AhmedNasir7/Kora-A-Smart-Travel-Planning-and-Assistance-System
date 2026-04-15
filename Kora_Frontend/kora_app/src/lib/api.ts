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

export interface DashboardStat {
  label: string;
  value: string | number;
  subtext?: string;
}

export type DashboardEventColor = 'green' | 'orange' | 'blue';

export interface DashboardUpcomingEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  code?: string;
  color: DashboardEventColor;
}

export type DashboardQuickActionIcon =
  | 'trips'
  | 'packing'
  | 'documents'
  | 'reminders';

export interface DashboardQuickAction {
  label: string;
  href: string;
  icon: DashboardQuickActionIcon;
}

export interface DashboardActiveTrip {
  location: string;
  country: string;
  startDate: string;
  endDate: string;
  progress: number;
  label: string;
}

export interface DashboardResponse {
  welcomeMessage: string;
  stats: DashboardStat[];
  upcomingEvents: DashboardUpcomingEvent[];
  quickActions: DashboardQuickAction[];
  activeTrip: DashboardActiveTrip;
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

  async signup(
    email: string,
    password: string,
    username: string,
  ): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
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

  async getDashboard(firstName?: string): Promise<DashboardResponse> {
    const query = firstName
      ? `?firstName=${encodeURIComponent(firstName)}`
      : '';
    const response = await fetch(`${this.baseUrl}/dashboard${query}`, {
      cache: 'no-store',
    });

    return this.handleResponse<DashboardResponse>(response);
  }
}

export const apiService = new ApiService();
