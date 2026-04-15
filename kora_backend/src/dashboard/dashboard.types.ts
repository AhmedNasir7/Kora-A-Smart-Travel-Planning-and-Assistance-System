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
