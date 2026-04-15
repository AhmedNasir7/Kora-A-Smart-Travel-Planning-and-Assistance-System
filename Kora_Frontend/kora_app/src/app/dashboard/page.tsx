'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Header } from '@/components/Header';
import { apiService, DashboardResponse } from '@/lib/api';
import {
  StatsCard,
  UpcomingSection,
  QuickActions,
  ActiveTrip,
  DashboardFooter,
} from '@/components/dashboard';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.fullName?.split(' ')[0] || 'User';
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await apiService.getDashboard(
          firstName === 'User' ? undefined : firstName,
        );
        if (isMounted) {
          setDashboardData(data);
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(
            error instanceof Error
              ? error.message
              : 'Failed to load dashboard data',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [firstName]);

  const fallbackData = useMemo<DashboardResponse>(
    () => ({
      welcomeMessage: `Welcome back, ${firstName}`,
      stats: [
        { label: 'Upcoming Trips', value: 3 },
        { label: 'Items to Pack', value: 8 },
        { label: 'Documents', value: '3/5' },
        { label: 'Active Reminders', value: 4 },
      ],
      upcomingEvents: [
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
      ],
      quickActions: [
        { label: 'Add Trips', href: '/trips', icon: 'trips' },
        { label: 'Packing', href: '/packing', icon: 'packing' },
        { label: 'Documents', href: '/documents', icon: 'documents' },
        { label: 'Reminders', href: '/reminders', icon: 'reminders' },
      ],
      activeTrip: {
        location: 'Tokyo',
        country: 'Japan',
        startDate: 'MARCH 11',
        endDate: 'MARCH 22',
        progress: 78,
        label: 'ITINERARY',
      },
    }),
    [firstName],
  );

  const data = dashboardData ?? fallbackData;

  return (
    <main className="min-h-screen bg-[#13151A]">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,123,84,0.08)] blur-3xl" />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-[rgba(255,123,84,0.05)] blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header variant="dashboard" />

        <div className="max-w-7xl mx-auto px-6 py-12 mt-20">
          {/* Welcome Section */}
          <div className="mb-14">
            <p className="text-xs text-[#FF7B54] font-bold tracking-widest uppercase mb-3">
              {data.welcomeMessage}
            </p>
            <h1 className="text-5xl font-bold text-white mb-3">Dashboard</h1>
            <p className="text-[#A0A5B8] text-sm">Your travel overview at a glance.</p>
            {isLoading && (
              <p className="text-xs text-[#7A7E8C] mt-2">Syncing dashboard data...</p>
            )}
            {fetchError && (
              <p className="text-xs text-[#FF9F6F] mt-2">
                {fetchError}. Showing saved dashboard snapshot.
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {data.stats.map((stat) => (
              <StatsCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                subtext={stat.subtext}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Left Column - Upcoming Section */}
            <div className="lg:col-span-2 h-full">
              <UpcomingSection events={data.upcomingEvents} />
            </div>

            {/* Right Column - Quick Actions & Active Trip */}
            <div className="space-y-8 h-full flex flex-col">
              <QuickActions actions={data.quickActions} />
              <ActiveTrip
                location={data.activeTrip.location}
                country={data.activeTrip.country}
                startDate={data.activeTrip.startDate}
                endDate={data.activeTrip.endDate}
                progress={data.activeTrip.progress}
                label={data.activeTrip.label}
              />
            </div>
          </div>
        </div>

        <DashboardFooter />
      </div>
    </main>
  );
}
