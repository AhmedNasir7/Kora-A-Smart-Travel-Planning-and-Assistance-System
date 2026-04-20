'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';
import { apiService, type TripDetail, type TimelineEvent, type CreateEventPayload, type EventType } from '@/lib/api';

const EVENT_ICONS: Record<EventType, string> = {
  transport: '✈️',
  stay: '🏨',
  activity: '📸',
};

const EVENT_COLORS: Record<EventType, string> = {
  transport: 'text-[#FF7B54]',
  stay: 'text-[#7C3AED]',
  activity: 'text-[#10B981]',
};

export default function TripItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'transport' as EventType,
    start_time: '',
    end_time: '',
    location: '',
  });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [tripData, timelineData] = await Promise.all([
          apiService.getTrip(id),
          apiService.getTripTimeline(id),
        ]);
        if (isMounted) {
          setTrip(tripData);
          setEvents(timelineData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load itinerary');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.start_time) {
      setError('Title and start time are required');
      return;
    }

    try {
      setIsMutating(true);
      const newEvent = await apiService.addTimelineEvent(id, {
        title: formData.title,
        description: formData.description || undefined,
        event_type: formData.event_type,
        icon: EVENT_ICONS[formData.event_type],
        start_time: formData.start_time,
        end_time: formData.end_time || undefined,
        location: formData.location || undefined,
      });
      setEvents((prev) => [...prev, newEvent].sort((a, b) => a.sort_order - b.sort_order));
      setFormData({
        title: '',
        description: '',
        event_type: 'transport',
        start_time: '',
        end_time: '',
        location: '',
      });
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add event');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await apiService.deleteTimelineEvent(id, eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  return (
    <main className="min-h-screen bg-[#13151A] flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,123,84,0.08)] blur-3xl" />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-[rgba(255,123,84,0.05)] blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <Header variant="dashboard" />

        <div className="max-w-4xl mx-auto px-6 py-12 mt-20 flex-1 w-full">
          <Link href="/trips" className="mb-6 text-[#A0A5B8] hover:text-white flex items-center gap-2 transition-colors">
            ← Back to Trips
          </Link>

          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-[#A0A5B8]">Loading itinerary...</p>
            </div>
          ) : !trip ? (
            <div className="text-center py-20">
              <p className="text-[#FF9F6F] mb-4">Trip not found</p>
            </div>
          ) : (
            <>
              <div className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-2">{trip.destination}, {trip.country}</h1>
                <p className="text-[#A0A5B8] mb-4">
                  {trip.startDate} - {trip.endDate}
                </p>
                {error && <p className="text-xs text-[#FF9F6F]">{error}</p>}
              </div>

              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Your itinerary</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-full transition-colors flex items-center gap-2"
                >
                  <span>+</span> Add Event
                </button>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#A0A5B8] mb-4">No events yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex gap-4 p-4 bg-[#1A1D26]/50 border border-[#2A2D35] rounded-lg hover:border-[#FF7B54]/50 transition-colors"
                    >
                      <div className={`text-2xl shrink-0 ${EVENT_COLORS[event.event_type]}`}>
                        {EVENT_ICONS[event.event_type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-[#A0A5B8] mt-1">{event.description}</p>
                        )}
                        {event.location && (
                          <p className="text-xs text-[#7A8499] mt-1">📍 {event.location}</p>
                        )}
                        <p className="text-xs text-[#5D677D] mt-2">
                          {new Date(event.start_time).toLocaleString()}
                          {event.end_time && ` - ${new Date(event.end_time).toLocaleTimeString()}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-[#A0A5B8] hover:text-[#FF7B54] transition-colors shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <DashboardFooter />
      </div>

      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#121A29] border border-[#2A2F3D] rounded-2xl p-8 max-w-xl w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Add Event</h2>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Flight to Tokyo"
                    className="w-full px-4 py-2 bg-[#13151A] border border-[#FF7B54] rounded-lg text-white placeholder-[#7A7E8C] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Type</label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
                      className="w-full px-4 py-2 bg-[#222C3D] border border-[#222C3D] rounded-lg text-white focus:outline-none cursor-pointer"
                    >
                      <option value="transport">Transport</option>
                      <option value="stay">Stay</option>
                      <option value="activity">Activity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Start Time</label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-4 py-2 bg-[#13151A] border border-[#222C3D] rounded-lg text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Haneda Airport"
                    className="w-full px-4 py-2 bg-[#13151A] border border-[#222C3D] rounded-lg text-white placeholder-[#7A7E8C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Description (optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add notes..."
                    className="w-full px-4 py-2 bg-[#13151A] border border-[#222C3D] rounded-lg text-white placeholder-[#7A7E8C] focus:outline-none resize-none h-20"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isMutating}
                    className="flex-1 px-4 py-2 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
