'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';
import { apiService, type TripDetail, type TripStatus, type TripTimelineItem } from '@/lib/api';

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [timeline, setTimeline] = useState<TripTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTrip = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [detailResponse, timelineResponse] = await Promise.all([
          apiService.getTrip(params.id),
          apiService.getTripTimeline(params.id),
        ]);

        if (isMounted) {
          setTrip(detailResponse);
          if (timelineResponse.length) {
            setTimeline(timelineResponse);
          }
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load trip details',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTrip();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleStatusChange = async (status: TripStatus) => {
    if (!trip || isMutating) {
      return;
    }

    try {
      setIsMutating(true);
      const updated = await apiService.updateTripStatus(params.id, { status });
      setTrip((current) =>
        current
          ? {
              ...current,
              status: updated.status,
            }
          : current,
      );
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : 'Failed to update trip status',
      );
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (isMutating) {
      return;
    }

    const shouldDelete = window.confirm('Delete this trip permanently?');
    if (!shouldDelete) {
      return;
    }

    try {
      setIsMutating(true);
      await apiService.deleteTrip(params.id);
      window.location.href = '/trips';
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete trip',
      );
      setIsMutating(false);
    }
  };

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

        <div className="max-w-4xl mx-auto px-6 py-12 mt-20">
          {/* Back Button */}
          <a
            href="/trips"
            className="mb-8 text-[#A0A5B8] hover:text-white flex items-center gap-2 transition-colors"
          >
            ← Back to Trips
          </a>

          {/* Trip Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {trip?.destination || 'Trip Details'}
                </h1>
                <p className="text-lg text-[#A0A5B8]">{trip?.country || 'Loading trip...'}</p>
              </div>
              <span className="px-4 py-2 bg-[#FF7B54] text-white text-sm font-semibold rounded-lg">
                {trip?.status || 'Loading'}
              </span>
            </div>
            {isLoading && (
              <p className="text-xs text-[#7A7E8C]">Syncing trip details...</p>
            )}
            {error && (
              <p className="text-xs text-[#FF9F6F] mt-2">
                {error}. Showing local snapshot.
              </p>
            )}
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Info Card */}
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Trip Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#A0A5B8] mb-1">Duration</p>
                  <p className="text-white">
                    {trip?.startDate || '—'} - {trip?.endDate || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#A0A5B8] mb-1">Description</p>
                  <p className="text-white">{trip?.description || 'Loading trip details...'}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#A0A5B8]">Preparation Progress</p>
                    <p className="text-sm font-semibold text-[#FF7B54]">
                      {trip?.progress ?? 0}%
                    </p>
                  </div>
                  <div className="w-full bg-[#2A2D35] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F] h-full rounded-full"
                      style={{ width: `${trip?.progress ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Trip Tools</h2>

              <div className="space-y-3">
                <Link
                  href={`/packing?tripId=${params.id}`}
                  className="block w-full px-4 py-3 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white text-center rounded-lg transition-colors"
                >
                  Packing List
                </Link>
                <Link
                  href={`/documents?tripId=${params.id}`}
                  className="block w-full px-4 py-3 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white text-center rounded-lg transition-colors"
                >
                  Documents
                </Link>
                <Link
                  href={`/trips/${params.id}/itinerary`}
                  className="block w-full px-4 py-3 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white text-center rounded-lg transition-colors"
                >
                  Itinerary
                </Link>
                <button
                  onClick={() => handleStatusChange('Planning')}
                  disabled={isMutating}
                  className="w-full px-4 py-3 bg-[#2A2D35] hover:bg-[#3A3F4A] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
                >
                  Move to Planning
                </button>
                <button
                  onClick={() => handleStatusChange('Upcoming')}
                  disabled={isMutating}
                  className="w-full px-4 py-3 bg-[#FF7B54] hover:bg-[#FF9F6F] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
                >
                  Mark as Upcoming
                </button>
                <button
                  onClick={handleDeleteTrip}
                  disabled={isMutating}
                  className="w-full px-4 py-3 bg-[#3A1F24] hover:bg-[#4A2A31] disabled:opacity-60 text-[#FF9F6F] font-semibold rounded-lg transition-colors"
                >
                  Delete Trip
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Timeline</h2>
            <div className="space-y-4">
              {timeline.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#2A2D35] flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm text-[#A0A5B8]">{item.time}</p>
                    <p className="text-white">{item.title}</p>
                  </div>
                </div>
              ))}
              {!isLoading && timeline.length === 0 && (
                <p className="text-sm text-[#A0A5B8]">No timeline items available for this trip.</p>
              )}
            </div>
          </div>
        </div>

        <DashboardFooter />
      </div>
    </main>
  );
}
