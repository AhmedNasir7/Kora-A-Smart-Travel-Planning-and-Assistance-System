'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';

interface TripData {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'upcoming' | 'planning' | 'draft' | 'idea' | 'completed';
  emoji: string;
}

const statusColors: Record<string, string> = {
  upcoming: '#6b7ba3',
  planning: '#FF7B54',
  draft: '#8b7a54',
  idea: '#5a6b8a',
  completed: '#4a8f6f',
};

export function TripsSection() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getTrips();
        if (response.items) {
          setTrips(
            response.items.slice(0, 3).map(trip => ({
              id: trip.id,
              destination: trip.destination,
              country: trip.country,
              startDate: trip.startDate,
              endDate: trip.endDate,
              progress: trip.progress || 0,
              status: (trip.status || 'draft').toLowerCase() as any,
              emoji: trip.emoji || '✈️',
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load trips:', error);
        setTrips([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrips();
  }, []);

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="space-y-4 mb-16">
          <p className="text-[12px] font-bold tracking-wider text-[#FF7B54] uppercase">Your Trips</p>
          <h2 className="text-[48px] font-bold leading-tight text-white">
            Every journey,
            <span className="text-[#FF7B54]"> organized.</span>
          </h2>
        </div>

        {/* Trip Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-[#a9a59b]">Loading trips...</p>
            </div>
          ) : trips.length > 0 ? (
            trips.map((trip) => (
              <div key={trip.id} className="group bg-[rgba(23,28,43,0.5)] backdrop-blur border border-[#2a3344] rounded-2xl p-6 hover:border-[#FF7B54]/50 transition-all hover:shadow-[0_0_24px_rgba(255,123,84,0.15)]">
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <span 
                      className="text-[10px] font-bold tracking-widest px-3 py-1 rounded-md border"
                      style={{
                        color: statusColors[trip.status],
                        borderColor: statusColors[trip.status],
                        backgroundColor: 'rgba(0,0,0,0.2)'
                      }}
                    >
                      {trip.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Trip Name */}
                  <h3 className="text-[18px] font-semibold text-white text-center">{trip.emoji} {trip.destination}, {trip.country}</h3>

                  {/* Date */}
                  <div className="flex items-center justify-center gap-2 text-[12px] text-[#a9a59b]">
                    <span>📅</span>
                    <span>{trip.startDate} - {trip.endDate}</span>
                  </div>
                  
                  {/* Progress Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a9a59b]">Preparation</span>
                      <span className="text-[11px] font-semibold text-[#a9a59b]">{trip.progress}%</span>
                    </div>
                    <div className="h-2 bg-[#0f1323] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-[#FF7B54] to-[#ff8a5b]"
                        style={{ width: `${trip.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* View Trip */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[12px] text-[#a9a59b]">View trip</span>
                    <svg className="w-5 h-5 text-[#FF7B54] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-[#a9a59b]">No trips yet. Create your first trip to get started!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
