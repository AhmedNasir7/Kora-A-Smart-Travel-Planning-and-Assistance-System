'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';
import { AddEventModal, type EventFormData } from '@/components/dashboard/AddEventModal';
import { EditTripModal, type EditTripFormData } from '@/components/dashboard/EditTripModal';
import { ConfirmationDialog } from '@/components/dashboard/ConfirmationDialog';
import { apiService, type TripDetail, type TripStatus, type TimelineEvent } from '@/lib/api';

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isEventLoading, setIsEventLoading] = useState(false);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [isTripLoading, setIsTripLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'trip' | 'event' | null;
    itemId?: string;
  }>({ isOpen: false, type: null });

  useEffect(() => {
    let isMounted = true;

    const loadTrip = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [detailResponse, timelineResponse] = await Promise.all([
          apiService.getTrip(id),
          apiService.getTripTimeline(id),
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
  }, [id]);

  const handleStatusChange = async (status: TripStatus) => {
    if (!trip || isMutating) {
      return;
    }

    try {
      setIsMutating(true);
      const updated = await apiService.updateTripStatus(id, { status });
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

  const handleDeleteTrip = () => {
    setDeleteConfirmation({ isOpen: true, type: 'trip' });
  };

  const handleConfirmDeleteTrip = async () => {
    if (isMutating) {
      return;
    }

    try {
      setIsMutating(true);
      await apiService.deleteTrip(id);
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

  const handleEventSubmit = async (formData: EventFormData) => {
    try {
      setIsEventLoading(true);
      
      if (editingEventId) {
        // Update existing event
        const updatedEvent = await apiService.updateTimelineEvent(id, editingEventId, formData);
        setTimeline((prev) =>
          prev.map((event) => (event.id === editingEventId ? updatedEvent : event))
        );
      } else {
        // Add new event
        const newEvent = await apiService.addTimelineEvent(id, formData);
        setTimeline((prev) => [...prev, newEvent].sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ));
      }
      
      setEditingEventId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
      throw err;
    } finally {
      setIsEventLoading(false);
    }
  };

  const handleEditEvent = (eventId: string) => {
    const eventToEdit = timeline.find((e) => e.id === eventId);
    if (eventToEdit) {
      setEditingEventId(eventId);
      setIsEventModalOpen(true);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setDeleteConfirmation({ isOpen: true, type: 'event', itemId: eventId });
  };

  const handleConfirmDeleteEvent = async () => {
    if (!deleteConfirmation.itemId || isMutating) {
      return;
    }

    const eventId = deleteConfirmation.itemId;

    try {
      setIsMutating(true);
      await apiService.deleteTimelineEvent(id, eventId);
      setTimeline((prev) => prev.filter((event) => event.id !== eventId));
      setDeleteConfirmation({ isOpen: false, type: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setIsMutating(false);
    }
  };

  const handleTripUpdate = async (formData: EditTripFormData) => {
    try {
      setIsTripLoading(true);
      // Note: Update trip API call would be needed in apiService
      // For now, update local state
      setTrip((current) =>
        current
          ? {
              ...current,
              destination: formData.destination,
              country: formData.country,
              startDate: formData.startDate,
              endDate: formData.endDate,
              description: formData.description || '',
              emoji: formData.emoji,
              status: formData.status || current.status,
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trip');
      throw err;
    } finally {
      setIsTripLoading(false);
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
          {/* Back Button */}
          <button
            onClick={() => (window.location.href = '/trips')}
            className="mb-8 text-[#FF7B54] hover:text-[#FF9F6F] font-semibold flex items-center gap-2 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Trips
          </button>

          {/* Trip Header with Emoji */}
          <div className="mb-12">
            <p className="text-sm text-[#FF7B54] font-semibold mb-2">Trips/Timeline</p>
            <div className="flex items-center gap-4 mb-4 group">
              <h1 className="text-5xl font-bold text-white">{trip?.destination}, {trip?.country}</h1>
              <div className="text-5xl">{trip?.emoji || '✈️'}</div>
              <button
                onClick={() => setIsEditTripModalOpen(true)}
                disabled={isLoading || isTripLoading}
                className="hidden group-hover:flex ml-auto p-2 text-[#A0A5B8] hover:text-[#FF7B54] hover:bg-[#2A2D35] rounded-lg transition-all duration-200 disabled:opacity-50"
                title="Edit trip"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <p className="text-lg text-[#A0A5B8] mb-4">
              {trip?.startDate} - {trip?.endDate}
            </p>
            {isLoading && <p className="text-xs text-[#7A7E8C]">Loading trip details...</p>}
            {error && <p className="text-xs text-[#FF9F6F] mt-2">{error}</p>}
          </div>

          {/* Timeline Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Timeline</h2>
              <button
                onClick={() => {
                  setEditingEventId(null);
                  setIsEventModalOpen(true);
                }}
                className="px-4 py-2 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white text-sm font-semibold rounded-full transition-all duration-200"
              >
                + Add Event
              </button>
            </div>
            
            {isLoading ? (
              <p className="text-[#A0A5B8] text-center py-8">Loading timeline...</p>
            ) : timeline.length === 0 ? (
              <div className="text-center py-12 bg-[#1A1D26] border border-[#2A2D35] rounded-2xl">
                <p className="text-[#A0A5B8] mb-4">No events planned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div
                    key={event.id}
                    className="group bg-[#1A1D26] border border-[#2A2D35] rounded-2xl p-6 hover:border-[#FF7B54] transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Timeline Dot and Line */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-4 h-4 rounded-full bg-[#FF7B54] border-4 border-[#13151A]" />
                          {index < timeline.length - 1 && (
                            <div className="w-0.5 h-12 bg-[#2A2D35]" />
                          )}
                        </div>

                        {/* Event Content */}
                        <div className="flex-1 pt-1">
                          <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-[#A0A5B8] mb-3">{event.description}</p>
                          )}
                          <p className="text-xs text-[#7A7E8C]">
                            {new Date(event.start_time).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Edit and Delete buttons - visible on hover */}
                      <div className="hidden group-hover:flex items-center gap-2 transition-all duration-200">
                          <button
                            onClick={() => handleEditEvent(event.id)}
                            disabled={isMutating || isEventLoading}
                            className="p-2 text-[#A0A5B8] hover:text-[#FF7B54] hover:bg-[#2A2D35] rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Edit event"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={isMutating || isEventLoading}
                            className="p-2 text-[#A0A5B8] hover:text-red-400 hover:bg-[#2A2D35] rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Delete event"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Event Modal */}
        <AddEventModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEventId(null);
          }}
          onSubmit={handleEventSubmit}
          isLoading={isEventLoading}
          initialData={
            editingEventId
              ? timeline.find((e) => e.id === editingEventId)
              : undefined
          }
          isEditMode={!!editingEventId}
        />

        {/* Edit Trip Modal */}
        <EditTripModal
          isOpen={isEditTripModalOpen}
          onClose={() => setIsEditTripModalOpen(false)}
          onSubmit={handleTripUpdate}
          isLoading={isTripLoading}
          initialData={
            trip
              ? ({
                  destination: trip.destination,
                  country: trip.country,
                  startDate: trip.startDate,
                  endDate: trip.endDate,
                  description: trip.description || '',
                  emoji: trip.emoji || '✈️',
                  status: trip.status as TripStatus,
                } as EditTripFormData)
              : undefined
          }
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={deleteConfirmation.isOpen}
          title={deleteConfirmation.type === 'trip' ? 'Delete Trip' : 'Delete Event'}
          message={
            deleteConfirmation.type === 'trip'
              ? 'Are you sure you want to delete this trip and all its associated data? This action cannot be undone.'
              : 'Are you sure you want to delete this timeline event? This action cannot be undone.'
          }
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous
          isLoading={isMutating}
          onConfirm={
            deleteConfirmation.type === 'trip'
              ? handleConfirmDeleteTrip
              : handleConfirmDeleteEvent
          }
          onCancel={() =>
            setDeleteConfirmation({ isOpen: false, type: null })
          }
        />

        <DashboardFooter />
      </div>
    </main>
  );
}
