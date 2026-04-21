'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { TripCard } from '@/components/dashboard/TripCard';
import { AddTripModal } from '@/components/dashboard/AddTripModal';
import { DashboardFooter } from '@/components/dashboard';
import { apiService, type TripCardItem, type TripStatus } from '@/lib/api';

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

function isValidDateInput(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trips, setTrips] = useState<TripCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mutatingTripId, setMutatingTripId] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    let isMounted = true;

    const loadTrips = async () => {
      setIsLoading(true);
      setError(null);
      setTrips([]);
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
          setTrips([]);
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

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await apiService.getTrips();
        setTrips((prev) => {
          if (prev.length > response.items.length) {
            setSyncNotice('Trips list was refreshed because one or more trips are no longer active.');
          }
          return response.items;
        });
      } catch {
        // Keep existing list if background refresh fails.
      }
    }, 60000);

    return () => clearInterval(interval);
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

  const tripStats = useMemo(() => {
    return {
      upcoming: trips.filter((t) => t.status.toLowerCase() === 'upcoming').length,
      planning: trips.filter((t) => t.status.toLowerCase() === 'planning').length,
      draft: trips.filter((t) => t.status.toLowerCase() === 'draft').length,
    };
  }, [trips]);

  const handleAddTrip = async (data: TripFormData) => {
    setModalError(null);
    try {
      if (!isValidDateInput(data.startDate) || !isValidDateInput(data.endDate)) {
        throw new Error('Trip dates must be valid YYYY-MM-DD values.');
      }

      if (data.endDate < data.startDate) {
        throw new Error('End date cannot be before start date.');
      }

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
      const errorMessage = createError instanceof Error 
        ? createError.message 
        : 'Failed to create trip. Please check the dates and try again.';
      setModalError(errorMessage);
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

        <div className="max-w-5xl mx-auto px-6 py-12 mt-16 flex-1 w-full">
          <div className="mb-12 flex items-start justify-between">
            <div>
              <p className="text-sm text-[#FF7B54] font-semibold mb-2">Trips</p>
              <h1 className="text-4xl font-bold text-white mb-3">Your Journeys</h1>
              <p className="text-[#A0A5B8]">{filteredTrips.length} trips planned</p>
              {isLoading && (
                <p className="text-xs text-[#7A7E8C] mt-2">Syncing trips...</p>
              )}
              {error && (
                <p className="text-xs text-[#FF9F6F] mt-2">
                  {error}
                </p>
              )}
              {syncNotice && (
                <p className="text-xs text-[#FFB49F] mt-2">{syncNotice}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(true);
                setModalError(null);
              }}
              className="px-6 py-2.5 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#FF7B54]/50 flex items-center gap-2 text-sm shrink-0"
            >
              <span>+</span> New Trip
            </button>
          </div>

          {/* Stats Tablets */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#FF7B54] mb-1">{tripStats.upcoming}</div>
              <div className="text-xs text-[#A0A5B8]">Upcoming</div>
            </div>
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#FFB49F] mb-1">{tripStats.planning}</div>
              <div className="text-xs text-[#A0A5B8]">Planning</div>
            </div>
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#B5BAC8] mb-1">{tripStats.draft}</div>
              <div className="text-xs text-[#A0A5B8]">Draft</div>
            </div>
          </div>

          {/* Tabs and Search */}
          <div className="flex gap-1 mb-8 items-center overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  activeTab === tab
                    ? 'bg-[#FF7B54] text-white'
                    : 'bg-transparent text-[#A0A5B8] hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-auto px-3 py-1.5 bg-[#1A1D26] border border-[#2A2D35] rounded-lg text-xs text-white placeholder-[#7A8499] focus:outline-none focus:border-[#FF7B54]/50 transition-colors shrink-0 w-32"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-[#A0A5B8]">Loading trips...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#A0A5B8] mb-4">No trips found in this category</p>
              
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          )}
        </div>

        <DashboardFooter />
      </div>

      {/* Add Trip Modal - Only render when open to avoid invisible DOM elements */}
      {isModalOpen && (
        <AddTripModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalError(null);
          }}
          onSubmit={handleAddTrip}
          error={modalError}
        />
      )}
    </main>
  );
}