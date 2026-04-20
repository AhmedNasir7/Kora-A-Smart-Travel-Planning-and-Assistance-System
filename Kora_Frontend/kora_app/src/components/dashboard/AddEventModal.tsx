'use client';

import { useState } from 'react';
import type { EventType } from '@/lib/api';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: EventFormData;
  isEditMode?: boolean;
}

export interface EventFormData {
  title: string;
  description?: string;
  event_type: EventType;
  icon: string;
  start_time: string;
  end_time?: string;
  location?: string;
}

const EVENT_TYPES: { value: EventType; label: string; emoji: string }[] = [
  { value: 'transport', label: 'Transport', emoji: '✈️' },
  { value: 'stay', label: 'Accommodation', emoji: '🏨' },
  { value: 'activity', label: 'Activity', emoji: '🎭' },
];

const EVENT_ICONS = [
  { emoji: '✈️', label: 'Airplane' },
  { emoji: '🚗', label: 'Car' },
  { emoji: '🚂', label: 'Train' },
  { emoji: '🚢', label: 'Ship' },
  { emoji: '🏨', label: 'Hotel' },
  { emoji: '🏩', label: 'Hostel' },
  { emoji: '🏠', label: 'Airbnb' },
  { emoji: '🎭', label: 'Show' },
  { emoji: '🏛️', label: 'Museum' },
  { emoji: '🍽️', label: 'Restaurant' },
  { emoji: '🎪', label: 'Event' },
  { emoji: '🏔️', label: 'Hiking' },
  { emoji: '🏖️', label: 'Beach' },
  { emoji: '🗼', label: 'Landmark' },
  { emoji: '📸', label: 'Photo' },
];

export function AddEventModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  isEditMode = false,
}: AddEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>(
    initialData || {
      title: '',
      description: '',
      event_type: 'activity',
      icon: '🎭',
      start_time: '',
      end_time: '',
      location: '',
    }
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Event title is required');
      return;
    }

    if (!formData.start_time) {
      setError('Start time is required');
      return;
    }

    if (formData.end_time && formData.end_time < formData.start_time) {
      setError('End time cannot be before start time');
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    }
  };

  const handleClose = () => {
    setFormData(
      initialData || {
        title: '',
        description: '',
        event_type: 'activity',
        icon: '🎭',
        start_time: '',
        end_time: '',
        location: '',
      }
    );
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-3xl p-8 max-w-md w-full pointer-events-auto shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditMode ? 'Edit Event' : 'Add Event'}
          </h2>
          <button
            onClick={handleClose}
            className="text-[#A0A5B8] hover:text-white transition-colors duration-200 p-2 hover:bg-[#2A2D35] rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/15 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Flight to Tokyo"
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#5D677D] focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Event Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      event_type: type.value,
                      icon: type.emoji,
                    })
                  }
                  className={`py-2.5 px-3 rounded-lg border transition-all duration-200 font-semibold text-sm ${
                    formData.event_type === type.value
                      ? 'bg-[#FF7B54]/20 border-[#FF7B54] text-[#FF7B54]'
                      : 'bg-[#2A2D35]/50 border-[#2A2D35] text-[#A0A5B8] hover:border-[#FF7B54]/50'
                  }`}
                >
                  <span className="mr-1">{type.emoji}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {EVENT_ICONS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  title={label}
                  className={`p-2.5 rounded-lg border transition-all duration-200 text-xl ${
                    formData.icon === emoji
                      ? 'bg-[#FF7B54]/20 border-[#FF7B54]'
                      : 'bg-[#2A2D35]/50 border-[#2A2D35] hover:border-[#FF7B54]/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Start Time *
            </label>
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) =>
                setFormData({ ...formData, start_time: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              End Time (optional)
            </label>
            <input
              type="datetime-local"
              value={formData.end_time || ''}
              onChange={(e) =>
                setFormData({ ...formData, end_time: e.target.value || undefined })
              }
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Location (optional)
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value || undefined })
              }
              placeholder="e.g., Tokyo International Airport"
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#5D677D] focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Description (optional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value || undefined })
              }
              placeholder="Add more details about this event"
              rows={3}
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#5D677D] focus:border-[#FF7B54] focus:outline-none transition-all duration-200 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3.5 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white font-bold rounded-full transition-all duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 bg-linear-to-r from-[#FF7B54] to-[#FF9F6F] hover:from-[#FF9F6F] hover:to-[#FFA880] text-white font-bold rounded-full transition-all duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
