'use client';

import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative pt-28 pb-16 px-6 overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[rgba(255,123,84,0.12)] blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center mt-10">
          {/* Left Content */}
          <div className="space-y-8 max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3a4a5a] bg-[rgba(58,74,90,0.4)] px-4 py-2">
              <span className="text-[#FF7B54]">✦</span>
              <span className="text-[12px] font-bold tracking-wider text-[#a9a59b] uppercase">
                Smart Travel Assistant
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-6">
              <h1 className="text-[56px] lg:text-[64px] font-bold leading-[1.1] tracking-[-0.02em] text-white">
                Travel with
                <br />
                <span className="text-[#FF7B54]">clarity.</span>
              </h1>
              <p className="text-[18px] leading-relaxed text-[#a9a59b] max-w-lg">
                Kora unifies your schedules, packing lists, documents, and reminders into one calm, guided experience.
              </p>
            </div>

            {/* CTA Button */}
            <Link href="/signup" className="inline-block px-8 py-3.5 bg-[#FF7B54] hover:bg-[#ff8a5b] text-white font-semibold rounded-lg transition-all shadow-[0_0_24px_rgba(255,123,84,0.3)]">
              Start Planning →
            </Link>
          </div>

          {/* Right - Trip Card Visualization */}
          <div className="relative flex items-center justify-center ">
            <div className="relative w-full max-w-2xl" style={{ paddingBottom: '80px' }}>
              {/* Illustration Card Border */}
              <div className="rounded-3xl border-2 border-[#FF7B54]/40 bg-[rgba(255,123,84,0.08)] backdrop-blur-sm overflow-hidden relative p-8">

                {/* Aero SVG Illustration - Full image from top, cut at bottom */}
                <div className="relative flex items-center justify-center overflow-hidden" style={{ height: '310px' }}>
                  <img src="/aero.svg" alt="Airplane and globe illustration" className="w-full h-full object-cover object-center" />
                </div>
              </div>

              {/* Trip Card - Positioned overlapping bottom edge */}
              <div className="absolute bottom-12 right-8 bg-[rgba(19,21,26,0.98)] backdrop-blur-xl border border-[#FF7B54]/30 rounded-2xl p-6 shadow-2xl w-80">
                <p className="text-[10px] text-[#8b8980] font-semibold tracking-widest uppercase mb-4">Next Departure</p>
                <div className="space-y-3">
                  <h3 className="text-[18px] font-bold text-white">Tokyo → Osaka</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#a9a59b]">in</span>
                    <span className="text-[#FF7B54] text-[14px] font-semibold">2:30 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
