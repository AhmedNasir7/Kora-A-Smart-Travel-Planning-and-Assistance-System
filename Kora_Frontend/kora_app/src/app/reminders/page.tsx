'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';
import { AddReminderModal } from '@/components/dashboard/AddReminderModal';
import { ConfirmationDialog } from '@/components/dashboard/ConfirmationDialog';
import { apiService, type Reminder, type ReminderSummary, type CreateReminderPayload } from '@/lib/api';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'pending' | 'completed'>('all');
  const [isMutating, setIsMutating] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    reminderId?: string;
  }>({ isOpen: false });

  useEffect(() => {
    let isMounted = true;

    const loadReminders = async () => {
      setIsLoading(true);
      setError(null);
      setReminders([]);
      try {
        const data = await apiService.getReminders();
        if (isMounted) {
          setReminders(data.items);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load reminders');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadReminders();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReminders = reminders.filter((reminder) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'urgent') return reminder.urgency === 'high' && !reminder.is_completed;
    if (activeTab === 'pending') return !reminder.is_completed;
    if (activeTab === 'completed') return reminder.is_completed;
    return true;
  });

  const summary: ReminderSummary = useMemo(
    () => ({
      total: reminders.length,
      urgent: reminders.filter((reminder) => reminder.urgency === 'high' && !reminder.is_completed).length,
      pending: reminders.filter((reminder) => !reminder.is_completed).length,
      completed: reminders.filter((reminder) => reminder.is_completed).length,
    }),
    [reminders],
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await apiService.getReminders();
        setReminders(data.items);
      } catch {
        // Keep current data on background sync failures.
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleReminder = async (id: string, isCompleted: boolean) => {
    try {
      setIsMutating(id);
      await apiService.updateReminder(id, { is_completed: !isCompleted });
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_completed: !isCompleted } : r)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reminder');
    } finally {
      setIsMutating(null);
    }
  };

  const handleDeleteReminder = (id: string) => {
    setDeleteConfirmation({ isOpen: true, reminderId: id });
  };

  const handleConfirmDeleteReminder = async () => {
    if (!deleteConfirmation.reminderId) return;
    const id = deleteConfirmation.reminderId;
    try {
      setIsMutating(id);
      await apiService.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      setDeleteConfirmation({ isOpen: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reminder');
    } finally {
      setIsMutating(null);
    }
  };

  const handleAddReminder = async (formData: {
    title: string;
    description: string;
    due_date: string;
    urgency: string;
    trip_id?: string;
  }) => {
    try {
      const payload: CreateReminderPayload = {
        title: formData.title,
        description: formData.description || undefined,
        due_date: new Date(formData.due_date).toISOString(),
        urgency: (formData.urgency as any) || 'medium',
        trip_id: formData.trip_id || undefined,
      };

      const newReminder = await apiService.createReminder(payload);
      setReminders((prev) => [newReminder, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reminder');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-[#FF7B54]';
      case 'medium':
        return 'text-[#FFB49F]';
      case 'low':
        return 'text-[#A0A5B8]';
      default:
        return 'text-[#A0A5B8]';
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
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header variant="dashboard" />

        <div className="max-w-5xl mx-auto px-6 py-12 mt-16 flex-1 w-full">
          {/* Header Section */}
          <div className="mb-12 flex items-start justify-between">
            <div>
              <p className="text-sm text-[#FF7B54] font-semibold mb-2">Reminders</p>
              <h1 className="text-4xl font-bold text-white mb-3">Stay on Track</h1>
              <p className="text-[#A0A5B8]">
                <span className="text-[#FF7B54]">{summary.urgent}</span> urgent · <span className="text-[#A0A5B8]">{summary.pending}</span> pending
              </p>
              {isLoading && <p className="text-xs text-[#7A7E8C] mt-2">Syncing reminders...</p>}
              {error && <p className="text-xs text-[#FF9F6F] mt-2">{error}</p>}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#FF7B54]/50 flex items-center gap-2 text-sm shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Reminder
            </button>
          </div>

          {/* Stats Tablets */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#FF7B54] mb-1">{summary.urgent}</div>
              <div className="text-xs text-[#A0A5B8]">Urgent</div>
            </div>
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#FFB49F] mb-1">{summary.pending}</div>
              <div className="text-xs text-[#A0A5B8]">Pending</div>
            </div>
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#00B96B] mb-1">{summary.completed}</div>
              <div className="text-xs text-[#A0A5B8]">Completed</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mb-8 items-center overflow-x-auto pb-2">
            {(['all', 'urgent', 'pending', 'completed'] as const).map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  activeTab === tab
                    ? 'bg-[#FF7B54] text-white'
                    : 'bg-transparent text-[#A0A5B8] hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-[#A0A5B8]">Loading reminders...</p>
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#A0A5B8]">No reminders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-lg border transition-all flex items-start gap-3 ${
                    reminder.is_completed
                      ? 'bg-[#0F1420]/50 border-[#1A2333] opacity-60'
                      : 'border-[#2A2D35] hover:border-[#FF7B54]/50'
                  }`}
                >
                  <button
                    onClick={() => handleToggleReminder(reminder.id, reminder.is_completed)}
                    disabled={isMutating === reminder.id}
                    className={`w-5 h-5 rounded-full border-2 transition-all mt-0.5 shrink-0 ${
                      reminder.is_completed
                        ? 'bg-[#00B96B] border-[#00B96B]'
                        : `border-[#7A8499] hover:border-[#9CA5B8] ${getUrgencyColor(reminder.urgency)}`
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-sm ${
                        reminder.is_completed
                          ? 'text-[#5D677D] line-through'
                          : 'text-white'
                      }`}
                    >
                      {reminder.title}
                    </h3>
                    {reminder.description && (
                      <p className="text-xs text-[#7A8499] mt-1">{reminder.description}</p>
                    )}
                    <p className="text-xs text-[#5D677D] mt-2">
                      {new Date(reminder.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium ${getUrgencyColor(reminder.urgency)}`}>
                      {reminder.urgency.charAt(0).toUpperCase() + reminder.urgency.slice(1)}
                    </span>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      disabled={isMutating === reminder.id}
                      className="text-[#A0A5B8] hover:text-[#FF7B54] transition-colors disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DashboardFooter />
      </div>

      <AddReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddReminder}
      />

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={Boolean(deleteConfirmation.reminderId && isMutating === deleteConfirmation.reminderId)}
        onConfirm={handleConfirmDeleteReminder}
        onCancel={() => setDeleteConfirmation({ isOpen: false })}
      />
    </main>
  );
}
