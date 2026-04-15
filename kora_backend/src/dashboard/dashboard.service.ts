import { Injectable } from '@nestjs/common';
import {
  DashboardActiveTrip,
  DashboardQuickAction,
  DashboardResponse,
  DashboardStat,
  DashboardUpcomingEvent,
} from './dashboard.types';

@Injectable()
export class DashboardService {
  getDashboardData(firstName = 'User'): DashboardResponse {
    return {
      welcomeMessage: `Welcome back, ${firstName}`,
      stats: this.getStats(),
      upcomingEvents: this.getUpcomingEvents(),
      quickActions: this.getQuickActions(),
      activeTrip: this.getActiveTrip(),
    };
  }

  getStats(): DashboardStat[] {
    return [
      { label: 'Upcoming Trips', value: 3 },
      { label: 'Items to Pack', value: 8 },
      { label: 'Documents', value: '3/5' },
      { label: 'Active Reminders', value: 4 },
    ];
  }

  getUpcomingEvents(): DashboardUpcomingEvent[] {
    return [
      {
        id: '1',
        date: 'Today',
        time: '6:00 PM',
        title: 'Check-in opens',
        code: 'TK 432',
        color: 'green',
      },
      {
        id: '2',
        date: 'Tomorrow',
        time: '8:00 AM',
        title: 'Pack charger & adapter',
        color: 'orange',
      },
      {
        id: '3',
        date: 'Mar 15',
        time: '6:00 AM',
        title: 'Depart for airport',
        color: 'blue',
      },
      {
        id: '4',
        date: 'Mar 15',
        time: '2:00 PM',
        title: 'Hotel check-in',
        code: 'Shinjuku',
        color: 'orange',
      },
    ];
  }

  getQuickActions(): DashboardQuickAction[] {
    return [
      { label: 'Add Trips', href: '/trips', icon: 'trips' },
      { label: 'Packing', href: '/packing', icon: 'packing' },
      { label: 'Documents', href: '/documents', icon: 'documents' },
      { label: 'Reminders', href: '/reminders', icon: 'reminders' },
    ];
  }

  getActiveTrip(): DashboardActiveTrip {
    return {
      location: 'Tokyo',
      country: 'Japan',
      startDate: 'MARCH 11',
      endDate: 'MARCH 22',
      progress: 78,
      label: 'ITINERARY',
    };
  }
}
