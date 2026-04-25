'use client';

import { Menu } from 'lucide-react';

export default function MobileTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center px-4 gap-3">
      <button
        onClick={onMenuClick}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu className="w-5 h-5 text-neutral-700" />
      </button>
      <span className="text-h4 font-bold text-ink">IP-Assist</span>
    </header>
  );
}
