interface ActiveTripProps {
  location: string;
  country: string;
  startDate: string;
  endDate: string;
  progress: number;
  label: string;
}

export function ActiveTrip({ location, country, startDate, endDate, progress, label }: ActiveTripProps) {
  return (
    <div className="bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-2xl p-7 hover:border-[#FF7B54]/30 transition-all duration-300 shadow-lg">
      <p className="text-xs text-[#FF7B54] font-bold tracking-widest uppercase mb-3">Active Trip</p>
      
      <h3 className="text-3xl font-bold text-white mb-1">{location}</h3>
      <p className="text-sm text-[#A0A5B8] mb-7">{country}</p>

      <div className="mb-8">
        <p className="text-xs text-[#7A7E8C] uppercase tracking-widest font-medium mb-2">
          {startDate} — {endDate}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[#7A7E8C] uppercase tracking-widest font-medium">{label}</p>
          <p className="text-xs font-bold text-[#FF7B54] bg-[#FF7B54]/10 px-3 py-1 rounded-full">{progress}%</p>
        </div>
        <div className="w-full bg-[#2A2D35] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F] h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
