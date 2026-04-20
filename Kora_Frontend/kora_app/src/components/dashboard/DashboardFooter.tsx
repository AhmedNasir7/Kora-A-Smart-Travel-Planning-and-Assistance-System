export function DashboardFooter() {
  return (
    <footer className="bg-linear-to-r from-[#13151A] via-[#1A1D26] to-[#13151A] border-t border-[#2A2D35] mt-16 py-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF7B54] rounded-lg flex items-center justify-center shadow-lg shadow-[#FF7B54]/30 group hover:bg-[#FF9F6F] transition-all duration-200">
              <span className="text-white text-xl">✈</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Kora</span>
          </div>
          <p className="text-xs text-[#7A7E8C] font-medium">© 2025 Kora. Travel with clarity.</p>
        </div>
      </div>
    </footer>
  );
}
