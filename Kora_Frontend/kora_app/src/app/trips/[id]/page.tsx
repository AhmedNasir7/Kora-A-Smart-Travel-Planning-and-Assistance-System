'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // Sample trip data - in a real app, this would come from an API
  const trip = {
    id: params.id,
    destination: 'Tokyo',
    country: 'Japan',
    status: 'Upcoming',
    startDate: 'MARCH 15',
    endDate: 'MARCH 22',
    progress: 75,
    description: 'An amazing trip to explore the vibrant culture and technology of Tokyo.',
  };

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
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mb-8 text-[#A0A5B8] hover:text-white flex items-center gap-2 transition-colors"
          >
            ← Back to Trips
          </button>

          {/* Trip Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {trip.destination}
                </h1>
                <p className="text-lg text-[#A0A5B8]">{trip.country}</p>
              </div>
              <span className="px-4 py-2 bg-[#FF7B54] text-white text-sm font-semibold rounded-lg">
                {trip.status}
              </span>
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Info Card */}
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Trip Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#A0A5B8] mb-1">Duration</p>
                  <p className="text-white">
                    {trip.startDate} - {trip.endDate}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#A0A5B8] mb-1">Description</p>
                  <p className="text-white">{trip.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#A0A5B8]">Preparation Progress</p>
                    <p className="text-sm font-semibold text-[#FF7B54]">
                      {trip.progress}%
                    </p>
                  </div>
                  <div className="w-full bg-[#2A2D35] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F] h-full rounded-full"
                      style={{ width: `${trip.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Trip Tools</h2>

              <div className="space-y-3">
                <Link
                  href={`/trips/${trip.id}/packing`}
                  className="block w-full px-4 py-3 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white text-center rounded-lg transition-colors"
                >
                  Packing List
                </Link>
                <Link
                  href={`/trips/${trip.id}/documents`}
                  className="block w-full px-4 py-3 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white text-center rounded-lg transition-colors"
                >
                  Documents
                </Link>
                <Link
                  href={`/trips/${trip.id}/itinerary`}
                  className="block w-full px-4 py-3 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white text-center rounded-lg transition-colors"
                >
                  Itinerary
                </Link>
                <button className="w-full px-4 py-3 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-lg transition-colors">
                  Edit Trip
                </button>
              </div>
            </div>
          </div>
        </div>

        <DashboardFooter />
      </div>
    </main>
  );
}
