export type ReminderUrgency = 'low' | 'medium' | 'high';

export interface Reminder {
  id: string;
  user_id: string;
  trip_id?: string;
  title: string;
  description?: string;
  due_date: string;
  urgency: ReminderUrgency;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderSummary {
  total: number;
  urgent: number;
  pending: number;
  completed: number;
}

export interface RemindersResponse {
  items: Reminder[];
  summary: ReminderSummary;
}

export interface CreateReminderDto {
  title: string;
  description?: string;
  due_date: string;
  urgency?: ReminderUrgency;
  trip_id?: string;
}

export interface UpdateReminderDto {
  title?: string;
  description?: string;
  due_date?: string;
  urgency?: ReminderUrgency;
  trip_id?: string;
  is_completed?: boolean;
}
