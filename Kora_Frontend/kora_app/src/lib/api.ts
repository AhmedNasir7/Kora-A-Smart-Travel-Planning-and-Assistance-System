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

export type TripStatus = 'Upcoming' | 'Planning' | 'Draft' | 'Idea';

export interface TripCardItem {
  id: string;
  destination: string;
  country: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  progress: number;
  emoji?: string;
}

export interface TripDetail {
  id: string;
  destination: string;
  country: string;
  status: TripStatus | string;
  startDate: string;
  endDate: string;
  progress: number;
  description: string;
  emoji?: string;
  tasksRemaining: number;
}

export interface TripTimelineItem {
  id: string;
  time: string;
  title: string;
  icon: string;
}

export interface TripPackingList {
  title: string;
  categories: Array<{ icon: string; name: string; count: string }>;
  featuredList: {
    title: string;
    items: Array<{ item: string; count: string; checked: boolean }>;
  };
}

export interface TripDocument {
  id: string;
  name: string;
  status: 'ready' | 'pending';
  type: string;
}

export type DocumentStatus = 'verified' | 'pending' | 'expired';

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  status: DocumentStatus;
  expiryDate: string;
  uploadDate: string;
  tripId: string | null;
}

export interface DocumentListResponse {
  items: DocumentItem[];
  total: number;
  filter: 'all' | DocumentStatus;
}

export interface CreateDocumentPayload {
  title: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  expiryDate?: string;
  tripId?: string;
}

export interface UpdateDocumentPayload {
  title?: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  expiryDate?: string;
  tripId?: string;
}

export type PackingCategory =
  | 'Clothing'
  | 'Electronics'
  | 'Health'
  | 'Essentials';

export interface PackingCategorySummary {
  name: PackingCategory;
  icon: 'clothing' | 'electronics' | 'health' | 'essentials';
  packed: number;
  total: number;
}

export interface PackingItem {
  id: string;
  name: string;
  category: PackingCategory;
  packed: boolean;
}

export interface PackingOverviewResponse {
  trip: {
    title: string;
    subtitle: string;
  };
  progress: number;
  categories: PackingCategorySummary[];
  selectedCategory: PackingCategory;
  items: PackingItem[];
}

export interface CreatePackingItemPayload {
  name: string;
  category: PackingCategory;
  tripId?: string;
}

export interface TripListResponse {
  items: TripCardItem[];
  total: number;
  tabs: Array<'all' | 'upcoming' | 'planning' | 'draft' | 'idea'>;
}

export interface CreateTripPayload {
  destination: string;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Idea' | 'Planning' | 'Upcoming';
  emoji?: string;
}

export interface UpdateTripStatusPayload {
  status: 'Draft' | 'Idea' | 'Planning' | 'Upcoming';
}

class ApiService {
  private baseUrl = API_BASE_URL;

  private getUserScopeHeader(): Record<string, string> {
    if (typeof window === 'undefined') {
      return {};
    }

    const userId = localStorage.getItem('kora_user_id');
    if (!userId) {
      return {};
    }

    return { 'x-kora-user-id': userId };
  }

  private async fetchWithUserScope(
    input: string,
    init: RequestInit = {},
  ): Promise<Response> {
    const userHeader = this.getUserScopeHeader();
    const headers = new Headers(init.headers || {});

    Object.entries(userHeader).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return fetch(input, {
      ...init,
      headers,
    });
  }

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
    const response = await this.fetchWithUserScope(`${this.baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  async getLandingInfo() {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/landing`);

    if (!response.ok) {
      throw new Error('Failed to fetch landing page info');
    }

