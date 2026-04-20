import Link from 'next/link';

interface UpcomingEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  code?: string;
  color: 'green' | 'orange' | 'blue';
}

interface UpcomingSectionProps {
  events: UpcomingEvent[];
}

const colorMap = {
  green: 'bg-[#10B981]',
  orange: 'bg-[#FF7B54]',
  blue: 'bg-[#3B82F6]',
};

export function UpcomingSection({ events }: UpcomingSectionProps) {
  return (
    <div className="bg-linear-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-2xl p-7 hover:border-[#FF7B54]/30 transition-all duration-300 h-full flex flex-col shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-sm font-bold text-[#FF7B54] uppercase tracking-widest">Upcoming</h2>
        <Link href="/trips" className="text-sm text-[#FF7B54] hover:text-[#FF9F6F] flex items-center gap-2 transition-all duration-300 group">
          View all <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-4 pb-5 border-b border-[#2A2D35] last:border-0 last:pb-0 hover:opacity-80 transition-opacity duration-200">
            <div 
              className={`w-3 h-3 rounded-full ${colorMap[event.color]} shrink-0 mt-2 shadow-lg`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#7A7E8C] mb-1 font-medium">
                {event.date}, {event.time}
              </p>
              <p className="text-sm text-white font-medium">
                {event.title}
                {event.code && <span className="text-[#A0A5B8]"> — {event.code}</span>}
              </p>
            </div>
            <button className="text-[#A0A5B8] hover:text-[#FF7B54] shrink-0 transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
