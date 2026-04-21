'use client';

import { useState, useEffect } from 'react';
import { apiService, type TripCardItem } from '@/lib/api';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void> | void;
}

interface FormData {
  title: string;
  description: string;
  due_date: string;
  urgency: string;
  trip_id?: string;
}

export function AddReminderModal({ isOpen, onClose, onSubmit }: AddReminderModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    due_date: '',
    urgency: 'medium',
    trip_id: undefined,
  });
  const [trips, setTrips] = useState<TripCardItem[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);

  useEffect(() => {
    if (isOpen && trips.length === 0) {
      setIsLoadingTrips(true);
      apiService.getTrips()
        .then((response) => {
          setTrips(response.items);
        })
        .catch((error) => {
          console.error('Failed to load trips:', error);
        })
        .finally(() => {
          setIsLoadingTrips(false);
        });
    }
  }, [isOpen, trips.length]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      due_date: '',
      urgency: 'medium',
      trip_id: undefined,
    });
    onClose();
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value || undefined }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-500"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-3xl p-8 max-w-md w-full pointer-events-auto shadow-2xl shadow-black/50 transition-all duration-500 ease-out"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-[#FF7B54] font-bold tracking-widest uppercase mb-2">
                New Reminder
              </p>
              <h2 className="text-2xl font-bold text-white">Stay on Track</h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#A0A5B8] hover:text-white transition-colors duration-200 p-2 hover:bg-[#2A2D35] rounded-lg ml-4 flex-shrink-0"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#FF7B54] uppercase tracking-widest mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Book airport transfer"
                className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-xl text-white placeholder-[#5D677D] hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 focus:shadow-lg focus:shadow-[#FF7B54]/10"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#FF7B54] uppercase tracking-widest mb-2">
                When
              </label>
              <input
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                placeholder="e.g. Tomorrow, 9 AM"
                className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-xl text-white placeholder-[#5D677D] hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 focus:shadow-lg focus:shadow-[#FF7B54]/10"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#FF7B54] uppercase tracking-widest mb-2">
                Urgency
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-xl text-white hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 focus:shadow-lg focus:shadow-[#FF7B54]/10 cursor-pointer"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#FF7B54] uppercase tracking-widest mb-2">
                Trip (Optional)
              </label>
              <select
                name="trip_id"
                value={formData.trip_id || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-xl text-white hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 focus:shadow-lg focus:shadow-[#FF7B54]/10 cursor-pointer"
              >
                <option value="">No trip selected</option>
                {isLoadingTrips ? (
                  <option disabled>Loading trips...</option>
                ) : (
                  trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.destination}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#FF7B54] uppercase tracking-widest mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details..."
                className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-xl text-white placeholder-[#5D677D] hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 focus:shadow-lg focus:shadow-[#FF7B54]/10 resize-none h-20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F] hover:from-[#FF9F6F] hover:to-[#FFA880] text-white font-bold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7B54]/50 hover:scale-105 active:scale-95"
              >
                Add Reminder
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3.5 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-black/30 hover:scale-105 active:scale-95 border border-[#3A3F4A]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
