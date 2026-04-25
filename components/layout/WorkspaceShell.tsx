'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white">
      {/* Mobile topbar — in-flow so it shrinks the content area cleanly */}
      <div className="md:hidden h-14 flex-shrink-0 bg-white border-b border-neutral-200 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5 text-neutral-700" />
        </button>
        <span className="text-h4 font-bold text-ink">IP-Assist</span>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar currentPath={pathname} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-[80%] z-50">
            <Sidebar currentPath={pathname} onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* Content area */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
