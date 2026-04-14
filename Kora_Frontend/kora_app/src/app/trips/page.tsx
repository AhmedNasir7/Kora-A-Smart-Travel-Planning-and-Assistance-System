'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { TripsTab } from '@/components/dashboard/TripsTab';
import { TripCard } from '@/components/dashboard/TripCard';
import { AddTripModal } from '@/components/dashboard/AddTripModal';
import { DashboardFooter } from '@/components/dashboard';

const trips = [
  {
    id: '1',
    destination: 'Tokyo',
    country: 'Japan',
    status: 'Upcoming' as const,
    startDate: 'Mar 15',
    endDate: 'Mar 22',
    progress: 75,
    emoji: '🗼',
  },
  {
    id: '2',
    destination: 'Barcelona',
    country: 'Spain',
    status: 'Planning' as const,
    startDate: 'Apr 5',
    endDate: 'Apr 12',
    progress: 40,
    emoji: '🏖️',
  },
  {
    id: '3',
    destination: 'New York',
    country: 'USA',
    status: 'Draft' as const,
    startDate: 'May 1',
    endDate: 'May 6',
    progress: 15,
    emoji: '🗽',
  },
  {
    id: '4',
    destination: 'Bali',
    country: 'Indonesia',
    status: 'Draft' as const,
    startDate: 'Jun 10',
    endDate: 'Jun 18',
    progress: 5,
    emoji: '🌴',
  },
  {
    id: '5',
    destination: 'Paris',
    country: 'France',
    status: 'Idea' as const,
    startDate: 'Jul 20',
    endDate: 'Jul 25',
    progress: 0,
    emoji: '🗿',
  },
];

const tabs = ['all', 'upcoming', 'planning', 'draft', 'idea'];

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTrips =
    activeTab === 'all'
      ? trips
      : trips.filter((trip) => trip.status.toLowerCase() === activeTab);

  const handleAddTrip = (data: any) => {
    console.log('New trip:', data);
    setIsModalOpen(false);
    // TODO: Add API call to save trip
  };

  return (
    <main className="min-h-screen bg-[#13151A] flex flex-col">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,123,84,0.08)] blur-3xl" />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-[rgba(255,123,84,0.05)] blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <Header variant="dashboard" />

        <div className="max-w-7xl mx-auto px-6 py-12 mt-16 flex-1">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <p className="text-sm text-[#FF7B54] font-semibold mb-2">Trips</p>
              <h1 className="text-4xl font-bold text-white mb-2">Your Journeys</h1>
              <p className="text-[#A0A5B8]">{trips.length} trips planned</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#FF7B54]/50 flex items-center gap-2 text-base"
            >
              <span className="text-xl">+</span> New Trip
            </button>
          </div>

          {/* Tabs */}
          <TripsTab tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Trips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} {...trip} />
            ))}
          </div>

          {/* Empty State */}
          {filteredTrips.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#A0A5B8] mb-4">No trips found in this category</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[#FF7B54] hover:text-[#FF9F6F] font-semibold"
              >
                Create your first trip →
              </button>
            </div>
          )}
        </div>

        <DashboardFooter />
      </div>

      {/* Add Trip Modal */}
      <AddTripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTrip}
      />
    </main>
  );
}
