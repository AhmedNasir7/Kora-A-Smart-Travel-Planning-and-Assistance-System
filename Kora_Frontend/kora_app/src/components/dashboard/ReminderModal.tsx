'use client';

import { useState } from 'react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReminderFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: ReminderFormData;
  isEditMode?: boolean;
}

export interface ReminderFormData {
  title: string;
  description?: string;
  reminderDate: string;
  urgency: 'low' | 'medium' | 'high';
  category?: string;
}

const URGENCY_OPTIONS = [
  { value: 'low' as const, label: 'Low', color: '#4a8f6f' },
  { value: 'medium' as const, label: 'Medium', color: '#FF7B54' },
  { value: 'high' as const, label: 'High', color: '#ff4444' },
];

const REMINDER_CATEGORIES = [
  'Booking',
  'Documents',
  'Packing',
  'Travel',
  'Accommodation',
  'Transport',
  'Health',
  'Other',
];

export function ReminderModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  isEditMode = false,
}: ReminderModalProps) {
  const [formData, setFormData] = useState<ReminderFormData>(
    initialData || {
      title: '',
      description: '',
      reminderDate: '',
      urgency: 'medium',
      category: 'Travel',
    }
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Reminder title is required');
      return;
    }

    if (!formData.reminderDate) {
      setError('Reminder date is required');
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reminder');
    }
  };

  const handleClose = () => {
    setFormData(
      initialData || {
        title: '',
        description: '',
        reminderDate: '',
        urgency: 'medium',
        category: 'Travel',
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
            {isEditMode ? 'Edit Reminder' : 'New Reminder'}
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
              Reminder Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Book accommodation"
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#5D677D] focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Category
            </label>
            <select
              value={formData.category || 'Travel'}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
            >
              {REMINDER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Urgency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {URGENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, urgency: option.value })
                  }
                  className={`py-2.5 px-3 rounded-lg border transition-all duration-200 font-semibold text-sm ${
                    formData.urgency === option.value
                      ? 'bg-opacity-20 border-opacity-100'
                      : 'bg-[#2A2D35]/50 border-[#2A2D35] text-[#A0A5B8]'
                  }`}
                  style={{
                    backgroundColor:
                      formData.urgency === option.value
                        ? `${option.color}20`
                        : undefined,
                    borderColor:
                      formData.urgency === option.value
                        ? option.color
                        : undefined,
                    color:
                      formData.urgency === option.value ? option.color : undefined,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Date */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Remind On *
            </label>
            <input
              type="datetime-local"
              value={formData.reminderDate}
              onChange={(e) =>
                setFormData({ ...formData, reminderDate: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-all duration-200"
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
              placeholder="Add details about this reminder"
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
              {isLoading ? 'Saving...' : isEditMode ? 'Update Reminder' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
