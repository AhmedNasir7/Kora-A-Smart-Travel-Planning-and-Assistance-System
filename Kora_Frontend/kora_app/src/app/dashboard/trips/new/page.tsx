'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';
import { apiService, type TripStatus } from '@/lib/api';

type TripFormData = {
  destination: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  emoji: string;
};

const DESTINATION_OPTIONS = [
  { value: 'Tokyo', label: 'Tokyo, Japan', emoji: '🗼' },
  { value: 'Barcelona', label: 'Barcelona, Spain', emoji: '🏖️' },
  { value: 'New York', label: 'New York, USA', emoji: '🗽' },
  { value: 'Bali', label: 'Bali, Indonesia', emoji: '🌴' },
  { value: 'Paris', label: 'Paris, France', emoji: '🗼' },
  { value: 'Rome', label: 'Rome, Italy', emoji: '🏛️' },
  { value: 'Singapore', label: 'Singapore', emoji: '🌍' },
  { value: 'Dubai', label: 'Dubai, UAE', emoji: '🕌' },
  { value: 'Custom', label: 'Custom destination', emoji: '✍️' },
];

const STATUS_OPTIONS: TripStatus[] = ['Idea', 'Draft', 'Planning', 'Upcoming'];

export default function NewTripPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TripFormData>({
    destination: 'Tokyo',
    startDate: '',
    endDate: '',
    status: 'Planning',
    emoji: '🗼',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleDestinationChange = (value: string) => {
    const selected = DESTINATION_OPTIONS.find((option) => option.value === value);
    setFormData((prev) => ({
      ...prev,
      destination: value,
      emoji: selected?.emoji || prev.emoji,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await apiService.createTrip({
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        emoji: formData.emoji,
      });
      router.push('/trips');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Failed to create trip',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#13151A]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,123,84,0.08)] blur-3xl" />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-[rgba(255,123,84,0.05)] blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header variant="dashboard" />

        <div className="max-w-4xl mx-auto px-6 py-12 mt-20">
          <button
            onClick={handleBack}
            className="mb-8 text-[#A0A5B8] hover:text-white flex items-center gap-2 transition-colors"
          >
            ← Back
          </button>

          <div className="mb-12">
            <p className="text-sm text-[#FF7B54] font-semibold mb-2">Trips</p>
            <h1 className="text-4xl font-bold text-white mb-2">Create New Trip</h1>
            <p className="text-[#A0A5B8]">Pick a destination and choose dates from the calendar</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-[#FF7B54]/30 bg-[#FF7B54]/10 px-4 py-3 text-sm text-[#FFB49F]">
              {error}
            </div>
          )}

          <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    list="new-trip-destination-options"
                    value={formData.destination}
                    onChange={(event) => handleDestinationChange(event.target.value)}
                    placeholder="Type or choose a destination"
                    className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#7A7E8C] focus:border-[#FF7B54] focus:outline-none transition-colors"
                    required
                  />
                  <datalist id="new-trip-destination-options">
                    {DESTINATION_OPTIONS.filter((destination) => destination.value !== 'Custom').map((destination) => (
                      <option key={destination.value} value={destination.value}>
                        {destination.label}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: event.target.value as TripStatus,
                      }))
                    }
                    className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-colors cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, startDate: event.target.value }))
                    }
                    className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, endDate: event.target.value }))
                    }
                    className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Emoji
                </label>
                <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
                  {DESTINATION_OPTIONS.map((destination) => (
                    <button
                      key={destination.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          emoji: destination.emoji,
                        }))
                      }
                      className={`h-12 rounded-lg border transition-colors text-xl ${
                        formData.emoji === destination.emoji
                          ? 'border-[#FF7B54] bg-[#FF7B54]/15'
                          : 'border-[#2A2D35] bg-[#13151A] hover:border-[#3A3F4A]'
                      }`}
                    >
                      {destination.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-[#FF7B54] hover:bg-[#FF9F6F] disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
                >
                  {isSaving ? 'Creating Trip...' : 'Create Trip'}
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <DashboardFooter />
      </div>
    </main>
  );
}
