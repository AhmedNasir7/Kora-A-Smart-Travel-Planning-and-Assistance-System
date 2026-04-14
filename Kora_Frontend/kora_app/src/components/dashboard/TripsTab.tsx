interface TripsTabProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TripsTab({ tabs, activeTab, onTabChange }: TripsTabProps) {
  return (
    <div className="flex items-center justify-between gap-6 mb-8 pb-0">
      {/* Tabs */}
      <div className="flex gap-6 overflow-x-auto flex-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-1 py-3 text-sm font-medium transition-all duration-300 whitespace-nowrap relative ${
              activeTab === tab
                ? 'text-[#FF7B54]'
                : 'text-[#A0A5B8] hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F]" />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative min-w-max">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7E8C]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search trips..."
          className="pl-10 pr-4 py-2.5 bg-[#1A1D26] border border-[#2A2D35] rounded-xl text-sm text-[#A0A5B8] placeholder-[#7A7E8C] focus:border-[#FF7B54] focus:ring-1 focus:ring-[#FF7B54]/30 focus:outline-none transition-all duration-200 w-48 hover:border-[#2A2D35]/80"
        />
      </div>
    </div>
  );
}
