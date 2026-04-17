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

export interface DocumentRecord {
  id: string;
  trip_id: string | null;
  user_id: string;
  title: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}
