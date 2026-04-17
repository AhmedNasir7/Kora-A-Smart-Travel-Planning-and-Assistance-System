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

export interface TripTimelineItem {
  id: string;
  time: string;
  title: string;
  icon: string;
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

export interface TripPackingCategory {
  icon: string;
  name: string;
  count: string;
}

export interface TripPackingList {
  title: string;
  categories: TripPackingCategory[];
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

export interface TripApiResponse {
  items: TripCardItem[];
  total: number;
  tabs: Array<'all' | 'upcoming' | 'planning' | 'draft' | 'idea'>;
}

export interface TripRecord {
  id: string;
  title?: string;
  user_id?: string;
  destination: string;
  country?: string;
  status: TripStatus | string;
  start_date: string;
  end_date: string;
  progress?: number;
  emoji?: string | null;
  description?: string | null;
  tasks_remaining?: number;
  cover_image?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTripRecordPayload {
  title: string;
  user_id: string;
  destination: string;
  status?: string;
  start_date: string;
  end_date: string;
  description: string;
  cover_image?: string | null;
}
