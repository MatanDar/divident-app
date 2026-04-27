'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const navLinks = [
    { href: '/', label: 'לוח ראשי' },
    { href: '/new-call', label: '+ קריאה חדשה' },
  ];

  return (
    <header className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-800 font-bold text-sm">D</span>
          </div>
          <span className="text-xl font-bold tracking-wide">DIVIDENT</span>
          <span className="text-blue-300 text-sm hidden sm:block">מערכת קריאות שירות</span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-blue-200 text-xs hidden md:block truncate max-w-[160px]">
              {user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-colors"
          >
            יציאה
          </button>
        </div>
      </div>
    </header>
  );
}
