import { Injectable } from '@nestjs/common';

@Injectable()
export class LandingService {
  getLandingPageData() {
    return {
      metadata: {
        title: 'Kora - Smart Travel Planning',
        description:
          'Plan every journey with clarity. Organize trips, packing lists, and travel documents in one beautiful place.',
      },
      hero: {
        badge: 'Smart Travel Assistant',
        headingPrimary: 'Travel with',
        headingAccent: 'clarity.',
        description:
          'Kora unifies your schedules, packing lists, documents, and reminders into one calm, guided experience.',
        cta: {
          label: 'Start Planning',
          href: '/signup',
        },
        nextDeparture: {
          route: 'Tokyo -> Osaka',
          startsIn: '2:30 min',
        },
      },
      trips: {
        title: 'Every journey, organized.',
        items: [
          {
            name: 'Tokyo, Japan',
            dateRange: 'MARCH 15-MARCH 22',
            progress: 75,
            tasksRemaining: 3,
            status: 'UPCOMING',
            statusColor: '#6b7ba3',
          },
          {
            name: 'Kyoto, Japan',
            dateRange: 'MARCH 15-MARCH 22',
            progress: 75,
            tasksRemaining: 3,
            status: 'COMPLETED',
            statusColor: '#4a8f6f',
          },
          {
            name: 'Lahore, Pakistan',
            dateRange: 'MARCH 15-MARCH 22',
            progress: 75,
            tasksRemaining: 3,
            status: 'DRAFT',
            statusColor: '#8b7a54',
          },
        ],
      },
      packing: {
        title: 'Never forget a thing.',
        description:
          'Organize items by category and get smart reminders before you leave.',
        categories: [
          { icon: '👔', name: 'Clothing', count: '2/4' },
          { icon: '💼', name: 'Essentials', count: '1/1' },
          { icon: '💊', name: 'Health', count: '2/4' },
          { icon: '✨', name: 'Accessories', count: '0/2' },
        ],
        featuredList: {
          title: 'Clothing',
          items: [
            { item: 'Shirts', count: '(2x3)', checked: true },
            { item: 'Jeans', count: '(2x2)', checked: true },
            { item: 'Jacket', count: '', checked: false },
            { item: 'Coat', count: '', checked: false },
          ],
        },
      },
      timeline: {
        title: 'Your journey, step by step.',
        activities: [
          { time: '6:00 AM', label: 'Depart for airport', icon: '✈️' },
          { time: '7:30 AM', label: 'Flight TK-432 -> NRT', icon: '✈️' },
          {
            time: '11:00 AM',
            label: 'Check-in at Shinjuku Hotel',
            icon: '🏨',
          },
          { time: 'Afternoon', label: 'Explore Shinjuku Gyoen', icon: '🌸' },
          { time: 'Evening', label: 'Bullet train to Kyoto', icon: '🚄' },
          { time: 'Night', label: 'Dinner at Halifasuwan', icon: '🍜' },
          { time: '10 PM', label: 'Fireworks near Uchiwa', icon: '✨' },
        ],
      },
      footer: {
        links: {
          signup: '/signup',
          signin: '/signin',
        },
      },
    };
  }
}