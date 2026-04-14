import Link from 'next/link';

interface QuickAction {
  label: string;
  href: string;
  icon: 'trips' | 'packing' | 'documents' | 'reminders';
}

const iconMap = {
  trips: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  packing: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m0 0v10l8 4" />
    </svg>
  ),
  documents: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  reminders: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
};

interface QuickActionsProps {
  actions?: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const defaultActions: QuickAction[] = [
    { label: 'Add Trips', href: '/trips', icon: 'trips' },
    { label: 'Packing', href: '/packing', icon: 'packing' },
    { label: 'Documents', href: '/documents', icon: 'documents' },
    { label: 'Reminders', href: '/reminders', icon: 'reminders' },
  ];

  const itemsToDisplay = actions || defaultActions;

  return (
    <div>
      <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {itemsToDisplay.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-2xl p-6 hover:border-[#FF7B54] transition-all duration-300 flex flex-col items-center gap-3 group shadow-lg hover:shadow-[#FF7B54]/10 hover:shadow-2xl hover:scale-105"
          >
            <div className="text-[#FF7B54] group-hover:scale-125 transition-transform duration-300">
              {iconMap[action.icon]}
            </div>
            <span className="text-sm text-white text-center font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
