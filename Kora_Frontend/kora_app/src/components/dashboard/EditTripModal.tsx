'use client';

import { useState } from 'react';
import type { TripStatus } from '@/lib/api';

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditTripFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: EditTripFormData;
}

export interface EditTripFormData {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  description?: string;
  emoji: string;
  status?: TripStatus;
}

const TRIP_EMOJIS = [
  { emoji: '✈️', label: 'Airplane' },
  { emoji: '🌍', label: 'World' },
  { emoji: '🗺️', label: 'Map' },
  { emoji: '🏖️', label: 'Beach' },
  { emoji: '🏔️', label: 'Mountain' },
  { emoji: '🏙️', label: 'City' },
  { emoji: '🎒', label: 'Backpack' },
  { emoji: '🧳', label: 'Luggage' },
  { emoji: '🚀', label: 'Adventure' },
  { emoji: '⛺', label: 'Camping' },
  { emoji: '🏕️', label: 'Camp' },
  { emoji: '🗼', label: 'Landmark' },
  { emoji: '🎡', label: 'Amusement' },
  { emoji: '🚂', label: 'Train' },
  { emoji: '🏝️', label: 'Island' },
];

const TRIP_STATUSES: { value: TripStatus; label: string }[] = [
  { value: 'Planning', label: 'Planning' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Idea', label: 'Idea' },
];

export function EditTripModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}: EditTripModalProps) {
  const [formData, setFormData] = useState<EditTripFormData>(
    initialData || {
      destination: '',
      country: '',
      startDate: '',
      endDate: '',
      description: '',
      emoji: '✈️',
      status: 'Planning' as TripStatus,
    }
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.destination.trim()) {
      setError('Destination is required');
      return;
    }

    if (!formData.country.trim()) {
      setError('Country is required');
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }

    if (!formData.endDate) {
      setError('End date is required');
      return;
    }

    if (formData.endDate < formData.startDate) {
      setError('End date cannot be before start date');
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trip');
    }
  };

  const handleClose = () => {
    setFormData(
      initialData || {
        destination: '',
        country: '',
        startDate: '',
        endDate: '',
        description: '',
        emoji: '✈️',
        status: 'Planning' as TripStatus,
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
          <h2 className="text-2xl font-bold text-white">Edit Trip</h2>
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
          {/* Destination */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Destination *
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              placeholder="e.g., Tokyo"
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#5D677D] focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Country *
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              placeholder="e.g., Japan"
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#5D677D] focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              End Date *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Trip Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {TRIP_EMOJIS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, emoji })}
                  title={label}
                  className={`p-2.5 rounded-lg border transition-all duration-200 text-xl ${
                    formData.emoji === emoji
                      ? 'bg-[#FF7B54]/20 border-[#FF7B54]'
                      : 'bg-[#2A2D35]/50 border-[#2A2D35] hover:border-[#FF7B54]/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Trip Status
            </label>
            <select
              value={formData.status || 'Planning'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as TripStatus,
                })
              }
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            >
              {TRIP_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
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
              placeholder="Add notes about your trip"
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
              {isLoading ? 'Saving...' : 'Update Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
