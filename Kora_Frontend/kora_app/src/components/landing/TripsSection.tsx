'use client';

export function TripsSection() {
  const trips = [
    { 
      name: 'Tokyo, Japan', 
      dateRange: 'MARCH 15-MARCH 22',
      progress: 75,
      tasksRemaining: 3,
      status: 'UPCOMING',
      statusColor: '#6b7ba3'
    },
    { 
      name: 'Kyoto, Japan', 
      dateRange: 'MARCH 15-MARCH 22',
      progress: 75,
      tasksRemaining: 3,
      status: 'COMPLETED',
      statusColor: '#4a8f6f'
    },
    { 
      name: 'Lahore, Pakistan', 
      dateRange: 'MARCH 15-MARCH 22',
      progress: 75,
      tasksRemaining: 3,
      status: 'DRAFT',
      statusColor: '#8b7a54'
    },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="space-y-4 mb-16">
          <p className="text-[12px] font-bold tracking-wider text-[#FF7B54] uppercase">Your Trips</p>
          <h2 className="text-[48px] font-bold leading-tight text-white">
            Every journey,
            <span className="text-[#FF7B54]"> organized.</span>
          </h2>
        </div>

        {/* Trip Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {trips.map((trip, idx) => (
            <div key={idx} className="group bg-[rgba(23,28,43,0.5)] backdrop-blur border border-[#2a3344] rounded-2xl p-6 hover:border-[#FF7B54]/50 transition-all hover:shadow-[0_0_24px_rgba(255,123,84,0.15)]">
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex justify-center">
                  <span 
                    className="text-[10px] font-bold tracking-widest px-3 py-1 rounded-md border"
                    style={{
                      color: trip.statusColor,
                      borderColor: trip.statusColor,
                      backgroundColor: 'rgba(0,0,0,0.2)'
                    }}
                  >
                    {trip.status}
                  </span>
                </div>

                {/* Trip Name */}
                <h3 className="text-[18px] font-semibold text-white text-center">{trip.name}</h3>

                {/* Date */}
                <div className="flex items-center justify-center gap-2 text-[12px] text-[#a9a59b]">
                  <span>📅</span>
                  <span>{trip.dateRange}</span>
                </div>
                
                {/* Progress Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a9a59b]">Preparation</span>
                    <span className="text-[11px] font-semibold text-[#a9a59b]">{trip.progress}%</span>
                  </div>
                  <div className="h-2 bg-[#0f1323] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF7B54] to-[#ff8a5b]"
                      style={{ width: `${trip.progress}%` }}
                    />
                  </div>
                </div>

                {/* Tasks Remaining */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[12px] text-[#a9a59b]">{trip.tasksRemaining} tasks remaining</span>
                  <span className="text-[#FF7B54] text-lg group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
