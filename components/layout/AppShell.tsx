'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import MobileTopBar from './MobileTopBar';

export default function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar currentPath={pathname} />
      </div>

      {/* Mobile top bar + drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <MobileTopBar onMenuClick={() => setMobileOpen(true)} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-[80%] z-50 md:hidden">
            <Sidebar currentPath={pathname} onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <main className="flex-1 min-w-0 md:ml-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
