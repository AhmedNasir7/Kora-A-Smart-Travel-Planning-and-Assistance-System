'use client';

export function PackingSection() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="space-y-4 mb-16">
          <p className="text-[12px] font-bold tracking-wider text-[#FF7B54] uppercase">Packing Lists</p>
          <h2 className="text-[48px] font-bold leading-tight text-white">
            Never forget a thing.
          </h2>
          <p className="text-[16px] text-[#a9a59b] max-w-2xl">
            Organize items by category and get smart reminders before you leave.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Categories */}
          <div className="space-y-3">
            {[
              { icon: '👔', name: 'Clothing', count: '2/4' },
              { icon: '💼', name: 'Essentials', count: '1/1' },
              { icon: '💊', name: 'Health', count: '2/4' },
              { icon: '✨', name: 'Essentials', count: '0/2' },
            ].map((category, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[rgba(23,28,43,0.4)] border border-[#2a3344] rounded-xl hover:border-[#ff6b35]/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-[14px] font-medium text-white">{category.name}</span>
                </div>
                <span className="text-[12px] text-[#ff6b35] font-semibold">{category.count}</span>
              </div>
            ))}
          </div>

          {/* Right - Detailed List */}
          <div className="border border-[#2a3344] rounded-2xl p-6 bg-[rgba(23,28,43,0.4)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold text-white">Clothing</h3>
              <button className="text-[12px] text-[#FF7B54] font-semibold hover:opacity-80">
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {[
                { item: 'Shirts', count: '(2x3)', checked: true },
                { item: 'Jeans', count: '(2x2)', checked: true },
                { item: 'Jacket', count: '', checked: false },
                { item: 'Coat', count: '', checked: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[#0f1323] rounded-lg">
                  <input 
                    type="checkbox" 
                    checked={item.checked}
                    readOnly
                    className="w-4 h-4 rounded accent-[#FF7B54]"
                  />
                  <span className={`flex-1 text-[14px] ${item.checked ? 'text-[#7c808a] line-through' : 'text-white'}`}>
                    {item.item}
                  </span>
                  {item.count && <span className="text-[12px] text-[#7c808a]">{item.count}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
