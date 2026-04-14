'use client';

import { useAuthStore } from '@/stores/authStore';
import { Header } from '@/components/Header';
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

  const upcomingEvents = [
    {
      id: '1',
      date: 'Today',
      time: '6:00 PM',
      title: 'Check-in opens',
      code: 'TK 432',
      color: 'green' as const,
    },
    {
      id: '2',
      date: 'Tomorrow',
      time: '8:00 AM',
      title: 'Pack charger & adapter',
      color: 'orange' as const,
    },
    {
      id: '3',
      date: 'Mar 15',
      time: '6:00 AM',
      title: 'Depart for airport',
      color: 'blue' as const,
    },
    {
      id: '4',
      date: 'Mar 15',
      time: '2:00 PM',
      title: 'Hotel check-in',
      code: 'Shinjuku',
      color: 'orange' as const,
    },
  ];

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
            <p className="text-xs text-[#FF7B54] font-bold tracking-widest uppercase mb-3">Welcome back, {firstName}</p>
            <h1 className="text-5xl font-bold text-white mb-3">Dashboard</h1>
            <p className="text-[#A0A5B8] text-sm">Your travel overview at a glance.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard label="Upcoming Trips" value="3" />
            <StatsCard label="Items to Pack" value="8" />
            <StatsCard label="Documents" value="3/5" />
            <StatsCard label="Active Reminders" value="4" />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Left Column - Upcoming Section */}
            <div className="lg:col-span-2 h-full">
              <UpcomingSection events={upcomingEvents} />
            </div>

            {/* Right Column - Quick Actions & Active Trip */}
            <div className="space-y-8 h-full flex flex-col">
              <QuickActions />
              <ActiveTrip
                location="Tokyo"
                country="Japan"
                startDate="MARCH 11"
                endDate="MARCH 22"
                progress={78}
                label="ITINERARY"
              />
            </div>
          </div>
        </div>

        <DashboardFooter />
      </div>
    </main>
  );
}
