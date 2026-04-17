'use client';

import { useState } from 'react';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void> | void;
}

interface FormData {
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  emoji: string;
}

const DESTINATION_OPTIONS = [
  { value: 'Tokyo', label: 'Tokyo, Japan' },
  { value: 'Barcelona', label: 'Barcelona, Spain' },
  { value: 'New York', label: 'New York, USA' },
  { value: 'Bali', label: 'Bali, Indonesia' },
  { value: 'Paris', label: 'Paris, France' },
  { value: 'Rome', label: 'Rome, Italy' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Dubai', label: 'Dubai, UAE' },
];

const EMOJI_OPTIONS = [
  { emoji: '✈️', label: 'Airplane' },
  { emoji: '🗼', label: 'Tokyo Tower' },
  { emoji: '🏖️', label: 'Beach' },
  { emoji: '🗽', label: 'Statue of Liberty' },
  { emoji: '🌴', label: 'Palm Tree' },
  { emoji: '🗿', label: 'Moai' },
  { emoji: '🏔️', label: 'Mountain' },
  { emoji: '🏰', label: 'Castle' },
  { emoji: '🕌', label: 'Mosque' },
  { emoji: '🗻', label: 'Mount Fuji' },
  { emoji: '🌍', label: 'Globe' },
  { emoji: '🧳', label: 'Luggage' },
];

export function AddTripModal({ isOpen, onClose, onSubmit }: AddTripModalProps) {
  const [formData, setFormData] = useState<FormData>({
    destination: 'Tokyo',
    startDate: '',
    endDate: '',
    status: 'Draft',
    emoji: '✈️',
  });
  const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(formData);
    setFormData({
      destination: 'Tokyo',
      startDate: '',
      endDate: '',
      status: 'Draft',
      emoji: '✈️',
    });
    onClose();
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmojiSelect = (emoji: string) => {
    setFormData((prev) => ({ ...prev, emoji }));
    setShowEmojiDropdown(false);
  };

  const handleSuggestedDestinationChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { value } = event.target;
    if (!value) {
      return;
    }

    setFormData((prev) => ({ ...prev, destination: value }));
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-500"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-3xl p-8 max-w-md w-full pointer-events-auto shadow-2xl shadow-black/50 transition-all duration-500 ease-out"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(40px)',
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-[#FF7B54] font-bold tracking-widest uppercase mb-2">
                New Adventure
              </p>
              <h2 className="text-2xl font-bold text-white">Plan a New Trip</h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#A0A5B8] hover:text-white transition-colors duration-200 p-2 hover:bg-[#2A2D35] rounded-lg ml-4 flex-shrink-0"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiDropdown((current) => !current)}
                  className="w-16 h-16 bg-gradient-to-br from-[#2A2D35] to-[#1A1D26] border border-[#2A2D35] rounded-xl text-4xl flex items-center justify-center hover:border-[#FF7B54] hover:from-[#FF7B54]/20 transition-all duration-300 shadow-lg hover:shadow-[#FF7B54]/30"
                >
                  {formData.emoji}
                </button>

                {showEmojiDropdown && (
                  <div className="absolute bottom-full left-0 mb-4 bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-2xl p-4 grid grid-cols-4 gap-2 w-52 shadow-2xl shadow-black/50 animate-in fade-in zoom-in duration-200">
                    {EMOJI_OPTIONS.map(({ emoji, label }) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        title={label}
                        className="text-2xl p-3 hover:bg-[#FF7B54]/20 rounded-lg transition-all duration-200 hover:scale-125 hover:border-[#FF7B54] border border-transparent"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-[#FF7B54] uppercase tracking-widest mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Type or choose a destination"
                  className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-xl text-white hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 focus:shadow-lg focus:shadow-[#FF7B54]/10 cursor-pointer"
                  required
                />
                <select
                  value=""
                  onChange={handleSuggestedDestinationChange}
                  className="mt-3 w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-xl text-[#A0A5B8] hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30"
                >
                  <option value="">Quick select destination</option>
                  {DESTINATION_OPTIONS.map((destination) => (
                    <option key={destination.value} value={destination.value}>
                      {destination.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#FF7B54] uppercase tracking-widest mb-2">
                Dates
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-[#7A7E8C] mb-2 uppercase tracking-widest">
                    Start Date
                  </p>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-xl text-white hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 focus:shadow-lg focus:shadow-[#FF7B54]/10"
                    required
                  />
                </div>
                <div>
                  <p className="text-[11px] text-[#7A7E8C] mb-2 uppercase tracking-widest">
                    End Date
                  </p>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-xl text-white hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 focus:shadow-lg focus:shadow-[#FF7B54]/10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#FF7B54] uppercase tracking-widest mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-xl text-white hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 focus:shadow-lg focus:shadow-[#FF7B54]/10 cursor-pointer"
              >
                <option>Draft</option>
                <option>Idea</option>
                <option>Planning</option>
                <option>Upcoming</option>
              </select>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F] hover:from-[#FF9F6F] hover:to-[#FFA880] text-white font-bold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7B54]/50 hover:scale-105 active:scale-95"
              >
                Create Trip
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
