'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'לוח ראשי', icon: '📋' },
  { href: '/lachiyuv', label: 'לחיוב', icon: '💳' },
  { href: '/hushlimu', label: 'הושלמו', icon: '✅' },
];

export default function BottomTabs() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors ${
                active
                  ? 'text-sky-700 bg-sky-50 border-t-2 border-sky-600'
                  : 'text-gray-500 hover:text-sky-600 hover:bg-gray-50 border-t-2 border-transparent'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
