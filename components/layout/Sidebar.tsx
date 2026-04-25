'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Home,
  FolderOpen,
  FilePlus,
  Copyright,
  Tag,
  Layers,
  Lightbulb,
  Image,
  Package,
  BookOpen,
  Settings,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

const topNav: NavItem[] = [
  { label: '홈', href: '/dashboard', icon: Home },
  { label: '내 프로젝트', href: '/dashboard', icon: FolderOpen },
  { label: '새 프로젝트', href: '/register/new', icon: FilePlus },
];

const ipTypes: NavItem[] = [
  { label: '저작권', href: '/register/new?type=copyright', icon: Copyright },
  { label: '상표', href: '/register/new?type=trademark', icon: Tag },
  { label: '디자인권', href: '/register/new?type=design', icon: Layers },
  { label: '특허', href: '/register/new?type=patent', icon: Lightbulb },
];

const tools: NavItem[] = [
  { label: '도안 스튜디오', href: '#', icon: Image, disabled: true },
  { label: '서류 패키지', href: '#', icon: Package, disabled: true },
  { label: '가이드 & FAQ', href: '/guide', icon: BookOpen },
];

const bottom: NavItem[] = [
  { label: '설정', href: '/settings', icon: Settings },
];

interface SidebarProps {
  currentPath: string;
  onClose?: () => void;
}

function NavItemRow({
  item,
  currentPath,
  onClick,
}: {
  item: NavItem;
  currentPath: string;
  onClick?: () => void;
}) {
  const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href.split('?')[0]));
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <span className="flex items-center gap-2 h-10 px-4 rounded-md text-label text-neutral-400 cursor-default">
        <Icon className="w-4 h-4 flex-shrink-0" />
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 h-10 px-4 rounded-md text-label transition-colors duration-150',
        isActive
          ? 'bg-royal-50 text-royal border-l-2 border-royal pl-[14px]'
          : 'text-neutral-700 hover:bg-neutral-100'
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {item.label}
    </Link>
  );
}

export default function Sidebar({ currentPath, onClose }: SidebarProps) {
  return (
    <aside className="w-60 h-screen bg-neutral-50 border-r border-neutral-200 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 flex-shrink-0">
        <span className="text-h4 font-bold text-ink">IP-Assist</span>
      </div>

      <div className="flex-1 flex flex-col px-3 pb-3 gap-1">
        {/* Top nav */}
        <nav className="flex flex-col gap-0.5">
          {topNav.map((item) => (
            <NavItemRow key={item.href + item.label} item={item} currentPath={currentPath} onClick={onClose} />
          ))}
        </nav>

        <hr className="border-neutral-200 my-2" />

        {/* IP Types */}
        <div>
          <p className="text-caption text-neutral-500 px-4 mb-1 font-medium uppercase tracking-wide">IP 유형</p>
          <nav className="flex flex-col gap-0.5">
            {ipTypes.map((item) => (
              <NavItemRow key={item.href + item.label} item={item} currentPath={currentPath} onClick={onClose} />
            ))}
          </nav>
        </div>

        <hr className="border-neutral-200 my-2" />

        {/* Tools */}
        <nav className="flex flex-col gap-0.5">
          {tools.map((item) => (
            <NavItemRow key={item.href + item.label} item={item} currentPath={currentPath} onClick={onClose} />
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        <hr className="border-neutral-200 my-2" />

        {/* Bottom */}
        <nav className="flex flex-col gap-0.5">
          {bottom.map((item) => (
            <NavItemRow key={item.href + item.label} item={item} currentPath={currentPath} onClick={onClose} />
          ))}
          <button
            onClick={() => {/* logout handler added later */}}
            className="flex items-center gap-2 h-10 px-4 rounded-md text-label text-neutral-700 hover:bg-neutral-100 transition-colors duration-150 w-full text-left"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            로그아웃
          </button>
        </nav>
      </div>
    </aside>
  );
}
