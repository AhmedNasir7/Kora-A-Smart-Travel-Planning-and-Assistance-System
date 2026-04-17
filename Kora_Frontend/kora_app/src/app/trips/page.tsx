'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { TripsTab } from '@/components/dashboard/TripsTab';
import { TripCard } from '@/components/dashboard/TripCard';
import { AddTripModal } from '@/components/dashboard/AddTripModal';
import { DashboardFooter } from '@/components/dashboard';
import { apiService, type TripCardItem, type TripStatus } from '@/lib/api';

const fallbackTrips: TripCardItem[] = [
  {
    id: '1',
    destination: 'Tokyo',
    country: 'Japan',
    status: 'Upcoming',
    startDate: 'Mar 15',
    endDate: 'Mar 22',
    progress: 75,
    emoji: '🗼',
  },
  {
    id: '2',
    destination: 'Barcelona',
    country: 'Spain',
    status: 'Planning',
    startDate: 'Apr 5',
    endDate: 'Apr 12',
    progress: 40,
    emoji: '🏖️',
  },
  {
    id: '3',
    destination: 'New York',
    country: 'USA',
    status: 'Draft',
    startDate: 'May 1',
    endDate: 'May 6',
    progress: 15,
    emoji: '🗽',
  },
  {
    id: '4',
    destination: 'Bali',
    country: 'Indonesia',
    status: 'Draft',
    startDate: 'Jun 10',
    endDate: 'Jun 18',
    progress: 5,
    emoji: '🌴',
  },
  {
    id: '5',
    destination: 'Paris',
    country: 'France',
    status: 'Idea',
    startDate: 'Jul 20',
    endDate: 'Jul 25',
    progress: 0,
    emoji: '🗿',
  },
];

const tabs = ['all', 'upcoming', 'planning', 'draft', 'idea'];

type TripFormData = {
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  emoji: string;
};

function toTripStatus(status: string): TripStatus {
  const normalized = status.toLowerCase();
  if (normalized === 'upcoming') return 'Upcoming';
  if (normalized === 'planning') return 'Planning';
  if (normalized === 'idea') return 'Idea';
  return 'Draft';
}

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trips, setTrips] = useState<TripCardItem[]>(fallbackTrips);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mutatingTripId, setMutatingTripId] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    let isMounted = true;

    const loadTrips = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.getTrips();
        if (isMounted) {
          setTrips(response.items);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load trips',
          );
          setTrips(activeTab === 'all' && !deferredSearchQuery ? fallbackTrips : []);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTrips();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTrips = useMemo(() => {
    const normalizedTab = activeTab.toLowerCase();
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase();

    return trips.filter((trip) => {
      const matchesTab = normalizedTab === 'all' || trip.status.toLowerCase() === normalizedTab;
      const matchesSearch = !normalizedSearch
        ? true
        : `${trip.destination} ${trip.country} ${trip.status}`
            .toLowerCase()
            .includes(normalizedSearch);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, deferredSearchQuery, trips]);

  const handleAddTrip = async (data: TripFormData) => {
    try {
      const selectedStatus = toTripStatus(data.status);
      const createdTrip = await apiService.createTrip({
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        status: selectedStatus,
        emoji: data.emoji,
      });

      const optimisticTrip: TripCardItem = {
        ...createdTrip,
        status: selectedStatus,
        destination: data.destination,
        startDate: createdTrip.startDate,
        endDate: createdTrip.endDate,
        emoji: createdTrip.emoji ?? data.emoji,
      };

      setTrips((currentTrips) => [optimisticTrip, ...currentTrips.filter((trip) => trip.id !== createdTrip.id)]);
      setIsModalOpen(false);
      setActiveTab('all');
      setSearchQuery('');
    } catch (createError) {
      console.error('Failed to create trip:', createError);
    }
  };

  const handleQuickStatusChange = async (
    id: string,
    status: 'Planning' | 'Upcoming',
  ) => {
    try {
      setMutatingTripId(id);
      const updated = await apiService.updateTripStatus(id, { status });
      setTrips((currentTrips) =>
        currentTrips.map((trip) =>
          trip.id === id ? { ...trip, status: updated.status } : trip,
        ),
      );
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Failed to update trip status',
      );
    } finally {
      setMutatingTripId(null);
    }
  };

  const handleQuickDelete = async (id: string) => {
    const shouldDelete = window.confirm('Delete this trip?');
    if (!shouldDelete) {
      return;
    }

    try {
      setMutatingTripId(id);
      await apiService.deleteTrip(id);
      setTrips((currentTrips) => currentTrips.filter((trip) => trip.id !== id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Failed to delete trip',
      );
    } finally {
      setMutatingTripId(null);
    }
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
              <p className="text-[#A0A5B8]">{filteredTrips.length} trips planned</p>
              {isLoading && (
                <p className="text-xs text-[#7A7E8C] mt-2">Syncing trips...</p>
              )}
              {error && (
                <p className="text-xs text-[#FF9F6F] mt-2">
                  {error}. Showing local snapshot.
                </p>
              )}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#FF7B54]/50 flex items-center gap-2 text-base"
            >
              <span className="text-xl">+</span> New Trip
            </button>
          </div>

          {/* Tabs */}
          <TripsTab
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Trips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                {...trip}
                onStatusChange={handleQuickStatusChange}
                onDelete={handleQuickDelete}
                isMutating={mutatingTripId === trip.id}
              />
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
