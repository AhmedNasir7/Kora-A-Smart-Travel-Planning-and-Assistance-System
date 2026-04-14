'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  category: 'preparation' | 'booking' | 'travel' | 'health';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  trip: string;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', title: 'Book flights', description: 'Compare prices and book flights to Tokyo', date: '2026-02-20', time: '10:00', category: 'booking', priority: 'high', completed: true, trip: 'Tokyo' },
    { id: '2', title: 'Get travel insurance', description: 'Purchase comprehensive travel insurance', date: '2026-02-25', time: '14:00', category: 'preparation', priority: 'high', completed: false, trip: 'Tokyo' },
    { id: '3', title: 'Pack luggage', description: 'Final packing before departure', date: '2026-03-14', time: '09:00', category: 'preparation', priority: 'medium', completed: false, trip: 'Tokyo' },
    { id: '4', title: 'Check-in online', description: 'Online check-in 24 hours before flight', date: '2026-03-14', time: '16:30', category: 'travel', priority: 'high', completed: false, trip: 'Tokyo' },
    { id: '5', title: 'Vaccinations', description: 'Get required vaccinations for Japan', date: '2026-01-30', time: '11:00', category: 'health', priority: 'high', completed: false, trip: 'Tokyo' },
    { id: '6', title: 'Book hotel', description: 'Confirm hotel reservation in Shinjuku', date: '2026-02-28', time: '15:00', category: 'booking', priority: 'medium', completed: false, trip: 'Tokyo' },
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'preparation' | 'booking' | 'travel' | 'health'>('all');

  const filteredReminders = reminders.filter((reminder) => {
    const statusMatch = filter === 'all' || (filter === 'pending' && !reminder.completed) || (filter === 'completed' && reminder.completed);
    const categoryMatch = selectedCategory === 'all' || reminder.category === selectedCategory;
    return statusMatch && categoryMatch;
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
    }
    return a.completed ? 1 : -1;
  });

  const toggleReminder = (id: string) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'preparation':
        return 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30';
      case 'booking':
        return 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30';
      case 'travel':
        return 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30';
      case 'health':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
      default:
        return '';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-[#FF7B54]';
      case 'medium':
        return 'text-[#FF9F6F]';
      case 'low':
        return 'text-[#A0A5B8]';
      default:
        return '';
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
      <div className="relative z-10">
        <Header variant="dashboard" />

        <div className="max-w-5xl mx-auto px-6 py-12 mt-20">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <p className="text-xs text-[#FF7B54] font-bold tracking-widest uppercase mb-3">Reminders</p>
              <h1 className="text-5xl font-bold text-white mb-4">Stay on Track</h1>
              <p className="text-[#A0A5B8]">{reminders.filter((r) => !r.completed).length} pending reminders</p>
            </div>
            <button className="px-8 py-3 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#FF7B54]/50 flex items-center gap-2">
              <span className="text-xl">+</span> New Reminder
            </button>
          </div>

          {/* Filter Section */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Status Filter */}
            <div>
              <p className="text-xs text-[#FF7B54] font-bold tracking-widest uppercase mb-3">Status</p>
              <div className="flex gap-2">
                {(['all', 'pending', 'completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      filter === tab
                        ? 'bg-[#FF7B54] text-white'
                        : 'bg-[#2A2D35] text-[#A0A5B8] hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-xs text-[#FF7B54] font-bold tracking-widest uppercase mb-3">Category</p>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'preparation', 'booking', 'travel', 'health'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-[#FF7B54] text-white'
                        : 'bg-[#2A2D35] text-[#A0A5B8] hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All' : getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reminders List */}
          <div className="space-y-3">
            {sortedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-start gap-4 p-5 bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-xl hover:border-[#FF7B54]/30 transition-all duration-200 group ${
                  reminder.completed ? 'opacity-75' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={reminder.completed}
                  onChange={() => toggleReminder(reminder.id)}
                  className="w-5 h-5 rounded-lg accent-[#FF7B54] cursor-pointer flex-shrink-0 mt-1"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className={`text-sm font-semibold ${reminder.completed ? 'line-through text-[#7A7E8C]' : 'text-white'}`}>
                      {reminder.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-bold ${getPriorityColor(reminder.priority)}`}>
                        {'●'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border font-semibold ${getCategoryColor(reminder.category)}`}>
                        {getCategoryLabel(reminder.category)}
                      </span>
                    </div>
                  </div>

                  {reminder.description && (
                    <p className={`text-xs mb-3 ${reminder.completed ? 'text-[#7A7E8C]' : 'text-[#A0A5B8]'}`}>
                      {reminder.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-[#7A7E8C]">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(reminder.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {reminder.time}
                    </div>
                    <span className="text-[#FF7B54]/70">{reminder.trip}</span>
                  </div>
                </div>

                <button className="px-3 py-2 text-[#A0A5B8] hover:text-[#FF7B54] hover:bg-[#FF7B54]/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0">
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sortedReminders.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#A0A5B8] mb-4">No reminders found</p>
              <button className="text-[#FF7B54] hover:text-[#FF9F6F] font-semibold">
                Create your first reminder →
              </button>
            </div>
          )}
        </div>

        <DashboardFooter />
      </div>
    </main>
  );
}
