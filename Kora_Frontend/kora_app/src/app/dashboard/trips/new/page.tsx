'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';

export default function NewTripPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
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

        <div className="max-w-4xl mx-auto px-6 py-12 mt-20">
          {/* Header */}
          <button
            onClick={handleBack}
            className="mb-8 text-[#A0A5B8] hover:text-white flex items-center gap-2 transition-colors"
          >
            ← Back
          </button>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Create New Trip</h1>
            <p className="text-[#A0A5B8]">Plan your next adventure</p>
          </div>

          {/* Form */}
          <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-8">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tokyo, Japan"
                  className="w-full px-4 py-2 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#7A7E8C] focus:border-[#FF7B54] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Status
                </label>
                <select className="w-full px-4 py-2 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white focus:border-[#FF7B54] focus:outline-none transition-colors">
                  <option>Idea</option>
                  <option>Draft</option>
                  <option>Planning</option>
                  <option>Upcoming</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Tell us about your trip..."
                  rows={4}
                  className="w-full px-4 py-2 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white placeholder-[#7A7E8C] focus:border-[#FF7B54] focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-lg transition-colors"
                >
                  Create Trip
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