    return response.json();
  }

  async getHealthStatus() {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error('Server is not responding');
    }

    return response.json();
  }

  async getDashboard(firstName?: string): Promise<DashboardResponse> {
    const query = firstName
      ? `?firstName=${encodeURIComponent(firstName)}`
      : '';
    const response = await this.fetchWithUserScope(`${this.baseUrl}/dashboard${query}`, {
      cache: 'no-store',
    });

    return this.handleResponse<DashboardResponse>(response);
  }

  async getTrips(status?: string, search?: string): Promise<TripListResponse> {
    const params = new URLSearchParams();
    if (status) {
      params.set('status', status);
    }
    if (search) {
      params.set('search', search);
    }

    const query = params.toString();
    const response = await this.fetchWithUserScope(
      `${this.baseUrl}/trips${query ? `?${query}` : ''}`,
      { cache: 'no-store' },
    );

    return this.handleResponse<TripListResponse>(response);
  }

  async createTrip(payload: CreateTripPayload): Promise<TripCardItem> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return this.handleResponse<TripCardItem>(response);
  }

  async getTrip(id: string): Promise<TripDetail> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/trips/${id}`, {
      cache: 'no-store',
    });

    return this.handleResponse<TripDetail>(response);
  }

  async getTripTimeline(id: string): Promise<TripTimelineItem[]> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/trips/${id}/timeline`, {
      cache: 'no-store',
    });

    return this.handleResponse<TripTimelineItem[]>(response);
  }

  async getTripPacking(id: string): Promise<TripPackingList> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/trips/${id}/packing`, {
      cache: 'no-store',
    });

    return this.handleResponse<TripPackingList>(response);
  }

  async getTripDocuments(id: string): Promise<TripDocument[]> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/trips/${id}/documents`, {
      cache: 'no-store',
    });

    return this.handleResponse<TripDocument[]>(response);
  }

  async updateTripStatus(
    id: string,
    payload: UpdateTripStatusPayload,
  ): Promise<TripCardItem> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/trips/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return this.handleResponse<TripCardItem>(response);
  }

  async deleteTrip(id: string): Promise<{ success: true }> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/trips/${id}`, {
      method: 'DELETE',
    });

    return this.handleResponse<{ success: true }>(response);
  }

  async getDocuments(
    filter: 'all' | DocumentStatus = 'all',
    tripId?: string,
  ): Promise<DocumentListResponse> {
    const params = new URLSearchParams();
    if (filter && filter !== 'all') {
      params.set('filter', filter);
    }
    if (tripId) {
      params.set('tripId', tripId);
    }

    const query = params.toString();
    const response = await this.fetchWithUserScope(
      `${this.baseUrl}/documents${query ? `?${query}` : ''}`,
      { cache: 'no-store' },
    );

    return this.handleResponse<DocumentListResponse>(response);
  }

  async createDocument(payload: CreateDocumentPayload): Promise<DocumentItem> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return this.handleResponse<DocumentItem>(response);
  }

  async updateDocument(
    id: string,
    payload: UpdateDocumentPayload,
  ): Promise<DocumentItem> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return this.handleResponse<DocumentItem>(response);
  }

  async deleteDocument(id: string): Promise<{ success: true }> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/documents/${id}`, {
      method: 'DELETE',
    });

    return this.handleResponse<{ success: true }>(response);
  }

  async getPackingOverview(
    category?: PackingCategory,
    tripId?: string,
  ): Promise<PackingOverviewResponse> {
    const params = new URLSearchParams();
    if (category) {
      params.set('category', category);
    }
    if (tripId) {
      params.set('tripId', tripId);
    }

    const query = params.toString();
    const response = await this.fetchWithUserScope(
      `${this.baseUrl}/packing${query ? `?${query}` : ''}`,
      { cache: 'no-store' },
    );

    return this.handleResponse<PackingOverviewResponse>(response);
  }

  async createPackingItem(
    payload: CreatePackingItemPayload,
  ): Promise<PackingOverviewResponse> {
    const response = await this.fetchWithUserScope(`${this.baseUrl}/packing/items`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return this.handleResponse<PackingOverviewResponse>(response);
  }

  async togglePackingItem(
    id: string,
    tripId?: string,
  ): Promise<PackingOverviewResponse> {
    const params = new URLSearchParams();
    if (tripId) {
      params.set('tripId', tripId);
    }

    const response = await this.fetchWithUserScope(
      `${this.baseUrl}/packing/items/${id}/toggle${params.toString() ? `?${params.toString()}` : ''}`,
      {
      method: 'PATCH',
      },
    );

    return this.handleResponse<PackingOverviewResponse>(response);
  }

  async deletePackingItem(
    id: string,
    tripId?: string,
  ): Promise<PackingOverviewResponse> {
    const params = new URLSearchParams();
    if (tripId) {
      params.set('tripId', tripId);
    }

    const response = await this.fetchWithUserScope(
      `${this.baseUrl}/packing/items/${id}${params.toString() ? `?${params.toString()}` : ''}`,
      {
      method: 'DELETE',
      },
    );

    return this.handleResponse<PackingOverviewResponse>(response);
  }
}

export const apiService = new ApiService();
