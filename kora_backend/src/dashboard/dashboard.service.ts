import { Injectable } from '@nestjs/common';
import {
  DashboardActiveTrip,
  DashboardQuickAction,
  DashboardResponse,
  DashboardStat,
  DashboardUpcomingEvent,
} from './dashboard.types';
import { TripsService } from '../trips/trips.service';
import { DocumentsService } from '../documents/documents.service';
import { RemindersService } from '../reminders/reminders.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly tripsService: TripsService,
    private readonly documentsService: DocumentsService,
    private readonly remindersService: RemindersService,
  ) {}

  async getDashboardData(
    firstName = 'User',
    requestUserId?: string,
  ): Promise<DashboardResponse> {
    try {
      const [tripsData, documentsData, remindersData] = await Promise.all([
        this.tripsService.listTrips(undefined, undefined, requestUserId),
        requestUserId
          ? this.documentsService.listDocuments('all', undefined, requestUserId)
          : Promise.resolve({ items: [], total: 0, filter: 'all' }),
        requestUserId
          ? this.remindersService.getReminders(requestUserId)
          : Promise.resolve({ items: [], summary: { total: 0, urgent: 0, pending: 0, completed: 0 } }),
      ]);

      return {
        welcomeMessage: `Welcome back, ${firstName}`,
        stats: this.buildStats(tripsData, documentsData, remindersData),
        upcomingEvents: await this.buildUpcomingEvents(tripsData, remindersData, requestUserId),
        quickActions: this.getQuickActions(),
        activeTrip: this.buildActiveTrip(tripsData),
      };
    } catch (error) {
      // Fallback to hardcoded data if fetching fails
      return this.getFallbackData(firstName);
    }
  }

  private buildStats(tripsData: any, documentsData: any, remindersData: any): DashboardStat[] {
    const upcomingTripsCount = tripsData.items
      ? tripsData.items.filter((t: any) => t.status?.toLowerCase() === 'upcoming').length
      : 0;

    return [
      { label: 'Upcoming Trips', value: upcomingTripsCount || 0 },
      { label: 'Items to Pack', value: 8 }, // TODO: Fetch from actual packing data
      {
        label: 'Documents',
        value: `${documentsData.total || 0}/5`,
      },
      {
        label: 'Active Reminders',
        value: remindersData.summary?.pending || 0,
      },
    ];
  }

  private async buildUpcomingEvents(
    tripsData: any,
    remindersData: any,
    requestUserId?: string,
  ): Promise<DashboardUpcomingEvent[]> {
    const events: DashboardUpcomingEvent[] = [];

    // Add reminders as events
    if (remindersData.items && Array.isArray(remindersData.items)) {
      const upcomingReminders = remindersData.items
        .filter((r: any) => !r.is_completed)
        .slice(0, 2)
        .map((r: any) => ({
          id: r.id,
          date: new Date(r.due_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          time: new Date(r.due_date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          title: r.title,
          color: r.urgency === 'high' ? ('orange' as const) : ('blue' as const),
        }));

      events.push(...upcomingReminders);
    }

    // Add timeline events from the active trip
    if (tripsData.items && Array.isArray(tripsData.items) && tripsData.items.length > 0) {
      const activeTrip = tripsData.items[0];
      try {
        const timelineData = await this.tripsService.getTimeline(activeTrip.id, requestUserId);
        const timelineEvents = timelineData
          .slice(0, 2)
          .map((e: any) => ({
            id: e.id,
            date: e.date || 'Upcoming',
            time: e.time || '—',
            title: e.title,
            color: 'green' as const,
          }));

        events.push(...timelineEvents);
      } catch (error) {
        // Ignore if timeline fetch fails
      }
    }

    // Return max 4 events
    return events.slice(0, 4);
  }

  private buildActiveTrip(tripsData: any): DashboardActiveTrip {
    if (tripsData.items && Array.isArray(tripsData.items) && tripsData.items.length > 0) {
      const trip = tripsData.items[0];
      return {
        id: trip.id,
        location: trip.destination || 'TBD',
        country: trip.country || '',
        startDate: trip.startDate
          ? new Date(trip.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          : 'TBD',
        endDate: trip.endDate
          ? new Date(trip.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          : 'TBD',
        progress: trip.progress || 0,
        label: 'ITINERARY',
      };
    }

    // Fallback
    return {
      location: 'No Active Trip',
      country: '',
      startDate: '—',
      endDate: '—',
      progress: 0,
      label: 'NONE',
    };
  }

  private getQuickActions(): DashboardQuickAction[] {
    return [
      { label: 'Add Trips', href: '/trips', icon: 'trips' },
      { label: 'Packing', href: '/packing', icon: 'packing' },
      { label: 'Documents', href: '/documents', icon: 'documents' },
      { label: 'Reminders', href: '/reminders', icon: 'reminders' },
    ];
  }

  private getFallbackData(firstName: string): DashboardResponse {
    return {
      welcomeMessage: `Welcome back, ${firstName}`,
      stats: [
        { label: 'Upcoming Trips', value: 0 },
        { label: 'Items to Pack', value: 0 },
        { label: 'Documents', value: '0/5' },
        { label: 'Active Reminders', value: 0 },
      ],
      upcomingEvents: [],
      quickActions: this.getQuickActions(),
      activeTrip: {
        location: 'No Active Trip',
        country: '',
        startDate: '—',
        endDate: '—',
        progress: 0,
        label: 'NONE',
      },
    };
  }
}
