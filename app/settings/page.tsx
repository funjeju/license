'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase/client';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(getClientAuth());
    document.cookie = 'session=; path=/; max-age=0';
    router.push('/login');
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-h1 text-neutral-900 mb-8">설정</h1>

        <div className="flex flex-col gap-4">
          <div className="border border-neutral-200 rounded-lg p-5">
            <h2 className="text-h4 text-neutral-800 mb-1">계정</h2>
            <p className="text-body text-neutral-500 mb-4">로그아웃하거나 계정을 관리합니다.</p>
            <Button variant="outline" onClick={handleLogout} className="text-danger border-danger hover:bg-red-50">
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
