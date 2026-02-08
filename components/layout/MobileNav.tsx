'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export function MobileNav() {
  const pathname = usePathname();

  // Don't show nav on sign-in/sign-up pages
  if (pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/events', label: 'Events', icon: '📅' },
    { href: '/runners', label: 'Runners', icon: '👥' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-white/20 shadow-2xl z-40">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white scale-110 shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-bold mt-1">{item.label}</span>
            </Link>
          );
        })}
        <div className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9 shadow-lg ring-2 ring-purple-500',
              },
            }}
          />
          <span className="text-xs font-bold mt-1 text-gray-600">
            Profile
          </span>
        </div>
      </div>
    </nav>
  );
}
