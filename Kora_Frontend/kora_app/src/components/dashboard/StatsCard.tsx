interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
}

export function StatsCard({ label, value, subtext }: StatsCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-2xl p-7 hover:border-[#FF7B54]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7B54]/10">
      <p className="text-xs text-[#A0A5B8] mb-3 font-medium tracking-wide uppercase">{label}</p>
      <p className="text-4xl font-bold text-white mb-2">{value}</p>
      {subtext && <p className="text-xs text-[#7A7E8C]">{subtext}</p>}
    </div>
  );
}
