'use client';

export function TimelineSection() {
  const activities = [
    { time: '6:00 AM', label: 'Depart for airport', icon: '✈️' },
    { time: '7:30 AM', label: 'Flight TK-432 → NRT', icon: '✈️' },
    { time: '11:00 AM', label: 'Check-in at Shinjuku Hotel', icon: '🏨' },
    { time: 'Afternoon', label: 'Explore Shinjuku Gyoen', icon: '🌸' },
    { time: 'Evening', label: 'Bullet train to Kyoto', icon: '🚄' },
    { time: 'Night', label: 'Dinner at Halifasuwan', icon: '🍜' },
    { time: '10 PM', label: 'Fireworks near Uchiwa', icon: '✨' },
  ];

  return (
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="space-y-4 mb-16">
          <p className="text-[12px] font-bold tracking-wider text-[#FF7B54] uppercase">Timeline</p>
          <h2 className="text-[48px] font-bold leading-tight text-white">
            Your journey,
            <br />
            step by step.
          </h2>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl">
          <div className="space-y-4">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex gap-6">
                {/* Timeline Dot and Line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FF7B54] flex items-center justify-center text-white font-bold">
                    {activity.icon}
                  </div>
                  {idx < activities.length - 1 && (
                    <div className="w-0.5 h-20 bg-gradient-to-b from-[#FF7B54] to-[#FF7B54]/20 mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 py-2">
                  <p className="text-[12px] font-bold text-[#FF7B54] uppercase tracking-wider">{activity.time}</p>
                  <p className="text-[16px] font-medium text-white mt-1">{activity.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
