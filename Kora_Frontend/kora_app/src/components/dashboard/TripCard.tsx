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
  onStatusChange?: (id: string, status: 'Planning' | 'Upcoming') => void;
  onDelete?: (id: string) => void;
  isMutating?: boolean;
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
  onStatusChange,
  onDelete,
  isMutating = false,
}: TripCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-2xl p-8 hover:border-[#FF7B54] transition-all duration-300 group shadow-lg hover:shadow-2xl hover:shadow-[#FF7B54]/10 min-h-40">
      <Link href={`/trips/${id}`} className="block cursor-pointer">
        <div className="flex items-start gap-6 overflow-hidden">
          {/* Emoji */}
          <div className="text-5xl shrink-0 group-hover:text-6xl transition-all duration-300">{emoji}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-white mb-2 truncate">{destination}, {country}</h3>
                <div className="flex items-center gap-2 text-xs text-[#A0A5B8]">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="truncate">{startDate} - {endDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FF7B54]/15 border border-[#FF7B54]/30 rounded-full shrink-0 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColorMap[status] }} />
                <span className="text-xs font-semibold text-[#FF7B54] uppercase">{statusLabelMap[status]}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-[#7A7E8C] uppercase font-medium">Preparation</p>
                  <p className="text-xs font-bold text-[#FF7B54] shrink-0">{progress}%</p>
                </div>
                <div className="w-full bg-[#2A2D35] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <svg className="w-5 h-5 text-[#A0A5B8] group-hover:text-[#FF7B54] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-xs text-[#A0A5B8]">{Math.max(0, 15 - Math.floor(progress / 10))} tasks remaining</p>
          </div>
        </div>
      </Link>

      {(onStatusChange || onDelete) && (
        <div className="mt-4 pt-4 border-t border-[#2A2D35] flex items-center gap-2">
          {onStatusChange && status !== 'Planning' && (
            <button
              type="button"
              disabled={isMutating}
              onClick={() => onStatusChange(id, 'Planning')}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#2A2D35] hover:bg-[#3A3F4A] disabled:opacity-60 text-white transition-colors"
            >
              Planning
            </button>
          )}
          {onStatusChange && status !== 'Upcoming' && (
            <button
              type="button"
              disabled={isMutating}
              onClick={() => onStatusChange(id, 'Upcoming')}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#FF7B54] hover:bg-[#FF9F6F] disabled:opacity-60 text-white transition-colors"
            >
              Upcoming
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              disabled={isMutating}
              onClick={() => onDelete(id)}
              className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-[#3A1F24] hover:bg-[#4A2A31] disabled:opacity-60 text-[#FF9F6F] transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
