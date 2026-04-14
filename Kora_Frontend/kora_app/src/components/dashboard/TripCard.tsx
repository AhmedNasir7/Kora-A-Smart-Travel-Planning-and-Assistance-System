import Link from 'next/link';

interface TripCardProps {
  id: string;
  destination: string;
  country: string;
  status: 'Upcoming' | 'Planning' | 'Draft' | 'Idea';
  startDate: string;
  endDate: string;
  progress: number;
  emoji?: string;
}

const statusColorMap = {
  Upcoming: '#10B981',
  Planning: '#3B82F6',
  Draft: '#8B5CF6',
  Idea: '#F59E0B',
};

const statusLabelMap = {
  Upcoming: 'Upcoming',
  Planning: 'Planning',
  Draft: 'Draft',
  Idea: 'Idea',
};

export function TripCard({
  id,
  destination,
  country,
  status,
  startDate,
  endDate,
  progress,
  emoji = '✈️',
}: TripCardProps) {
  return (
    <Link href={`/trips/${id}`}>
      <div className="bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-2xl p-8 hover:border-[#FF7B54] transition-all duration-300 cursor-pointer group flex items-center gap-8 shadow-lg hover:shadow-2xl hover:shadow-[#FF7B54]/10 hover:scale-102 min-h-40">
        {/* Emoji */}
        <div className="text-6xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">{emoji}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{destination}, {country}</h3>
              <div className="flex items-center gap-2 text-sm text-[#A0A5B8]">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>{startDate} - {endDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FF7B54]/15 border border-[#FF7B54]/30 rounded-full flex-shrink-0">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColorMap[status] }} />
              <span className="text-xs font-semibold text-[#FF7B54] uppercase">{statusLabelMap[status]}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm text-[#7A7E8C] uppercase font-medium">Preparation</p>
                <p className="text-sm font-bold text-[#FF7B54]">{progress}%</p>
              </div>
              <div className="w-full bg-[#2A2D35] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <svg className="w-6 h-6 text-[#A0A5B8] group-hover:text-[#FF7B54] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-sm text-[#A0A5B8] mt-3">{Math.max(0, 15 - Math.floor(progress / 10))} tasks remaining</p>
        </div>
      </div>
    </Link>
  );
}
